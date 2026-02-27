import subprocess
import json
import os
import tempfile
from typing import Any
from .base_scanner import BaseScanner


class PythonScanner(BaseScanner):
    """Scanner for Python code using Bandit."""

    def get_language(self) -> str:
        return "python"

    def get_file_extension(self) -> str:
        return ".py"

    def scan(self, code: str) -> dict[str, Any]:
        """Save code to temp file, run Bandit, return JSON results."""
        tmp_fd, tmp_path = tempfile.mkstemp(suffix=".py")
        try:
            with os.fdopen(tmp_fd, "w") as f:
                f.write(code)

            result = subprocess.run(
                ["bandit", "-r", tmp_path, "-f", "json"],
                capture_output=True,
                text=True,
            )

            output = result.stdout
            if not output.strip():
                return {"results": [], "errors": ["Bandit returned empty output"]}

            try:
                return json.loads(output)
            except json.JSONDecodeError:
                return {"error": "Failed to parse Bandit output", "raw": output}

        except FileNotFoundError:
            return {"error": "Bandit is not installed. Run: pip install bandit"}
        except Exception as e:
            return {"error": str(e)}
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

    def get_system_prompt(self) -> str:
        return """
You are an elite Security Engineer and Python Expert.

You will receive a snippet of vulnerable Python code and a security scan report.
Your goal is to:
1. Identify the specific security vulnerability.
2. Write a SECURE version of the code that fixes the issue.
3. Explain your fix clearly.

CRITICAL JSON RULES:
- You must output valid JSON only.
- The "fixed_code" field must be a SINGLE string containing the entire corrected Python script.
- You MUST escape all double quotes (") inside the Python code with a backslash (\").
- You MUST escape all newlines in the Python code as \\n.
- Do NOT wrap the output in markdown (```json). Just return the raw JSON object.

OUTPUT FORMAT:
{
    "risk_analysis": "Brief explanation of the attack vector (Max 2 sentences).",
    "fixed_code": "The complete, fixed Python code string (properly escaped).",
    "explanation": "Why the new code is secure."
}
"""
