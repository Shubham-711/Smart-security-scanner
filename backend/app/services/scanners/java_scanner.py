import re
from typing import Any
from .base_scanner import BaseScanner


# Common Java vulnerability patterns for static analysis
JAVA_VULNERABILITY_PATTERNS = [
    {
        "id": "JAVA_SQL_INJECTION",
        "pattern": r'(Statement\s*\.\s*execute|executeQuery|executeUpdate)\s*\(',
        "check": lambda code: bool(re.search(r'\+.*?(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE)|(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE).*?\+', code, re.IGNORECASE)),
        "severity": "HIGH",
        "title": "SQL Injection",
        "description": "String concatenation in SQL queries allows SQL injection attacks. Use PreparedStatement with parameterized queries.",
        "cwe": "CWE-89",
    },
    {
        "id": "JAVA_HARDCODED_SECRET",
        "pattern": r'(password|secret|api[_-]?key|token|credential)\s*=\s*["\'][^"\']+["\']',
        "severity": "HIGH",
        "title": "Hardcoded Secret",
        "description": "Sensitive credentials are hardcoded in source code. Use environment variables or a secrets manager.",
        "cwe": "CWE-798",
    },
    {
        "id": "JAVA_COMMAND_INJECTION",
        "pattern": r'Runtime\.getRuntime\(\)\.exec\s*\(',
        "severity": "HIGH",
        "title": "Command Injection",
        "description": "Using Runtime.exec() with user input can lead to OS command injection. Use ProcessBuilder with argument lists.",
        "cwe": "CWE-78",
    },
    {
        "id": "JAVA_XXE",
        "pattern": r'(DocumentBuilderFactory|SAXParserFactory|XMLInputFactory)\.newInstance\(\)',
        "check": lambda code: "setFeature" not in code or "FEATURE_SECURE_PROCESSING" not in code,
        "severity": "HIGH",
        "title": "XML External Entity (XXE)",
        "description": "XML parsers without secure feature flags are vulnerable to XXE attacks. Disable external entity processing.",
        "cwe": "CWE-611",
    },
    {
        "id": "JAVA_INSECURE_RANDOM",
        "pattern": r'new\s+Random\s*\(',
        "severity": "MEDIUM",
        "title": "Insecure Random Number Generator",
        "description": "java.util.Random is not cryptographically secure. Use java.security.SecureRandom for security-sensitive operations.",
        "cwe": "CWE-330",
    },
    {
        "id": "JAVA_PATH_TRAVERSAL",
        "pattern": r'new\s+File\s*\(\s*[^)]*\+',
        "severity": "HIGH",
        "title": "Path Traversal",
        "description": "File paths constructed from user input can lead to path traversal attacks. Validate and canonicalize paths.",
        "cwe": "CWE-22",
    },
    {
        "id": "JAVA_WEAK_CRYPTO",
        "pattern": r'Cipher\.getInstance\s*\(\s*["\']?(DES|RC4|RC2|Blowfish|MD5|SHA-1)["\']?',
        "severity": "MEDIUM",
        "title": "Weak Cryptographic Algorithm",
        "description": "Using deprecated/weak cryptographic algorithms. Use AES-256-GCM or SHA-256/SHA-3 instead.",
        "cwe": "CWE-327",
    },
    {
        "id": "JAVA_EMPTY_CATCH",
        "pattern": r'catch\s*\([^)]*\)\s*\{\s*\}',
        "severity": "LOW",
        "title": "Empty Catch Block",
        "description": "Empty catch blocks silently swallow exceptions, potentially hiding security issues. Log or handle exceptions properly.",
        "cwe": "CWE-390",
    },
    {
        "id": "JAVA_DESERIALIZATION",
        "pattern": r'ObjectInputStream|readObject\s*\(',
        "severity": "HIGH",
        "title": "Insecure Deserialization",
        "description": "Deserializing untrusted data can lead to remote code execution. Use safe alternatives like JSON or validate objects.",
        "cwe": "CWE-502",
    },
]


class JavaScanner(BaseScanner):
    """
    Scanner for Java code using regex-based pattern matching.
    
    Uses a curated set of vulnerability patterns covering OWASP Top 10 issues.
    For production use, consider integrating SpotBugs, PMD, or SonarQube.
    """

    def get_language(self) -> str:
        return "java"

    def get_file_extension(self) -> str:
        return ".java"

    def scan(self, code: str) -> dict[str, Any]:
        """Scan Java code for common vulnerability patterns."""
        results = []
        lines = code.split("\n")

        for pattern_def in JAVA_VULNERABILITY_PATTERNS:
            for line_num, line in enumerate(lines, start=1):
                if re.search(pattern_def["pattern"], line, re.IGNORECASE):
                    # If there's an additional check function, run it
                    extra_check = pattern_def.get("check")
                    if extra_check and not extra_check(code):
                        continue

                    results.append({
                        "test_id": pattern_def["id"],
                        "test_name": pattern_def["title"],
                        "issue_severity": pattern_def["severity"],
                        "issue_confidence": "HIGH",
                        "issue_cwe": {"id": pattern_def["cwe"]},
                        "issue_text": pattern_def["description"],
                        "line_number": line_num,
                        "line_range": [line_num],
                        "code": line.strip(),
                        "filename": "<input>",
                    })

        return {
            "results": results,
            "errors": [],
            "metrics": {
                "total_issues": len(results),
                "severity_high": sum(1 for r in results if r["issue_severity"] == "HIGH"),
                "severity_medium": sum(1 for r in results if r["issue_severity"] == "MEDIUM"),
                "severity_low": sum(1 for r in results if r["issue_severity"] == "LOW"),
            },
        }

    def get_system_prompt(self) -> str:
        return """
You are an elite Security Engineer and Java Expert.

You will receive a snippet of vulnerable Java code and a security scan report.
Your goal is to:
1. Identify the specific security vulnerability.
2. Write a SECURE version of the code that fixes the issue.
3. Explain your fix clearly.

Common Java security fixes include:
- Use PreparedStatement instead of string concatenation for SQL
- Use SecureRandom instead of Random for security operations
- Disable external entity processing in XML parsers
- Use ProcessBuilder with argument lists instead of Runtime.exec()
- Use environment variables instead of hardcoded secrets
- Use AES-256-GCM instead of DES/RC4 for encryption

CRITICAL JSON RULES:
- You must output valid JSON only.
- The "fixed_code" field must be a SINGLE string containing the entire corrected Java code.
- You MUST escape all double quotes (") inside the Java code with a backslash (\").
- You MUST escape all newlines in the Java code as \\n.
- Do NOT wrap the output in markdown (```json). Just return the raw JSON object.

OUTPUT FORMAT:
{
    "risk_analysis": "Brief explanation of the attack vector (Max 2 sentences).",
    "fixed_code": "The complete, fixed Java code string (properly escaped).",
    "explanation": "Why the new code is secure."
}
"""
