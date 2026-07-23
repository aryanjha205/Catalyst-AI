from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Company(Base):
    __tablename__ = "companies"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    company_code = Column(String, unique=True, index=True) # e.g. CHEM-X8A7K3
    name = Column(String, index=True)
    owner_name = Column(String)
    email = Column(String, unique=True, index=True)
    mobile = Column(String)
    gst_number = Column(String)
    pan_number = Column(String)
    license_number = Column(String)
    address = Column(String)
    is_active = Column(Boolean, default=True)
    is_approved = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="company")

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    email = Column(String, index=True, nullable=False)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="users")

    __table_args__ = (UniqueConstraint("company_id", "email", name="uq_user_company_email"),)

class EmailVerification(Base):
    __tablename__ = "email_verifications"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, nullable=False, index=True)
    otp_hash = Column(String, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    attempts = Column(Integer, default=0, nullable=False)
    last_sent_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    payload = Column(Text, nullable=False)
    verified_at = Column(DateTime, nullable=True)

# 1. Chemical Inventory (Products & Raw Materials)
class Product(Base):
    __tablename__ = "products"
    id = Column(String, primary_key=True, default=generate_uuid)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    product_code = Column(String, index=True)
    barcode = Column(String)
    qr_code = Column(String)
    cas_number = Column(String)
    chemical_name = Column(String)
    molecular_formula = Column(String)
    molecular_weight = Column(Float)
    purity = Column(String)
    grade = Column(String)
    density = Column(String)
    hazard_class = Column(String)
    storage_temperature = Column(String)
    shelf_life_days = Column(Integer)
    expiry_date = Column(DateTime)
    batch_number = Column(String)
    supplier_id = Column(String, ForeignKey("suppliers.id"), nullable=True)
    purchase_price = Column(Float, default=0.0)
    selling_price = Column(Float, default=0.0)
    current_stock = Column(Float, default=0.0)
    safety_stock = Column(Float, default=0.0)
    reorder_level = Column(Float, default=0.0)
    category = Column(String) # Raw Material, Finished Product, Semi-Finished, Packaging, Consumables, Lab Chemicals
    created_at = Column(DateTime, default=datetime.utcnow)

# 2. Warehouse Management
class Warehouse(Base):
    __tablename__ = "warehouses"
    id = Column(String, primary_key=True, default=generate_uuid)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    name = Column(String)
    location = Column(String)
    capacity = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

class WarehouseZone(Base):
    __tablename__ = "warehouse_zones"
    id = Column(String, primary_key=True, default=generate_uuid)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    warehouse_id = Column(String, ForeignKey("warehouses.id"), nullable=False)
    name = Column(String) # e.g., Flammable Zone, Cold Storage
    created_at = Column(DateTime, default=datetime.utcnow)

class WarehouseRack(Base):
    __tablename__ = "warehouse_racks"
    id = Column(String, primary_key=True, default=generate_uuid)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    zone_id = Column(String, ForeignKey("warehouse_zones.id"), nullable=False)
    name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class WarehouseBin(Base):
    __tablename__ = "warehouse_bins"
    id = Column(String, primary_key=True, default=generate_uuid)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    rack_id = Column(String, ForeignKey("warehouse_racks.id"), nullable=False)
    name = Column(String)
    barcode = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

# Product Location Link
class ProductLocation(Base):
    __tablename__ = "product_locations"
    id = Column(String, primary_key=True, default=generate_uuid)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    bin_id = Column(String, ForeignKey("warehouse_bins.id"), nullable=False)
    quantity = Column(Float, default=0.0)
    batch_number = Column(String)
    expiry_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

# Inventory Movements
class GoodsReceipt(Base):
    __tablename__ = "goods_receipts"
    id = Column(String, primary_key=True, default=generate_uuid)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    quantity = Column(Float)
    bin_id = Column(String, ForeignKey("warehouse_bins.id"), nullable=False)
    receipt_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

class GoodsIssue(Base):
    __tablename__ = "goods_issues"
    id = Column(String, primary_key=True, default=generate_uuid)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    quantity = Column(Float)
    bin_id = Column(String, ForeignKey("warehouse_bins.id"), nullable=False)
    issue_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

class StockTransfer(Base):
    __tablename__ = "stock_transfers"
    id = Column(String, primary_key=True, default=generate_uuid)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    quantity = Column(Float)
    from_bin_id = Column(String, ForeignKey("warehouse_bins.id"), nullable=False)
    to_bin_id = Column(String, ForeignKey("warehouse_bins.id"), nullable=False)
    transfer_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

# 3. Production
class ProductionOrder(Base):
    __tablename__ = "production_orders"
    id = Column(String, primary_key=True, default=generate_uuid)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    product_id = Column(String, ForeignKey("products.id"))
    batch_number = Column(String, index=True)
    quantity_planned = Column(Float)
    status = Column(String) # Planned, In Progress, Completed
    created_at = Column(DateTime, default=datetime.utcnow)

# 4. Laboratory (LIMS)
class LaboratoryTest(Base):
    __tablename__ = "laboratory_tests"
    id = Column(String, primary_key=True, default=generate_uuid)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    sample_id = Column(String)
    test_type = Column(String) # pH, Density, Purity
    result_value = Column(String)
    status = Column(String) # Pending, Approved, Rejected
    created_at = Column(DateTime, default=datetime.utcnow)

# 5. QA
class QAInspection(Base):
    __tablename__ = "qa_inspections"
    id = Column(String, primary_key=True, default=generate_uuid)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    inspection_type = Column(String) # Incoming, In-Process, Final
    notes = Column(Text)
    passed = Column(Boolean)
    created_at = Column(DateTime, default=datetime.utcnow)

# 6. QC
class QCBatch(Base):
    __tablename__ = "qc_batches"
    id = Column(String, primary_key=True, default=generate_uuid)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    batch_number = Column(String)
    status = Column(String) # Hold, Approved, Rejected
    coa_generated = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

# 7. Suppliers
class Supplier(Base):
    __tablename__ = "suppliers"
    id = Column(String, primary_key=True, default=generate_uuid)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    name = Column(String)
    email = Column(String)
    performance_score = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

# 8. Customers
class Customer(Base):
    __tablename__ = "customers"
    id = Column(String, primary_key=True, default=generate_uuid)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    name = Column(String)
    email = Column(String)
    credit_limit = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

# 9. Sales
class SalesOrder(Base):
    __tablename__ = "sales_orders"
    id = Column(String, primary_key=True, default=generate_uuid)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    customer_id = Column(String, ForeignKey("customers.id"))
    total_amount = Column(Float)
    status = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

# 10. Purchases
class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    id = Column(String, primary_key=True, default=generate_uuid)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    supplier_id = Column(String, ForeignKey("suppliers.id"))
    total_amount = Column(Float)
    status = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

# 11. Finance
class FinanceLedger(Base):
    __tablename__ = "finance_ledgers"
    id = Column(String, primary_key=True, default=generate_uuid)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    account_name = Column(String)
    transaction_type = Column(String) # Credit, Debit
    amount = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

# 12. Documents
class Document(Base):
    __tablename__ = "documents"
    id = Column(String, primary_key=True, default=generate_uuid)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    title = Column(String)
    file_url = Column(String)
    document_type = Column(String) # MSDS, COA, Invoice
    created_at = Column(DateTime, default=datetime.utcnow)

# 13. Reports
class Report(Base):
    __tablename__ = "reports"
    id = Column(String, primary_key=True, default=generate_uuid)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    report_name = Column(String)
    generated_by = Column(String, ForeignKey("users.id"))
    file_url = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

# 14. AI Conversations
class AIConversation(Base):
    __tablename__ = "ai_conversations"
    id = Column(String, primary_key=True, default=generate_uuid)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    prompt = Column(Text)
    response = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

# 15. Settings
class CompanySetting(Base):
    __tablename__ = "company_settings"
    id = Column(String, primary_key=True, default=generate_uuid)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    setting_key = Column(String)
    setting_value = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

# 16. Audit Logs
class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(String, primary_key=True, default=generate_uuid)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    action = Column(String)
    entity = Column(String)
    details = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

# 17. Formulas & Recipes
class Formula(Base):
    __tablename__ = "formulas"
    id = Column(String, primary_key=True, default=generate_uuid)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    name = Column(String)
    version = Column(String, default="1.0.0")
    mixing_sequence = Column(Text)
    process_parameters = Column(Text)
    is_approved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class FormulaIngredient(Base):
    __tablename__ = "formula_ingredients"
    id = Column(String, primary_key=True, default=generate_uuid)
    formula_id = Column(String, ForeignKey("formulas.id"), nullable=False)
    ingredient_product_id = Column(String, ForeignKey("products.id"), nullable=False)
    percentage = Column(Float)

# 18. Plants & Equipment
class Machine(Base):
    __tablename__ = "machines"
    id = Column(String, primary_key=True, default=generate_uuid)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    name = Column(String)
    status = Column(String)
    last_maintenance = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

