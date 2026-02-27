import pytest
from app.services.scanners import get_scanner
from app.services.scanners.python_scanner import PythonScanner
from app.services.scanners.java_scanner import JavaScanner

def test_scanner_factory():
    """Test that the scanner factory returns the correct scanner type."""
    python_scanner = get_scanner("python")
    assert isinstance(python_scanner, PythonScanner)
    
    java_scanner = get_scanner("java")
    assert isinstance(java_scanner, JavaScanner)
    
    with pytest.raises(ValueError):
        get_scanner("unknown")

def test_python_scanner_clean_code():
    """Test that the Python scanner correctly identifies clean code."""
    scanner = get_scanner("python")
    code = "print('Hello, world!')"
    results = scanner.scan(code)
    
    assert "results" in results
    assert len(results["results"]) == 0

def test_python_scanner_vulnerable_code():
    """Test that the Python scanner identifies a hardcoded password."""
    scanner = get_scanner("python")
    code = "password = 'admin123'"
    results = scanner.scan(code)
    
    assert "results" in results
    assert len(results["results"]) > 0
    # Bandit should catch the hardcoded secret
    found_issue = any("hardcoded_password" in issue.get("test_id", "").lower() for issue in results["results"])
    # If using default bandit profile, it might just flag B105
    assert any(issue.get("test_id") == "B105" for issue in results["results"])

def test_java_scanner_clean_code():
    """Test that the Java scanner correctly identifies clean code."""
    scanner = get_scanner("java")
    code = 'System.out.println("Hello, world!");'
    results = scanner.scan(code)
    
    assert "results" in results
    assert len(results["results"]) == 0

def test_java_scanner_sql_injection():
    """Test that the Java scanner identifies SQL Injection."""
    scanner = get_scanner("java")
    code = 'Statement stmt = con.createStatement();\nstmt.executeQuery("SELECT * FROM users WHERE name = " + userName);'
    results = scanner.scan(code)
    
    assert "results" in results
    assert len(results["results"]) > 0
    assert any(issue.get("test_id") == "JAVA_SQL_INJECTION" for issue in results["results"])

def test_java_scanner_hardcoded_secret():
    """Test that the Java scanner identifies hardcoded secrets."""
    scanner = get_scanner("java")
    code = 'String password = "super_secret_password";'
    results = scanner.scan(code)
    
    assert "results" in results
    assert len(results["results"]) > 0
    assert any(issue.get("test_id") == "JAVA_HARDCODED_SECRET" for issue in results["results"])
