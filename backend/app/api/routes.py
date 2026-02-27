import uuid
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from ..db.database import get_db
from ..db.models import ScanResult
from ..models.schemas import ScanRequest, ScanResponse, ScanStatusResponse
from ..services.scan_service import process_scan_task

router = APIRouter()

# 2. POST /scan endpoint
@router.post("/scan", response_model=ScanResponse)
async def create_scan(request: ScanRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    scan_id = str(uuid.uuid4())
    
    # Save initial status
    new_scan = ScanResult(id=scan_id, status="processing", code_snippet=request.code)
    db.add(new_scan)
    db.commit()
    
    # Send to background (FastAPI's Async Worker)
    background_tasks.add_task(process_scan_task, scan_id, request.code, request.language)
    
    return {"scan_id": scan_id, "message": "Scan started successfully"}

# 3. GET /scan/{id} endpoint
@router.get("/scan/{scan_id}", response_model=ScanStatusResponse)
async def get_scan_status(scan_id: str, db: Session = Depends(get_db)):
    scan = db.query(ScanResult).filter(ScanResult.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan