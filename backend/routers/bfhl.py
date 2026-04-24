from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime, timezone
import uuid
import os
import motor.motor_asyncio
from dotenv import load_dotenv

# load dotenv at import time
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

router = APIRouter()

# Identity placeholders
USER_ID = "john_doe_17091999"
EMAIL_ID = "john@xyz.com"
COLLEGE_ROLL_NUMBER = "ROLL123"

from services.hierarchy import process_edges

# MongoDB Setup
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "bfhl_db")

try:
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=2000)
    db = client[DB_NAME]
    collection = db["bfhl_submissions"]
except Exception as e:
    db = None
    collection = None

class PostRequest(BaseModel):
    data: List[str]
    save: Optional[bool] = True

class GetResponse(BaseModel):
    operation_code: int
    user_id: str
    email_id: str
    college_roll_number: str

@router.get("", response_model=GetResponse)
async def get_bfhl():
    return GetResponse(
        operation_code=1,
        user_id=USER_ID,
        email_id=EMAIL_ID,
        college_roll_number=COLLEGE_ROLL_NUMBER
    )

@router.post("")
async def post_bfhl(req: PostRequest):
    result = process_edges(req.data)
    
    response = {
        "user_id": USER_ID,
        "email_id": EMAIL_ID,
        "college_roll_number": COLLEGE_ROLL_NUMBER,
        "hierarchies": result["hierarchies"],
        "invalid_entries": result["invalid_entries"],
        "duplicate_edges": result["duplicate_edges"],
        "summary": result["summary"]
    }
    if result["has_cycle"]:
        response["has_cycle"] = True
    
    submission_id = None
    if req.save:
        submission_id = str(uuid.uuid4())
        response["submission_id"] = submission_id
        
        doc = {
            "id": submission_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "input": req.data,
            "response": response,
            "summary": result["summary"],
            "has_cycle": result["has_cycle"],
            "total_invalid": len(result["invalid_entries"]),
            "total_duplicates": len(result["duplicate_edges"])
        }
        
        if collection is not None:
            try:
                await collection.insert_one(doc)
            except Exception:
                pass # Silently ignore DB errors
                
    return response

@router.get("/history")
async def get_history(limit: int = Query(20, ge=1, le=100)):
    if collection is None:
        return {"items": [], "count": 0}
        
    try:
        cursor = collection.find({}, {"_id": 0, "response": 0}).sort("created_at", -1).limit(limit)
        items = await cursor.to_list(length=limit)
        return {"items": items, "count": len(items)}
    except Exception:
        return {"items": [], "count": 0}

@router.get("/history/{id}")
async def get_history_by_id(id: str):
    if collection is None:
        raise HTTPException(status_code=404, detail="Not found")
        
    try:
        doc = await collection.find_one({"id": id}, {"_id": 0})
        if not doc:
            raise HTTPException(status_code=404, detail="Not found")
        return doc
    except Exception:
        raise HTTPException(status_code=404, detail="Not found")
