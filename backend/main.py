from fastapi import FastAPI
from pydantic import BaseModel
from google.cloud import firestore
from datetime import datetime

app = FastAPI(title="SmartBiz AI")
db = firestore.Client()

class BusinessData(BaseModel):
    company_name: str
    industry: str
    monthly_revenue: float
    monthly_expenses: float
    employee_count: int

@app.post("/analyze-business")
async def analyze_business(data: BusinessData):
    profit = data.monthly_revenue - data.monthly_expenses
    profit_margin = (profit / data.monthly_revenue) * 100
    
    business_doc = {
        'company_name': data.company_name,
        'revenue': data.monthly_revenue,
        'expenses': data.monthly_expenses,
        'profit': profit,
        'timestamp': datetime.now()
    }
    
    db.collection('business_analytics').add(business_doc)
    
    return {
        "company": data.company_name,
        "profit": f"${profit:,.2f}",
        "profit_margin": f"{profit_margin:.1f}%"
    }

@app.get("/")
async def root():
    return {"message": "SmartBiz AI API - Ready!"}