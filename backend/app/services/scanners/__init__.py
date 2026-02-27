from .base_scanner import BaseScanner
from .python_scanner import PythonScanner
from .java_scanner import JavaScanner

SCANNER_REGISTRY = {
    "python": PythonScanner,
    "java": JavaScanner,
}

def get_scanner(language: str) -> BaseScanner:
    """Factory function to return the correct scanner for a language."""
    scanner_class = SCANNER_REGISTRY.get(language.lower())
    if not scanner_class:
        supported = ", ".join(SCANNER_REGISTRY.keys())
        raise ValueError(f"Unsupported language: '{language}'. Supported: {supported}")
    return scanner_class()
