import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.database import Base, engine, SessionLocal

# Setup a test database
Base.metadata.create_all(bind=engine)

client = TestClient(app)

def test_scan_code_endpoint():
    """Test submitting code to the scan endpoint"""
    response = client.post(
        "/scan",
        json={"code": "password = 'admin123'", "language": "python"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "scan_id" in data
    assert "message" in data
    
    return data["scan_id"]

def test_get_scan_status_endpoint():
    """Test retrieving scan status and ensure it reports correctly."""
    scan_id = test_scan_code_endpoint()
    
    # Query status
    response = client.get(f"/scan/{scan_id}")
    assert response.status_code == 200
    data = response.json()
    
    assert data["id"] == scan_id
    assert "status" in data
    assert "code_snippet" in data
    assert data["code_snippet"] == "password = 'admin123'"

def test_invalid_scan_id():
    """Test retrieving an invalid scan ID"""
    response = client.get("/scan/does-not-exist-123")
    assert response.status_code == 404
