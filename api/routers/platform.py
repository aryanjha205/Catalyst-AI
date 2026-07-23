from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import auth
import models
import schemas
from database import get_db

router = APIRouter(prefix="/api/platform", tags=["platform administration"])

@router.get("/companies", response_model=list[schemas.PendingCompanyResponse])
def list_pending_companies(
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.get_platform_admin),
):
    return db.query(models.Company).filter(
        models.Company.is_verified.is_(True),
        models.Company.is_approved.is_(False),
        models.Company.is_active.is_(True),
    ).order_by(models.Company.created_at.asc()).all()

@router.get("/summary")
def platform_summary(
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.get_platform_admin),
):
    return {
        "pending": db.query(models.Company).filter(models.Company.is_verified.is_(True), models.Company.is_approved.is_(False), models.Company.is_active.is_(True)).count(),
        "approved": db.query(models.Company).filter(models.Company.is_approved.is_(True), models.Company.company_code != "CHEM-PLATFORM").count(),
        "rejected": db.query(models.Company).filter(models.Company.is_active.is_(False)).count(),
    }

def _company_for_review(company_id: str, db: Session) -> models.Company:
    company = db.query(models.Company).filter(
        models.Company.id == company_id,
        models.Company.is_verified.is_(True),
        models.Company.company_code != "CHEM-PLATFORM",
    ).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company

@router.post("/companies/{company_id}/approve")
def approve_company(
    company_id: str,
    body: schemas.CompanyApproval,
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.get_platform_admin),
):
    company = _company_for_review(company_id, db)
    company.is_approved = True
    company.is_active = True
    db.add(models.AuditLog(company_id=company.id, user_id=admin.id, action="company_approved", entity="company", details=body.reason or "Approved by platform administrator"))
    db.commit()
    return {"message": f"{company.name} is approved"}

@router.post("/companies/{company_id}/reject")
def reject_company(
    company_id: str,
    body: schemas.CompanyApproval,
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.get_platform_admin),
):
    company = _company_for_review(company_id, db)
    company.is_approved = False
    company.is_active = False
    db.add(models.AuditLog(company_id=company.id, user_id=admin.id, action="company_rejected", entity="company", details=body.reason or "Rejected by platform administrator"))
    db.commit()
    return {"message": f"{company.name} is rejected"}
