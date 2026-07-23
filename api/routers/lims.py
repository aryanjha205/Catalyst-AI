from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import auth
import schemas

router = APIRouter(
    prefix="/api/lims",
    tags=["lims"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[schemas.LaboratoryTestResponse])
def get_all(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.LaboratoryTest).filter(
        models.LaboratoryTest.company_id == current_user.company_id
    ).all()

@router.post("/", response_model=schemas.LaboratoryTestResponse)
def create_sample(
    payload: schemas.LaboratoryTestCreate,
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    new_test = models.LaboratoryTest(
        company_id=current_user.company_id,
        sample_id=payload.sample_id,
        test_type=payload.test_type,
        result_value=payload.result_value or "Pending",
        status="Pending"
    )
    db.add(new_test)
    db.commit()
    db.refresh(new_test)
    return new_test

@router.put("/{test_id}", response_model=schemas.LaboratoryTestResponse)
def update_test_result(
    test_id: str,
    payload: schemas.LaboratoryTestUpdate,
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    test = db.query(models.LaboratoryTest).filter(
        models.LaboratoryTest.id == test_id,
        models.LaboratoryTest.company_id == current_user.company_id
    ).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test sample not found")

    test.result_value = payload.result_value
    test.status = payload.status
    
    if payload.status == "Approved":
        coa_doc = models.Document(
            company_id=current_user.company_id,
            title=f"COA for Sample {test.sample_id}",
            file_url=f"/static/uploads/coa_{test.sample_id}.pdf",
            document_type="COA"
        )
        db.add(coa_doc)
        
    db.commit()
    db.refresh(test)
    return test
