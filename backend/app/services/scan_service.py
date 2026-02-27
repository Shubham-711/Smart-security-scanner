import json
from sqlalchemy.orm import Session
from ..db.database import SessionLocal
from ..db.models import ScanResult
from .scanners import get_scanner
from .llm_engine import analyze_with_ai

def process_scan_task(scan_id: str, code: str, language: str = "python"):
    """
    The background task that runs the vulnerability scan and attempts to auto-fix the code using AI.
    """
    db = SessionLocal()
    try:
        print(f"🔍 [Scan {scan_id}] Starting initial analysis for {language}...")

        # 1. Initialize Scanner & Run Initial Scan
        try:
            scanner = get_scanner(language)
        except ValueError as e:
            raise Exception(str(e))
            
        initial_scan_results = scanner.scan(code)
        
        # Check if code is already clean (no results/errors indicates clean status usually, depends on standard parser)
        results_list = initial_scan_results.get("results")
        if not results_list:
            print("✅ Code is clean. No AI fix needed.")
            _update_scan_result(
                db=db, 
                scan_id=scan_id, 
                status="completed", 
                raw_sast=initial_scan_results, 
                ai_fix={"risk_analysis": "No vulnerabilities found!", "fixed_code": code}
            )
            return

        # 2. Self-Healing Loop
        current_code = code
        current_errors = initial_scan_results
        final_ai_response = None
        system_prompt = scanner.get_system_prompt()
        
        for attempt in range(1, 4):
            print(f"🤖 [Attempt {attempt}/3] AI is fixing the code using LLM...")
            
            ai_response_str = analyze_with_ai(current_code, current_errors, system_prompt)
            
            try:
                ai_response_json = json.loads(ai_response_str)
                fixed_code_candidate = ai_response_json.get("fixed_code", "")
                
                # 3. VERIFICATION
                print(f"📝 [Attempt {attempt}/3] Verifying fix with scanner...")
                verification_result = scanner.scan(fixed_code_candidate)
                
                if not verification_result.get("results"):
                    print(f"🎉 Fix Verified! Code is secure.")
                    ai_response_json["risk_analysis"] += " (Verified Secure)"
                    ai_response_json["verified_secure"] = True
                    final_ai_response = ai_response_json
                    break
                else:
                    errors_count = len(verification_result.get('results', []))
                    print(f"⚠️ Attempt {attempt} failed. Still found {errors_count} errors.")
                    current_code = fixed_code_candidate
                    current_errors = verification_result
                    
                    if attempt == 3:
                        ai_response_json["risk_analysis"] += " (Warning: Automatic verification failed. Manual review recommended.)"
                        ai_response_json["verified_secure"] = False
                        final_ai_response = ai_response_json

            except json.JSONDecodeError:
                print("❌ AI returned bad JSON. Skipping attempt.")

        # 4. Save Final Result
        _update_scan_result(
            db=db, 
            scan_id=scan_id, 
            status="completed", 
            raw_sast=initial_scan_results, 
            ai_fix=final_ai_response or {"error": "AI failed to generate a fix."}
        )

    except Exception as e:
        print(f"\n❌ CRITICAL ERROR IN SCAN: {str(e)}\n")
        _update_scan_result(
            db=db, 
            scan_id=scan_id, 
            status="failed", 
            raw_sast={"error": str(e)}, 
            ai_fix=f"System Error: {str(e)}"
        )
    finally:
        db.close()

def _update_scan_result(db: Session, scan_id: str, status: str, raw_sast: dict, ai_fix: dict | str):
    scan = db.query(ScanResult).filter(ScanResult.id == scan_id).first()
    if scan:
        scan.status = status
        scan.raw_sast_output = json.dumps(raw_sast)
        scan.ai_fix = json.dumps(ai_fix) if isinstance(ai_fix, dict) else ai_fix
        db.commit()
