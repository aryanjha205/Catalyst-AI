from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import auth
from pydantic import BaseModel

router = APIRouter(
    prefix="/api/warehouse",
    tags=["warehouse"],
    responses={404: {"description": "Not found"}},
)

class WarehouseResponse(BaseModel):
    id: str
    name: str
    location: str
    capacity: float

    class Config:
        from_attributes = True

@router.get("/", response_model=List[WarehouseResponse])
def get_warehouses(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    # TENANT ISOLATION
    warehouses = db.query(models.Warehouse).filter(
        models.Warehouse.company_id == current_user.company_id
    ).all()
    return warehouses

@router.post("/", response_model=WarehouseResponse)
def create_warehouse(
    warehouse_data: dict,
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    # TENANT ISOLATION
    new_warehouse = models.Warehouse(
        company_id=current_user.company_id,
        name=warehouse_data.get("name", "Main Warehouse"),
        location=warehouse_data.get("location", ""),
        capacity=warehouse_data.get("capacity", 0.0),
    )
    db.add(new_warehouse)
    db.commit()
    db.refresh(new_warehouse)
    return new_warehouse
