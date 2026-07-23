from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import auth
import schemas

router = APIRouter(
    prefix="/api/production",
    tags=["production"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[schemas.ProductionOrderResponse])
def get_production_orders(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.ProductionOrder).filter(
        models.ProductionOrder.company_id == current_user.company_id
    ).all()

@router.post("/", response_model=schemas.ProductionOrderResponse)
def create_production_order(
    order_data: schemas.ProductionOrderCreate,
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    product = db.query(models.Product).filter(
        models.Product.id == order_data.product_id,
        models.Product.company_id == current_user.company_id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    formula = db.query(models.Formula).filter(
        models.Formula.product_id == product.id,
        models.Formula.company_id == current_user.company_id,
        models.Formula.is_approved == True
    ).first()
    if not formula:
        raise HTTPException(status_code=400, detail="No approved formula recipe found for this product. Please create and approve a formula first.")

    ingredients = db.query(models.FormulaIngredient).filter(
        models.FormulaIngredient.formula_id == formula.id
    ).all()

    for ing in ingredients:
        raw_material = db.query(models.Product).filter(models.Product.id == ing.ingredient_product_id).first()
        required_qty = (ing.percentage / 100.0) * order_data.quantity_planned
        if not raw_material or raw_material.current_stock < required_qty:
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient stock for raw material '{raw_material.chemical_name if raw_material else 'Unknown'}' (Requires {required_qty} kg, has {raw_material.current_stock if raw_material else 0} kg)"
            )

    for ing in ingredients:
        raw_material = db.query(models.Product).filter(models.Product.id == ing.ingredient_product_id).first()
        required_qty = (ing.percentage / 100.0) * order_data.quantity_planned
        raw_material.current_stock -= required_qty

    import secrets
    batch_num = order_data.batch_number or f"BATCH-{secrets.token_hex(4).upper()}"
    new_order = models.ProductionOrder(
        company_id=current_user.company_id,
        product_id=order_data.product_id,
        batch_number=batch_num,
        quantity_planned=order_data.quantity_planned,
        status="Planned"
    )
    db.add(new_order)
    
    db.add(models.QCBatch(
        company_id=current_user.company_id,
        batch_number=batch_num,
        status="Hold"
    ))
    
    db.commit()
    db.refresh(new_order)
    return new_order

@router.post("/orders/{order_id}/status")
def update_order_status(
    order_id: str,
    status: str, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    order = db.query(models.ProductionOrder).filter(
        models.ProductionOrder.id == order_id,
        models.ProductionOrder.company_id == current_user.company_id
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = status
    if status == "Completed":
        product = db.query(models.Product).filter(models.Product.id == order.product_id).first()
        if product:
            product.current_stock += order.quantity_planned
            
    db.commit()
    return {"message": f"Order status updated to {status}"}

@router.get("/formulas", response_model=List[schemas.FormulaResponse])
def get_formulas(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.Formula).filter(
        models.Formula.company_id == current_user.company_id
    ).all()

@router.post("/formulas", response_model=schemas.FormulaResponse)
def create_formula(
    formula_data: schemas.FormulaCreate,
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    product = db.query(models.Product).filter(
        models.Product.id == formula_data.product_id,
        models.Product.company_id == current_user.company_id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Finished product not found")

    pct_sum = sum(ing.percentage for ing in formula_data.ingredients)
    if abs(pct_sum - 100.0) > 0.01:
        raise HTTPException(status_code=400, detail="Ingredient percentages must sum up to exactly 100%")

    new_formula = models.Formula(
        company_id=current_user.company_id,
        product_id=formula_data.product_id,
        name=formula_data.name,
        version=formula_data.version or "1.0.0",
        mixing_sequence=formula_data.mixing_sequence,
        process_parameters=formula_data.process_parameters,
        is_approved=True
    )
    db.add(new_formula)
    db.flush()

    for ing in formula_data.ingredients:
        ing_prod = db.query(models.Product).filter(
            models.Product.id == ing.ingredient_product_id,
            models.Product.company_id == current_user.company_id
        ).first()
        if not ing_prod:
            raise HTTPException(status_code=400, detail=f"Ingredient product '{ing.ingredient_product_id}' not found")
        
        db.add(models.FormulaIngredient(
            formula_id=new_formula.id,
            ingredient_product_id=ing.ingredient_product_id,
            percentage=ing.percentage
        ))
    
    db.commit()
    db.refresh(new_formula)
    return new_formula
