from fastapi import FastAPI, Depends, Request, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
import os
import secrets
from datetime import timedelta
from sqlalchemy.orm import Session

from database import engine, Base, get_db
import models
import schemas
import auth

# Import newly created routers
from api.routers import inventory, warehouse, production, lims, quality, sales, procurement, finance, ai, admin

# Create db tables if they don't exist yet
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Chemical Industry ERP API")

# Include routers
app.include_router(inventory.router)
app.include_router(warehouse.router)
app.include_router(production.router)
app.include_router(lims.router)
app.include_router(quality.router)
app.include_router(sales.router)
app.include_router(procurement.router)
app.include_router(finance.router)
app.include_router(ai.router)
app.include_router(admin.router)

# Mount static files (CSS, JS, Images, HTML)
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def read_root():
    try:
        with open("static/index.html", "r", encoding="utf-8") as f:
            content = f.read()
        return HTMLResponse(content=content)
    except FileNotFoundError:
        return HTMLResponse(content="<h1>Index not found. Please create static/index.html</h1>", status_code=404)

@app.get("/login", response_class=HTMLResponse)
async def read_login():
    try:
        with open("static/login.html", "r", encoding="utf-8") as f:
            content = f.read()
        return HTMLResponse(content=content)
    except FileNotFoundError:
        return HTMLResponse(content="<h1>Login not found. Please create static/login.html</h1>", status_code=404)

@app.get("/register", response_class=HTMLResponse)
async def read_register():
    try:
        with open("static/register.html", "r", encoding="utf-8") as f:
            content = f.read()
        return HTMLResponse(content=content)
    except FileNotFoundError:
        return HTMLResponse(content="<h1>Register not found. Please create static/register.html</h1>", status_code=404)

@app.get("/super_admin", response_class=HTMLResponse)
async def read_super_admin():
    try:
        with open("static/super_admin.html", "r", encoding="utf-8") as f:
            content = f.read()
        return HTMLResponse(content=content)
    except FileNotFoundError:
        return HTMLResponse(content="<h1>Super Admin not found. Please create static/super_admin.html</h1>", status_code=404)


@app.post("/api/register", response_model=schemas.CompanyResponse)
def register_company(company: schemas.CompanyCreate, db: Session = Depends(get_db)):
    # Check if email exists
    existing_company = db.query(models.Company).filter(models.Company.email == company.email).first()
    if existing_company:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Generate unique company code
    company_code = f"CHEM-{secrets.token_hex(3).upper()}"
    
    new_company = models.Company(
        company_code=company_code,
        name=company.company_name,
        owner_name=company.owner_name,
        email=company.email,
        mobile=company.mobile,
        gst_number=company.gst_number,
        pan_number=company.pan_number,
        license_number=company.license_number,
        address=company.address
    )
    db.add(new_company)
    db.commit()
    db.refresh(new_company)

    # Create Super Admin User for this company
    hashed_pwd = auth.get_password_hash(company.password)
    admin_user = models.User(
        company_id=new_company.id,
        email=company.email,
        hashed_password=hashed_pwd,
        full_name=company.owner_name,
        role="Super Admin"
    )
    db.add(admin_user)
    db.commit()

    return new_company

@app.post("/api/login", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if company is approved
    if not user.company.is_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Company registration is pending Super Admin approval.",
        )

    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email, "company_id": user.company_id, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

from pydantic import BaseModel

class ApprovalRequest(BaseModel):
    pin: str
    company_code: str

@app.post("/api/approve_company")
def approve_company(req: ApprovalRequest, db: Session = Depends(get_db)):
    # Verify Super Admin PIN
    SUPER_ADMIN_PIN = os.getenv("SUPER_ADMIN_PIN", "70458")
    if req.pin != SUPER_ADMIN_PIN:
        raise HTTPException(status_code=403, detail="Invalid Super Admin PIN")
    
    company = db.query(models.Company).filter(models.Company.company_code == req.company_code).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    company.is_approved = True
    db.commit()
    return {"message": f"Company {company.name} ({company.company_code}) has been approved successfully."}

@app.get("/api/users/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "ERP Backend is running"}
