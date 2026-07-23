from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import auth
from pydantic import BaseModel

router = APIRouter(
    prefix="/api/inventory",
    tags=["inventory"],
    responses={404: {"description": "Not found"}},
)

# Minimal Schema for response
class ProductResponse(BaseModel):
    id: str
    product_code: str
    chemical_name: str
    cas_number: str
    current_stock: float

    class Config:
        from_attributes = True

@router.get("/", response_model=List[ProductResponse])
def get_inventory(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    # TENANT ISOLATION: Filter products by the current user's company_id
    products = db.query(models.Product).filter(
        models.Product.company_id == current_user.company_id
    ).all()
    return products

@router.post("/", response_model=ProductResponse)
def create_product(
    product_data: dict, # using dict for brevity in stub
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    # TENANT ISOLATION: Inject company_id securely on the backend
    new_product = models.Product(
        company_id=current_user.company_id,
        product_code=product_data.get("product_code", "UNKNOWN"),
        chemical_name=product_data.get("chemical_name", "Unnamed Chemical"),
        cas_number=product_data.get("cas_number", ""),
        current_stock=product_data.get("current_stock", 0.0),
        hazard_class=product_data.get("hazard_class", ""),
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product
