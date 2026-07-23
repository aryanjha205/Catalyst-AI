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
    molecular_formula: Optional[str] = None
    molecular_weight: Optional[float] = None
    purity: Optional[str] = None
    grade: Optional[str] = None
    density: Optional[str] = None
    hazard_class: Optional[str] = None
    storage_temperature: Optional[str] = None
    shelf_life_days: Optional[int] = None
    purchase_price: float = 0.0
    selling_price: float = 0.0
    current_stock: float = 0.0
    safety_stock: float = 0.0
    reorder_level: float = 0.0
    category: Literal["Raw Material", "Finished Product", "Semi-Finished Product", "Packaging Material", "Consumable", "Laboratory Chemical"] = "Raw Material"

class ProductResponse(BaseModel):
    id: str
    product_code: str
    chemical_name: str
    cas_number: Optional[str] = None
    molecular_formula: Optional[str] = None
    molecular_weight: Optional[float] = None
    purity: Optional[str] = None
    grade: Optional[str] = None
    density: Optional[str] = None
    hazard_class: Optional[str] = None
    storage_temperature: Optional[str] = None
    shelf_life_days: Optional[int] = None
    purchase_price: float
    selling_price: float
    current_stock: float
    safety_stock: float
    reorder_level: float
    category: str
    created_at: datetime

    class Config:
        from_attributes = True


class WarehouseCreate(BaseModel):
    name: str
    location: str = ""
    capacity: float = 0

class WarehouseResponse(BaseModel):
    id: str
    name: str
    location: str
    capacity: float

    class Config:
        from_attributes = True


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

class FormulaIngredientSchema(BaseModel):
    ingredient_product_id: str
    percentage: float

class FormulaCreate(BaseModel):
    product_id: str
    name: str
    version: Optional[str] = "1.0.0"
    mixing_sequence: Optional[str] = ""
    process_parameters: Optional[str] = ""
    ingredients: list[FormulaIngredientSchema]

class FormulaResponse(BaseModel):
    id: str
    product_id: str
    name: str
    version: str
    mixing_sequence: Optional[str] = None
    process_parameters: Optional[str] = None
    is_approved: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ProductionOrderCreate(BaseModel):
    product_id: str
    quantity_planned: float
    batch_number: Optional[str] = None

class ProductionOrderResponse(BaseModel):
    id: str
    product_id: str
    batch_number: str
    quantity_planned: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class LaboratoryTestCreate(BaseModel):
    sample_id: str
    test_type: str # pH, Density, Purity, Moisture, Viscosity, Conductivity, Color Testing
    result_value: Optional[str] = None

class LaboratoryTestUpdate(BaseModel):
    result_value: str
    status: Literal["Pending", "Approved", "Rejected"] = "Pending"

class LaboratoryTestResponse(BaseModel):
    id: str
    sample_id: str
    test_type: str
    result_value: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class QAInspectionCreate(BaseModel):
    inspection_type: Literal["Incoming", "In-Process", "Final"]
    notes: Optional[str] = ""
    passed: bool

class QAInspectionResponse(BaseModel):
    id: str
    inspection_type: str
    notes: Optional[str] = None
    passed: bool
    created_at: datetime

    class Config:
        from_attributes = True

class QCBatchUpdate(BaseModel):
    status: Literal["Hold", "Approved", "Rejected"]

class QCBatchResponse(BaseModel):
    id: str
    batch_number: str
    status: str
    coa_generated: bool
    created_at: datetime

    class Config:
        from_attributes = True

class CustomerCreate(BaseModel):
    name: str
    email: EmailStr
    credit_limit: float = 0.0

class CustomerResponse(BaseModel):
    id: str
    name: str
    email: str
    credit_limit: float
    created_at: datetime

    class Config:
        from_attributes = True

class SupplierCreate(BaseModel):
    name: str
    email: EmailStr
    performance_score: float = 5.0

class SupplierResponse(BaseModel):
    id: str
    name: str
    email: str
    performance_score: float
    created_at: datetime

    class Config:
        from_attributes = True

class SalesOrderCreate(BaseModel):
    customer_id: str
    total_amount: float

class SalesOrderResponse(BaseModel):
    id: str
    customer_id: str
    total_amount: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class PurchaseOrderCreate(BaseModel):
    supplier_id: str
    total_amount: float

class PurchaseOrderResponse(BaseModel):
    id: str
    supplier_id: str
    total_amount: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class FinanceLedgerCreate(BaseModel):
    account_name: str
    transaction_type: Literal["Credit", "Debit"]
    amount: float

class FinanceLedgerResponse(BaseModel):
    id: str
    account_name: str
    transaction_type: str
    amount: float
    created_at: datetime

    class Config:
        from_attributes = True

class AIChatRequest(BaseModel):
    message: str

class ZoneCreate(BaseModel):
    warehouse_id: str
    name: str

class ZoneResponse(BaseModel):
    id: str
    warehouse_id: str
    name: str
    created_at: datetime
    class Config: from_attributes = True

class RackCreate(BaseModel):
    zone_id: str
    name: str

class RackResponse(BaseModel):
    id: str
    zone_id: str
    name: str
    created_at: datetime
    class Config: from_attributes = True

class BinCreate(BaseModel):
    rack_id: str
    name: str
    barcode: Optional[str] = None

class BinResponse(BaseModel):
    id: str
    rack_id: str
    name: str
    barcode: Optional[str] = None
    created_at: datetime
    class Config: from_attributes = True

class StockTransferCreate(BaseModel):
    product_id: str
    quantity: float
    from_bin_id: str
    to_bin_id: str

class ChemicalSuggestRequest(BaseModel):
    name: str

class ChemicalSuggestResponse(BaseModel):
    chemical_name: str
    cas_number: Optional[str] = None
    molecular_formula: Optional[str] = None
    molecular_weight: Optional[float] = None
    hazard_class: Optional[str] = None
    density: Optional[str] = None

class AIForecastResponse(BaseModel):
    predicted_demand_kg: float
    confidence_score: float
    safety_stock_recommendation: float
    explanation: str

class AIProductionOptimizeResponse(BaseModel):
    optimal_mixing_sequence: str
    suggested_machine_id: Optional[str] = None
    efficiency_score: float
    recommendation_notes: str

class AIFinanceAuditResponse(BaseModel):
    risk_score: float
    flagged_entries_count: int
    suggestions: list[str]




