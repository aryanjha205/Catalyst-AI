from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import auth
import schemas

router = APIRouter(
    prefix="/api/sales",
    tags=["sales"],
    responses={404: {"description": "Not found"}},
)

@router.get("/customers", response_model=List[schemas.CustomerResponse])
def get_customers(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.Customer).filter(
        models.Customer.company_id == current_user.company_id
    ).all()

@router.post("/customers", response_model=schemas.CustomerResponse)
def create_customer(
    payload: schemas.CustomerCreate,
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    new_cust = models.Customer(
        company_id=current_user.company_id,
        name=payload.name,
        email=payload.email,
        credit_limit=payload.credit_limit
    )
    db.add(new_cust)
    db.commit()
    db.refresh(new_cust)
    return new_cust

@router.get("/orders", response_model=List[schemas.SalesOrderResponse])
def get_sales_orders(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.SalesOrder).filter(
        models.SalesOrder.company_id == current_user.company_id
    ).all()

@router.post("/orders", response_model=schemas.SalesOrderResponse)
def create_sales_order(
    payload: schemas.SalesOrderCreate,
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    customer = db.query(models.Customer).filter(
        models.Customer.id == payload.customer_id,
        models.Customer.company_id == current_user.company_id
    ).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    if payload.total_amount > customer.credit_limit:
        raise HTTPException(status_code=400, detail=f"Sales order total amount of {payload.total_amount} exceeds customer credit limit of {customer.credit_limit}")

    new_order = models.SalesOrder(
        company_id=current_user.company_id,
        customer_id=payload.customer_id,
        total_amount=payload.total_amount,
        status="Confirmed"
    )
    db.add(new_order)
    
    db.add(models.FinanceLedger(
        company_id=current_user.company_id,
        account_name="Accounts Receivable",
        transaction_type="Debit",
        amount=payload.total_amount
    ))
    db.add(models.FinanceLedger(
        company_id=current_user.company_id,
        account_name="Sales Revenue",
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
    return db.query(models.SalesOrder).filter(
        models.SalesOrder.company_id == current_user.company_id
    ).all()
