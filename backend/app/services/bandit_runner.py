import subprocess
import json
import os

def run_bandit_scan(code_snippet: str):
    """
    Saves code to a temp file, runs bandit, and cleans up.
    Returns the JSON output from Bandit.
    """
    # 1. Create a temporary file to scan
    filename = "temp_scan_file.py"
    
    with open(filename, "w") as f:
        f.write(code_snippet)
        
    try:
        # 2. Run bandit using subprocess
        # -r: recursive (not needed for one file but good habit)
        # -f json: output format
        # -ll: reported level (medium/high only to reduce noise)
        result = subprocess.run(
            ["bandit", "-r", filename, "-f", "json"],
            capture_output=True,
            text=True
        )
        
        # Bandit returns exit code 1 if issues are found, so we don't check returncode
        output = result.stdout
        
        # 3. Parse JSON to ensure it's valid
        if not output.strip():
             return {"results": [], "errors": ["Bandit returned empty output"]}

        try:
            return json.loads(output)
        except json.JSONDecodeError:
            return {"error": "Failed to parse Bandit output", "raw": output}

    except Exception as e:
        return {"error": str(e)}
    
    finally:
        # 4. Cleanup: Delete the temp file
        if os.path.exists(filename):
            os.remove(filename)