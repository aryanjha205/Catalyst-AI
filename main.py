from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import os
import json
import logging
import secrets
import smtplib
from datetime import datetime, timedelta
from email.message import EmailMessage
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import engine, Base, get_db, SessionLocal
import models
import schemas
import auth

# Import newly created routers
from api.routers import inventory, warehouse, production, lims, quality, sales, procurement, finance, ai, admin, platform

logger = logging.getLogger("chemerp")
platform_pin_attempts: dict[str, list[datetime]] = {}

def initialize_database() -> bool:
    """Create new tables and bring the original starter schema forward safely."""
    try:
        Base.metadata.create_all(bind=engine)
        # create_all does not add columns to existing Neon tables. PostgreSQL supports this idempotent migration.
        if engine.dialect.name == "postgresql":
            with engine.begin() as connection:
                connection.execute(text("ALTER TABLE companies ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE"))
                connection.execute(text("ALTER TABLE companies ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT FALSE"))
        return True
    except Exception:
        # Do not make the ASGI application unavailable merely because Neon is temporarily unreachable.
        logger.exception("Database initialization failed")
        return False
app = FastAPI(title="ChemERP API", version="1.0.0")
app.add_middleware(TrustedHostMiddleware, allowed_hosts=os.getenv("ALLOWED_HOSTS", "*").split(","))
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000", "http://127.0.0.1:8000", "https://chemix-six.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; script-src 'self' 'unsafe-inline'; img-src 'self' data:"
    return response

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
app.include_router(platform.router)

# Mount static files (CSS, JS, Images, HTML)
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/", response_class=HTMLResponse)
async def read_root():
    try:
        with open(os.path.join(static_dir, "index.html"), "r", encoding="utf-8") as f:
            content = f.read()
        return HTMLResponse(content=content)
    except FileNotFoundError:
        return HTMLResponse(content="<h1>Index not found. Please create static/index.html</h1>", status_code=404)

@app.get("/login", response_class=HTMLResponse)
async def read_login():
    try:
        with open(os.path.join(static_dir, "login.html"), "r", encoding="utf-8") as f:
            content = f.read()
        return HTMLResponse(content=content)
    except FileNotFoundError:
        return HTMLResponse(content="<h1>Login not found. Please create static/login.html</h1>", status_code=404)

@app.get("/register", response_class=HTMLResponse)
async def read_register():
    try:
        with open(os.path.join(static_dir, "register.html"), "r", encoding="utf-8") as f:
            content = f.read()
        return HTMLResponse(content=content)
    except FileNotFoundError:
        return HTMLResponse(content="<h1>Register not found. Please create static/register.html</h1>", status_code=404)

@app.get("/super-admin", response_class=HTMLResponse)
async def read_super_admin():
    with open(os.path.join(static_dir, "super_admin.html"), "r", encoding="utf-8") as file:
        return HTMLResponse(content=file.read())

@app.get("/super_admin", response_class=HTMLResponse, include_in_schema=False)
async def read_super_admin_legacy():
    return await read_super_admin()

@app.get("/admin", response_class=HTMLResponse, include_in_schema=False)
async def read_super_admin_shortcut():
    return await read_super_admin()

def ensure_platform_admin(db: Session) -> models.User | None:
    """Create the internal platform account used solely to issue protected admin tokens."""
    pin = os.getenv("SUPER_ADMIN_PIN")
    email = os.getenv("SUPER_ADMIN_EMAIL") or "platform-admin@chemerp.local"
    password = os.getenv("SUPER_ADMIN_PASSWORD") or secrets.token_urlsafe(32)
    if not pin and not (os.getenv("SUPER_ADMIN_EMAIL") and os.getenv("SUPER_ADMIN_PASSWORD")):
        logger.warning("Platform admin is not provisioned: set SUPER_ADMIN_PIN or email/password credentials")
        return None
    user = db.query(models.User).filter(models.User.email == email).first()
    if user:
        return user
    platform_company = db.query(models.Company).filter(models.Company.company_code == "CHEM-PLATFORM").first()
    if not platform_company:
        platform_company = models.Company(company_code="CHEM-PLATFORM", name="ChemERP Platform", owner_name="Platform Admin", email="platform@chemerp.local", mobile="", gst_number="", pan_number="", license_number="", address="", is_verified=True, is_approved=True)
        db.add(platform_company)
        db.flush()
    user = models.User(company_id=platform_company.id, email=email, hashed_password=auth.get_password_hash(password), full_name="Platform Super Admin", role="Super Admin")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@app.on_event("startup")
def provision_platform_admin() -> None:
    if not initialize_database():
        return
    db = SessionLocal()
    try:
        ensure_platform_admin(db)
    except Exception:
        logger.exception("Platform administrator provisioning failed")
    finally:
        db.close()

def _send_otp(email: str, otp: str) -> None:
    """Deliver OTP by an internal service or SMTP; never expose OTPs in API responses."""
    service_url = os.getenv("OTP_SERVICE_URL")
    if service_url:
        try:
            import urllib.request
            request = urllib.request.Request(service_url, data=json.dumps({"email": email, "otp": otp}).encode(), headers={"Content-Type": "application/json"}, method="POST")
            urllib.request.urlopen(request, timeout=8).close()
            return
        except OSError:
            logger.exception("OTP notification service failed; attempting SMTP fallback")

    host = os.getenv("SMTP_HOST")
    username = os.getenv("SMTP_USERNAME")
    password = os.getenv("SMTP_PASSWORD")
    if not all((host, username, password)):
        raise HTTPException(status_code=503, detail="Email verification is not configured. Contact the administrator.")
    message = EmailMessage()
    message["Subject"] = "Your ChemERP verification code"
    message["From"] = os.getenv("SMTP_FROM", username)
    message["To"] = email
    message.set_content(f"Your ChemERP verification code is {otp}. It expires in 5 minutes. Do not share this code.")
    try:
        port = int(os.getenv("SMTP_PORT", "465"))
        if port == 465:
            with smtplib.SMTP_SSL(host, port, timeout=15) as client:
                client.login(username, password)
                client.send_message(message)
        else:
            with smtplib.SMTP(host, port, timeout=15) as client:
                client.starttls()
                client.login(username, password)
                client.send_message(message)
    except (OSError, smtplib.SMTPException):
        logger.exception("SMTP OTP delivery failed")
        raise HTTPException(status_code=503, detail="Could not send the verification email. Try again later.")

def _create_verification(payload: schemas.RegistrationRequest, db: Session) -> None:
    existing = db.query(models.Company).filter(models.Company.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="A workspace already uses this email")
    previous = db.query(models.EmailVerification).filter(
        models.EmailVerification.email == payload.email,
        models.EmailVerification.verified_at.is_(None),
    ).order_by(models.EmailVerification.last_sent_at.desc()).first()
    if previous and datetime.utcnow() - previous.last_sent_at < timedelta(seconds=60):
        raise HTTPException(status_code=429, detail="Please wait before requesting another verification code")
    otp = f"{secrets.randbelow(1_000_000):06d}"
    verification = models.EmailVerification(
        email=payload.email,
        otp_hash=auth.get_password_hash(otp),
        expires_at=datetime.utcnow() + timedelta(minutes=5),
        payload=payload.model_dump_json(),
    )
    db.add(verification)
    db.commit()
    try:
        _send_otp(payload.email, otp)
    except HTTPException:
        db.delete(verification)
        db.commit()
        raise

@app.post("/api/register/request", status_code=status.HTTP_202_ACCEPTED)
def request_registration(payload: schemas.RegistrationRequest, db: Session = Depends(get_db)):
    _create_verification(payload, db)
    return {"message": "Verification code sent. It expires in five minutes."}

@app.post("/api/register/verify", response_model=schemas.CompanyResponse)
def verify_registration(payload: schemas.OTPVerification, db: Session = Depends(get_db)):
    verification = db.query(models.EmailVerification).filter(
        models.EmailVerification.email == payload.email,
        models.EmailVerification.verified_at.is_(None),
    ).order_by(models.EmailVerification.last_sent_at.desc()).first()
    if not verification or verification.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Verification code expired. Request a new one.")
    if verification.attempts >= 5:
        raise HTTPException(status_code=429, detail="Too many failed attempts. Request a new verification code.")
    verification.attempts += 1
    if not auth.verify_password(payload.otp, verification.otp_hash):
        db.commit()
        raise HTTPException(status_code=400, detail="Invalid verification code")
    data = schemas.RegistrationRequest.model_validate_json(verification.payload)
    company = models.Company(
        company_code=f"CHEM-{secrets.token_hex(3).upper()}", name=data.company_name,
        owner_name=data.owner_name, email=data.email, mobile=data.mobile,
        gst_number=data.gst_number, pan_number=data.pan_number,
        license_number=data.license_number, address=data.address, is_verified=True, is_approved=False,
    )
    db.add(company)
    db.flush()
    db.add(models.User(company_id=company.id, email=data.email, hashed_password=auth.get_password_hash(data.password),
                       full_name=data.owner_name, role="Company Admin"))
    db.add(models.Warehouse(company_id=company.id, name="Main Warehouse", location=data.address, capacity=0))
    db.add(models.CompanySetting(company_id=company.id, setting_key="inventory_valuation", setting_value="FEFO"))
    db.add(models.AuditLog(company_id=company.id, action="workspace_created", entity="company",
                           details="Company workspace initialized after email verification"))
    verification.verified_at = datetime.utcnow()
    db.commit()
    db.refresh(company)
    return company

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
    if not user.company.is_approved or not user.company.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your verified company workspace is awaiting platform approval.",
        )

    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email, "company_id": user.company_id, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "refresh_token": auth.create_refresh_token(
        {"sub": user.email, "company_id": user.company_id, "role": user.role}), "token_type": "bearer"}

@app.post("/api/platform/login", response_model=schemas.Token)
def platform_pin_login(payload: schemas.PlatformPinLogin, db: Session = Depends(get_db)):
    """PIN access is isolated to the platform dashboard and rate-limited per process."""
    # Covers serverless invocations or test clients that skip the ASGI lifespan hook.
    if not initialize_database():
        raise HTTPException(status_code=503, detail="Database is temporarily unavailable")
    pin = os.getenv("SUPER_ADMIN_PIN")
    if not pin:
        raise HTTPException(status_code=503, detail="Platform PIN login is not configured")
    now = datetime.utcnow()
    attempts = [timestamp for timestamp in platform_pin_attempts.get("platform", []) if now - timestamp < timedelta(minutes=15)]
    if len(attempts) >= 5:
        raise HTTPException(status_code=429, detail="Too many PIN attempts. Try again in 15 minutes.")
    if not secrets.compare_digest(payload.pin, pin):
        attempts.append(now)
        platform_pin_attempts["platform"] = attempts
        raise HTTPException(status_code=401, detail="Invalid Super Admin PIN")
    platform_pin_attempts.pop("platform", None)
    admin = ensure_platform_admin(db)
    if not admin:
        raise HTTPException(status_code=503, detail="Platform admin could not be provisioned")
    data = {"sub": admin.email, "company_id": admin.company_id, "role": admin.role}
    return {"access_token": auth.create_access_token(data, timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)),
            "refresh_token": auth.create_refresh_token(data), "token_type": "bearer"}

@app.post("/api/token/refresh", response_model=schemas.Token)
def refresh_access_token(request: schemas.RefreshRequest):
    from jose import JWTError, jwt
    try:
        payload = jwt.decode(request.refresh_token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        if payload.get("type") != "refresh":
            raise JWTError()
        data = {"sub": payload["sub"], "company_id": payload["company_id"], "role": payload["role"]}
    except (JWTError, KeyError):
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    return {"access_token": auth.create_access_token(data, timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)),
            "refresh_token": auth.create_refresh_token(data), "token_type": "bearer"}

@app.get("/api/users/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "ERP Backend is running"}
