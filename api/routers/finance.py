from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import auth
import schemas

router = APIRouter(
    prefix="/api/finance",
    tags=["finance"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[schemas.FinanceLedgerResponse])
def get_all(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.FinanceLedger).filter(
        models.FinanceLedger.company_id == current_user.company_id
    ).all()

@router.post("/", response_model=schemas.FinanceLedgerResponse)
def post_transaction(
    payload: schemas.FinanceLedgerCreate,
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    entry = models.FinanceLedger(
        company_id=current_user.company_id,
        account_name=payload.account_name,
        transaction_type=payload.transaction_type,
        amount=payload.amount
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    entries = db.query(models.FinanceLedger).filter(
        models.FinanceLedger.company_id == current_user.company_id
    ).all()
    
    total_debits = sum(e.amount for e in entries if e.transaction_type == "Debit")
    total_credits = sum(e.amount for e in entries if e.transaction_type == "Credit")
    net_income = total_credits - total_debits
    
    return {
        "total_debits": total_debits,
        "total_credits": total_credits,
        "net_income": net_income,
        "currency": "USD"
    }
