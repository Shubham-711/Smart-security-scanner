from abc import ABC, abstractmethod
from typing import Any


class BaseScanner(ABC):
    """
    Abstract base class for all language vulnerability scanners.
    
    To add a new language:
    1. Create a new file in /scanners/ (e.g., ruby_scanner.py)
    2. Subclass BaseScanner and implement scan() and get_language()
    3. Register it in __init__.py's SCANNER_REGISTRY
    """

    @abstractmethod
    def get_language(self) -> str:
        """Return the language name this scanner supports (e.g., 'python', 'java')."""
        ...

    @abstractmethod
    def scan(self, code: str) -> dict[str, Any]:
        """
        Scan the provided code string for vulnerabilities.
        
        Returns a dict with at minimum:
          - "results": list of found issues (empty if clean)
          - "errors": list of any errors during scanning
        """
        ...

    @abstractmethod
    def get_file_extension(self) -> str:
        """Return the file extension for temp files (e.g., '.py', '.java')."""
        ...

    @abstractmethod
    def get_system_prompt(self) -> str:
        """Return the AI system prompt tailored for this language's security patterns."""
        ...
