from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import auth
from pydantic import BaseModel
import schemas

router = APIRouter(
    prefix="/api/inventory",
    tags=["inventory"],
    responses={404: {"description": "Not found"}},
)

@router.get("/public", response_model=List[schemas.ProductResponse])
def get_public_inventory(db: Session = Depends(get_db)):
    # Returns all products publicly for the e-commerce storefront
    products = db.query(models.Product).all()
    return products

@router.get("/", response_model=List[schemas.ProductResponse])
def get_inventory(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    # TENANT ISOLATION: Filter products by the current user's company_id
    products = db.query(models.Product).filter(
        models.Product.company_id == current_user.company_id
    ).all()
    return products

@router.post("/", response_model=schemas.ProductResponse)
def create_product(
    product_data: schemas.ProductCreate,
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    # TENANT ISOLATION: Inject company_id securely on the backend
    new_product = models.Product(
        company_id=current_user.company_id,
        **product_data.model_dump(),
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

