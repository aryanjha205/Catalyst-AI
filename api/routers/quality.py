from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import auth
import schemas

router = APIRouter(
    prefix="/api/quality",
    tags=["quality"],
    responses={404: {"description": "Not found"}},
)

@router.get("/inspections", response_model=List[schemas.QAInspectionResponse])
def get_inspections(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.QAInspection).filter(
        models.QAInspection.company_id == current_user.company_id
    ).all()

@router.post("/inspections", response_model=schemas.QAInspectionResponse)
def create_inspection(
    payload: schemas.QAInspectionCreate,
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    new_insp = models.QAInspection(
        company_id=current_user.company_id,
        inspection_type=payload.inspection_type,
        notes=payload.notes,
        passed=payload.passed
    )
    db.add(new_insp)
    db.commit()
    db.refresh(new_insp)
    return new_insp

@router.get("/qc", response_model=List[schemas.QCBatchResponse])
def get_qc_batches(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.QCBatch).filter(
        models.QCBatch.company_id == current_user.company_id
    ).all()

@router.put("/qc/{batch_number}", response_model=schemas.QCBatchResponse)
def update_qc_batch_status(
    batch_number: str,
    payload: schemas.QCBatchUpdate,
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    batch = db.query(models.QCBatch).filter(
        models.QCBatch.batch_number == batch_number,
        models.QCBatch.company_id == current_user.company_id
    ).first()
    if not batch:
        raise HTTPException(status_code=404, detail="QC batch not found")

    batch.status = payload.status
    if payload.status == "Approved":
        batch.coa_generated = True
        
    db.commit()
    db.refresh(batch)
    return batch

@router.get("/")
def get_all(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.QAInspection).filter(
        models.QAInspection.company_id == current_user.company_id
    ).all()
