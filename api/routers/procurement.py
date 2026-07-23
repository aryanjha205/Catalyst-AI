from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import auth
import schemas

router = APIRouter(
    prefix="/api/procurement",
    tags=["procurement"],
    responses={404: {"description": "Not found"}},
)

@router.get("/suppliers", response_model=List[schemas.SupplierResponse])
def get_suppliers(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.Supplier).filter(
        models.Supplier.company_id == current_user.company_id
    ).all()

@router.post("/suppliers", response_model=schemas.SupplierResponse)
def create_supplier(
    payload: schemas.SupplierCreate,
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    new_sup = models.Supplier(
        company_id=current_user.company_id,
        name=payload.name,
        email=payload.email,
        performance_score=payload.performance_score
    )
    db.add(new_sup)
    db.commit()
    db.refresh(new_sup)
    return new_sup

@router.get("/orders", response_model=List[schemas.PurchaseOrderResponse])
def get_purchase_orders(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.PurchaseOrder).filter(
        models.PurchaseOrder.company_id == current_user.company_id
    ).all()

@router.post("/orders", response_model=schemas.PurchaseOrderResponse)
def create_purchase_order(
    payload: schemas.PurchaseOrderCreate,
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    supplier = db.query(models.Supplier).filter(
        models.Supplier.id == payload.supplier_id,
        models.Supplier.company_id == current_user.company_id
    ).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")

    new_order = models.PurchaseOrder(
        company_id=current_user.company_id,
        supplier_id=payload.supplier_id,
        total_amount=payload.total_amount,
        status="Approved"
    )
    db.add(new_order)
    
    db.add(models.FinanceLedger(
        company_id=current_user.company_id,
        account_name="Inventory Asset",
        transaction_type="Debit",
        amount=payload.total_amount
    ))
    db.add(models.FinanceLedger(
        company_id=current_user.company_id,
        account_name="Accounts Payable",
        transaction_type="Credit",
        amount=payload.total_amount
    ))
    
    db.commit()
    db.refresh(new_order)
    return new_order

@router.get("/")
def get_all(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.PurchaseOrder).filter(
        models.PurchaseOrder.company_id == current_user.company_id
    ).all()
