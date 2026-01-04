import json
import uuid
import os          
import tempfile
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from ..db.database import get_db, SessionLocal
from ..db.models import ScanResult
from ..models.schemas import ScanRequest, ScanResponse, ScanStatusResponse
from ..services.bandit_runner import run_bandit_scan
from ..services.llm_engine import analyze_with_ai


def validate_fix(code_content: str):
    """
    Takes code string -> Saves to temp file -> Runs Bandit -> Returns Report
    """
    # Create a temporary file like 'temp_check_1.py'
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as tmp:
        tmp.write(code_content)
        tmp_path = tmp.name
    
    try:
        # Run the scan (Grade the paper)
        results = run_bandit_scan(tmp_path)
        return results
    finally:
        # Clean up the paper
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

router = APIRouter()

def process_scan(scan_id: str, code: str):
    db = SessionLocal()
    try:
        print(f"🔍 [Scan {scan_id}] Starting initial analysis...")
        
        # 1. Initial Scan (The first test)
        bandit_json = run_bandit_scan(code)
        
        # If the user's code is already perfect, stop here!
        if not bandit_json.get("results"):
            print("✅ Code is clean. No AI fix needed.")
            scan = db.query(ScanResult).filter(ScanResult.id == scan_id).first()
            scan.status = "completed"
            scan.raw_sast_output = json.dumps(bandit_json)
            scan.ai_fix = json.dumps({
                "risk_analysis": "No vulnerabilities found!", 
                "fixed_code": code
            })
            db.commit()
            return

        # 2. The Self-Healing Loop (Teacher-Student Mode)
        current_code = code
        current_errors = bandit_json
        final_ai_response = None
        
        for attempt in range(1, 4): # Try 3 times (Attempt 1, 2, 3)
            print(f"🤖 [Attempt {attempt}/3] AI is fixing the code...")
            
            # Ask AI to fix the current errors
            ai_response_str = analyze_with_ai(current_code, current_errors)
            
            try:
                # Parse AI's JSON answer
                ai_response_json = json.loads(ai_response_str)
                fixed_code_candidate = ai_response_json.get("fixed_code", "")
                
                # 3. VERIFICATION (The "Double Check")
                print(f"exams📝 [Attempt {attempt}/3] Verifying fix...")
                verification_result = validate_fix(fixed_code_candidate)
                
                if not verification_result.get("results"):
                    # SUCCESS! Bandit found 0 errors in the new code.
                    print(f"🎉 Fix Verified! Code is secure.")
                    ai_response_json["risk_analysis"] += " (Verified Secure by Bandit)"
                    final_ai_response = ai_response_json
                    break # Exit the loop, we are done!
                else:
                    # FAILURE. Bandit still found errors.
                    print(f"⚠️ Attempt {attempt} failed. Still found {len(verification_result['results'])} errors.")
                    
                    # Update the "Current State" so the next loop knows what to fix
                    current_code = fixed_code_candidate
                    current_errors = verification_result
                    
                    # If this was the last attempt, save the failed result anyway
                    if attempt == 3:
                        ai_response_json["risk_analysis"] += " (Warning: Automatic verification failed. Manual review recommended.)"
                        final_ai_response = ai_response_json

            except json.JSONDecodeError:
                print("❌ AI returned bad JSON. Skipping attempt.")

        # 4. Save Final Result to DB
        scan = db.query(ScanResult).filter(ScanResult.id == scan_id).first()
        if scan:
            scan.status = "completed"
            scan.raw_sast_output = json.dumps(bandit_json) # Show user the original errors
            scan.ai_fix = json.dumps(final_ai_response) if final_ai_response else json.dumps({"error": "AI failed to generate a fix."})
            db.commit()

    except Exception as e:
        print(f"\n❌ CRITICAL ERROR IN SCAN: {str(e)}\n")
        scan = db.query(ScanResult).filter(ScanResult.id == scan_id).first()
        if scan:
            scan.status = "failed"
            scan.raw_sast_output = json.dumps({"error": str(e)})
            scan.ai_fix = f"System Error: {str(e)}"
            db.commit()

    finally:
        db.close()

# 2. POST /scan endpoint
@router.post("/scan", response_model=ScanResponse)
async def create_scan(request: ScanRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    scan_id = str(uuid.uuid4())
    
    # Save initial status
    new_scan = ScanResult(id=scan_id, status="processing", code_snippet=request.code)
    db.add(new_scan)
    db.commit()
    
    # Send to background (FastAPI's Async Worker)
    background_tasks.add_task(process_scan, scan_id, request.code)
    
    return {"scan_id": scan_id, "message": "Scan started successfully"}

# 3. GET /scan/{id} endpoint
@router.get("/scan/{scan_id}", response_model=ScanStatusResponse)
async def get_scan_status(scan_id: str, db: Session = Depends(get_db)):
    scan = db.query(ScanResult).filter(ScanResult.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan