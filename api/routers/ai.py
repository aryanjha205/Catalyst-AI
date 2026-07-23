from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json
import urllib.request
import urllib.parse
import os
from database import get_db
import models
import auth
import schemas

router = APIRouter(
    prefix="/api/ai",
    tags=["ai"],
    responses={404: {"description": "Not found"}},
)

@router.get("/")
def get_all(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.AIConversation).filter(
        models.AIConversation.company_id == current_user.company_id
    ).all()

@router.post("/chat")
def chat_with_erp(
    payload: schemas.AIChatRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    api_key = os.getenv("OPENROUTER_API_KEY")
    model = os.getenv("OPENROUTER_MODEL", "google/gemma-2-9b-it:free")
    
    if not api_key:
        response_text = f"Offline AI Mode: I received your message '{payload.message}'."
        action = None
        lower_msg = payload.message.lower()
        if "inventory" in lower_msg or "stock" in lower_msg:
            action = {"type": "navigate", "target": "inventory"}
            response_text = "Navigating to Chemical Inventory panel..."
        elif "production" in lower_msg or "batch" in lower_msg or "recipe" in lower_msg:
            action = {"type": "navigate", "target": "production"}
            response_text = "Opening Production & Recipe Management workspace..."
        elif "lims" in lower_msg or "sample" in lower_msg or "test" in lower_msg:
            action = {"type": "navigate", "target": "lims"}
            response_text = "Loading Laboratory Information Management System (LIMS)..."
        elif "qa" in lower_msg or "qc" in lower_msg or "quality" in lower_msg:
            action = {"type": "navigate", "target": "qaqc"}
            response_text = "Routing to Quality Assurance & Quality Control module..."
        elif "finance" in lower_msg or "ledger" in lower_msg or "money" in lower_msg:
            action = {"type": "navigate", "target": "finance"}
            response_text = "Navigating to General Ledgers & Financial Accounting..."
        elif "sales" in lower_msg or "customer" in lower_msg:
            action = {"type": "navigate", "target": "sales"}
            response_text = "Opening Sales, CRM & Orders desk..."
        elif "procurement" in lower_msg or "supplier" in lower_msg or "purchase" in lower_msg:
            action = {"type": "navigate", "target": "procurement"}
            response_text = "Opening Procurement & Supplier relations workspace..."
            
        conv = models.AIConversation(
            company_id=current_user.company_id,
            user_id=current_user.id,
            prompt=payload.message,
            response=response_text
        )
        db.add(conv)
        db.commit()
        return {"response": response_text, "action": action}

    system_instruction = (
        "You are ChemERP AI, the assistant for a multi-tenant Chemical Industry ERP.\n"
        "Analyze the user's command and reply with a JSON object containing:\n"
        "1. 'response': A natural language string replying to the user.\n"
        "2. 'action': An optional object with 'type' (can be 'navigate') and 'target' (one of: 'dashboard', 'inventory', 'warehouse', 'production', 'lims', 'qaqc', 'sales', 'procurement', 'finance') if they want to view or open that section.\n\n"
        "Examples:\n"
        "- 'show stock levels' -> { 'response': 'Opening the inventory panel.', 'action': { 'type': 'navigate', 'target': 'inventory' } }\n"
        "- 'go to laboratory' -> { 'response': 'Loading LIMS module.', 'action': { 'type': 'navigate', 'target': 'lims' } }\n"
        "Provide ONLY the JSON response, nothing else."
    )


    try:
        url = "https://openrouter.ai/api/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://chemerp.local",
            "X-Title": "ChemERP"
        }
        body = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": payload.message}
            ]
        }
        
        req = urllib.request.Request(
            url, 
            data=json.dumps(body).encode("utf-8"), 
            headers=headers, 
            method="POST"
        )
        
        with urllib.request.urlopen(req, timeout=10) as response:
            res_body = response.read().decode("utf-8")
            data = json.loads(res_body)
            llm_text = data["choices"][0]["message"]["content"].strip()
            
            try:
                if llm_text.startswith("```json"):
                    llm_text = llm_text[7:]
                if llm_text.endswith("```"):
                    llm_text = llm_text[:-3]
                parsed = json.loads(llm_text.strip())
                response_text = parsed.get("response", "Command executed.")
                action = parsed.get("action", None)
            except Exception:
                response_text = llm_text
                action = None
                
    except Exception as e:
        response_text = f"AI request failed: {str(e)}"
        action = None

    conv = models.AIConversation(
        company_id=current_user.company_id,
        user_id=current_user.id,
        prompt=payload.message,
        response=response_text
    )
    db.add(conv)
    db.commit()
    return {"response": response_text, "action": action}

@router.post("/suggest-chemical", response_model=schemas.ChemicalSuggestResponse)
def suggest_chemical(
    payload: schemas.ChemicalSuggestRequest,
    current_user: models.User = Depends(auth.get_current_user)
):
    api_key = os.getenv("OPENROUTER_API_KEY")
    model = os.getenv("OPENROUTER_MODEL", "google/gemma-2-9b-it:free")
    
    offline_db = {
        "ethanol": {
            "chemical_name": "Ethanol",
            "cas_number": "64-17-5",
            "molecular_formula": "C2H6O",
            "molecular_weight": 46.07,
            "hazard_class": "Flammable Liquid",
            "density": "0.789 g/cm³"
        },
        "acetone": {
            "chemical_name": "Acetone",
            "cas_number": "67-64-1",
            "molecular_formula": "C3H6O",
            "molecular_weight": 58.08,
            "hazard_class": "Flammable Liquid, Irritant",
            "density": "0.784 g/cm³"
        },
        "methanol": {
            "chemical_name": "Methanol",
            "cas_number": "67-56-1",
            "molecular_formula": "CH4O",
            "molecular_weight": 32.04,
            "hazard_class": "Flammable, Toxic",
            "density": "0.792 g/cm³"
        },
        "benzene": {
            "chemical_name": "Benzene",
            "cas_number": "71-43-2",
            "molecular_formula": "C6H6",
            "molecular_weight": 78.11,
            "hazard_class": "Flammable, Carcinogenic",
            "density": "0.876 g/cm³"
        },
        "water": {
            "chemical_name": "Water",
            "cas_number": "7732-18-5",
            "molecular_formula": "H2O",
            "molecular_weight": 18.015,
            "hazard_class": "Non-hazardous",
            "density": "1.000 g/cm³"
        }
    }
    
    query = payload.name.lower().strip()
    if not api_key:
        for k, v in offline_db.items():
            if k in query or query in k:
                return v
        return {
            "chemical_name": payload.name.capitalize(),
            "cas_number": "00-00-0",
            "molecular_formula": "Unknown",
            "molecular_weight": 0.0,
            "hazard_class": "General",
            "density": "Unknown"
        }

    system_instruction = (
        "You are a chemistry expert. The user wants to add a chemical to their inventory.\n"
        "Analyze the chemical name entered and suggest properties in raw JSON format matching this schema:\n"
        "{\n"
        "  \"chemical_name\": \"Correct name\",\n"
        "  \"cas_number\": \"CAS (e.g. 64-17-5)\",\n"
        "  \"molecular_formula\": \"Formula (e.g. C2H6O)\",\n"
        "  \"molecular_weight\": 46.07,\n"
        "  \"hazard_class\": \"Hazard status\",\n"
        "  \"density\": \"Density (e.g. 0.789 g/cm³)\"\n"
        "}\n"
        "Provide ONLY the JSON response, nothing else."
    )

    try:
        url = "https://openrouter.ai/api/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://chemerp.local",
            "X-Title": "ChemERP"
        }
        body = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": f"Suggest properties for chemical: {payload.name}"}
            ]
        }
        
        req = urllib.request.Request(
            url, 
            data=json.dumps(body).encode("utf-8"), 
            headers=headers, 
            method="POST"
        )
        
        with urllib.request.urlopen(req, timeout=8) as response:
            res_body = response.read().decode("utf-8")
            data = json.loads(res_body)
            llm_text = data["choices"][0]["message"]["content"].strip()
            
            if llm_text.startswith("```json"):
                llm_text = llm_text[7:]
            if llm_text.endswith("```"):
                llm_text = llm_text[:-3]
            
            parsed = json.loads(llm_text.strip())
            return parsed
    except Exception:
        for k, v in offline_db.items():
            if k in query or query in k:
                return v
        return {
            "chemical_name": payload.name.capitalize(),
            "cas_number": "00-00-0",
            "molecular_formula": "Unknown",
            "molecular_weight": 0.0,
            "hazard_class": "General",
            "density": "Unknown"
        }

