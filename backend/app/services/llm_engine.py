import json
import os
from groq import Groq

# Setup Groq Client
client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

def analyze_with_ai(code: str, scan_results, system_prompt: str):
    """
    Sends code and logic to Llama 3 (via Groq) to find vulnerabilities and generate a fix.
    Requires Language-Specific system_prompt injection.
    """
    # Safely format the scan results for the prompt
    if isinstance(scan_results, (dict, list)):
        scan_report = json.dumps(scan_results, indent=2)
    else:
        scan_report = str(scan_results)

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
    