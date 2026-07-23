from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import auth
import schemas

router = APIRouter(
    prefix="/api/warehouse",
    tags=["warehouse"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[schemas.WarehouseResponse])
def get_warehouses(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.Warehouse).filter(
        models.Warehouse.company_id == current_user.company_id
    ).all()

@router.post("/", response_model=schemas.WarehouseResponse)
def create_warehouse(
    warehouse_data: schemas.WarehouseCreate,
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    new_warehouse = models.Warehouse(
        company_id=current_user.company_id,
        **warehouse_data.model_dump(),
    )
    db.add(new_warehouse)
    db.commit()
    db.refresh(new_warehouse)
    return new_warehouse

@router.get("/zones", response_model=List[schemas.ZoneResponse])
def get_zones(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.WarehouseZone).filter(
        models.WarehouseZone.company_id == current_user.company_id
    ).all()

@router.post("/zones", response_model=schemas.ZoneResponse)
def create_zone(
    zone_data: schemas.ZoneCreate,
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    wh = db.query(models.Warehouse).filter(
        models.Warehouse.id == zone_data.warehouse_id,
        models.Warehouse.company_id == current_user.company_id
    ).first()
    if not wh:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    new_zone = models.WarehouseZone(
        company_id=current_user.company_id,
        warehouse_id=zone_data.warehouse_id,
        name=zone_data.name
    )
    db.add(new_zone)
    db.commit()
    db.refresh(new_zone)
    return new_zone

@router.get("/racks", response_model=List[schemas.RackResponse])
def get_racks(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.WarehouseRack).filter(
        models.WarehouseRack.company_id == current_user.company_id
    ).all()

@router.post("/racks", response_model=schemas.RackResponse)
def create_rack(
    rack_data: schemas.RackCreate,
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    zone = db.query(models.WarehouseZone).filter(
        models.WarehouseZone.id == rack_data.zone_id,
        models.WarehouseZone.company_id == current_user.company_id
    ).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    new_rack = models.WarehouseRack(
        company_id=current_user.company_id,
        zone_id=rack_data.zone_id,
        name=rack_data.name
    )
    db.add(new_rack)
    db.commit()
    db.refresh(new_rack)
    return new_rack

@router.get("/bins", response_model=List[schemas.BinResponse])
def get_bins(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.WarehouseBin).filter(
        models.WarehouseBin.company_id == current_user.company_id
    ).all()

@router.post("/bins", response_model=schemas.BinResponse)
def create_bin(
    bin_data: schemas.BinCreate,
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    rack = db.query(models.WarehouseRack).filter(
        models.WarehouseRack.id == bin_data.rack_id,
        models.WarehouseRack.company_id == current_user.company_id
    ).first()
    if not rack:
        raise HTTPException(status_code=404, detail="Rack not found")
    new_bin = models.WarehouseBin(
        company_id=current_user.company_id,
        rack_id=bin_data.rack_id,
        name=bin_data.name,
        barcode=bin_data.barcode or f"BIN-{bin_data.name.upper()}"
    )
    db.add(new_bin)
    db.commit()
    db.refresh(new_bin)
    return new_bin

@router.post("/transfer")
def transfer_stock(
    transfer_data: schemas.StockTransferCreate,
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    from_bin = db.query(models.WarehouseBin).filter(
        models.WarehouseBin.id == transfer_data.from_bin_id,
        models.WarehouseBin.company_id == current_user.company_id
    ).first()
    to_bin = db.query(models.WarehouseBin).filter(
        models.WarehouseBin.id == transfer_data.to_bin_id,
        models.WarehouseBin.company_id == current_user.company_id
    ).first()
    product = db.query(models.Product).filter(
        models.Product.id == transfer_data.product_id,
        models.Product.company_id == current_user.company_id
    ).first()

    if not from_bin or not to_bin or not product:
        raise HTTPException(status_code=404, detail="Product or Bins not found")

    loc_from = db.query(models.ProductLocation).filter(
        models.ProductLocation.product_id == product.id,
        models.ProductLocation.bin_id == from_bin.id,
        models.ProductLocation.company_id == current_user.company_id
    ).first()

    if not loc_from or loc_from.quantity < transfer_data.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock in source bin")

    loc_to = db.query(models.ProductLocation).filter(
        models.ProductLocation.product_id == product.id,
        models.ProductLocation.bin_id == to_bin.id,
        models.ProductLocation.company_id == current_user.company_id
    ).first()

    loc_from.quantity -= transfer_data.quantity
    if loc_to:
        loc_to.quantity += transfer_data.quantity
    else:
        loc_to = models.ProductLocation(
            company_id=current_user.company_id,
            product_id=product.id,
            bin_id=to_bin.id,
            quantity=transfer_data.quantity
        )
        db.add(loc_to)

    movement = models.StockTransfer(
        company_id=current_user.company_id,
        product_id=product.id,
        quantity=transfer_data.quantity,
        from_bin_id=from_bin.id,
        to_bin_id=to_bin.id
    )
    db.add(movement)
    db.commit()
    return {"message": "Stock transfer completed successfully"}
