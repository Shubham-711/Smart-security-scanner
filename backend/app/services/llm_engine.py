import json
import os
from groq import Groq

# Setup Groq Client
client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

def analyze_with_ai(code: str, bandit_results):
    """
    Sends code to Llama 3 (via Groq) to find vulnerabilities and generate a fix.
    """
    system_prompt = """
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

    # Safely format the bandit results for the prompt
    if isinstance(bandit_results, (dict, list)):
        scan_report = json.dumps(bandit_results, indent=2)
    else:
        scan_report = str(bandit_results)

    user_message = f"""
    Here is the vulnerable code:
    ```python
    {code}
    ```
    
    Here are the Bandit scan results:
    {scan_report}
    
    Fix it now.
    """
    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.1,
            max_tokens=2048,
            response_format={"type": "json_object"}
        )

        # RETURN THE RAW STRING directly to routes.py
        return completion.choices[0].message.content

    except Exception as e:
        print(f"❌ AI Error: {e}")
        # Return a raw JSON string as the fallback so routes.py doesn't crash
        
        return json.dumps({
            "risk_analysis": f"AI Generation Failed: {str(e)}",
            "fixed_code": code,
            "explanation": "The AI model failed to generate a valid response."
        })
    