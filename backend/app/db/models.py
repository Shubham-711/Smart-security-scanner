from sqlalchemy import Column, String, Text, DateTime
from datetime import datetime
from .database import Base

class ScanResult(Base):
    __tablename__ = "scan_results"

    id = Column(String, primary_key=True, index=True)
    status = Column(String, default="processing")  # processing, completed, failed
    code_snippet = Column(Text)
    raw_sast_output = Column(Text, nullable=True) # JSON string from Bandit
    ai_fix = Column(Text, nullable=True)          # The fix from Groq
    created_at = Column(DateTime, default=datetime.utcnow)