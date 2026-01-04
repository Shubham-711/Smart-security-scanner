# test_db.py
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

url = os.getenv("DATABASE_URL")
print(f"Testing connection to: {url.split('@')[1]}") # Prints host only, hides password

try:
    engine = create_engine(url)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 'Success!'"))
        print(f"\n✅ DATABASE CONNECTED: {result.scalar()}")
except Exception as e:
    print(f"\n❌ CONNECTION FAILED: {e}")