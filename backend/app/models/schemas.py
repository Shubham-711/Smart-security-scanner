from pydantic import BaseModel
from typing import Optional, Any

# What the user sends to us
class ScanRequest(BaseModel):
    code: str
    language: str = "python"

# What we return to the user
class ScanResponse(BaseModel):
    scan_id: str
    message: str

# Detailed status response
class ScanStatusResponse(BaseModel):
    id: str
    status: str
    code_snippet: str
    raw_sast_output: Optional[str] = None
    ai_fix: Optional[str] = None
    
    class Config:
        from_attributes = True