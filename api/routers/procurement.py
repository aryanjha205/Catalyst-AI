from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models
import auth

router = APIRouter(
    prefix="/api/procurement",
    tags=["procurement"],
    responses={404: {"description": "Not found"}},
)

@router.get("/")
def get_all(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    # TENANT ISOLATION
    items = db.query(models.PurchaseOrder).filter(
        models.PurchaseOrder.company_id == current_user.company_id
    ).all()
    return items
