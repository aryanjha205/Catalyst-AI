from pydantic import BaseModel, EmailStr
from typing import Optional
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
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
