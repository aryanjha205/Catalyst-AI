from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal
from datetime import datetime

class CompanyCreate(BaseModel):
    company_name: str
    owner_name: str
    email: EmailStr
    mobile: str
    gst_number: str
    pan_number: str
    license_number: str
    address: str
    password: str

class CompanyResponse(BaseModel):
    id: str
    company_code: str
    name: str
    owner_name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str

class UserResponse(BaseModel):
    id: str
    company_id: str
    email: str
    full_name: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class RegistrationRequest(CompanyCreate):
    pass

class OTPVerification(BaseModel):
    email: EmailStr
    otp: str

class RefreshRequest(BaseModel):
    refresh_token: str

class ProductCreate(BaseModel):
    product_code: str
    chemical_name: str
    cas_number: Optional[str] = None
    category: Literal["Raw Material", "Finished Product", "Semi-Finished Product", "Packaging Material", "Consumable", "Laboratory Chemical"] = "Raw Material"
    current_stock: float = 0
    safety_stock: float = 0
    reorder_level: float = 0
    hazard_class: Optional[str] = None

class WarehouseCreate(BaseModel):
    name: str
    location: str = ""
    capacity: float = 0

class CompanyApproval(BaseModel):
    reason: str | None = Field(default=None, max_length=500)

class PlatformPinLogin(BaseModel):
    pin: str = Field(min_length=4, max_length=64)

class PendingCompanyResponse(BaseModel):
    id: str
    company_code: str
    name: str
    owner_name: str
    email: str
    mobile: str
    gst_number: str
    license_number: str
    address: str
    created_at: datetime

    class Config:
        from_attributes = True
