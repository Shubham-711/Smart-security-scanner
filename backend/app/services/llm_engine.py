import json
import os
from groq import Groq

# Setup Groq Client
client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

def analyze_with_ai(code: str, bandit_results: list):
    """
    Sends code + security scan results to Llama 3.3 to get a fix.
    Now upgraded to fix Syntax and Logic errors too!
    """
    
    # We tell the AI to look for EVERYTHING, not just security.
    prompt = f"""
    You are an expert Senior Python Developer and Security Analyst.
    
    Here is a snippet of Python code:
    ```python
    {code}
    ```
    
    Here are the security flaws detected by a scanner (if any):
    {json.dumps(bandit_results, indent=2)}
    
    YOUR TASK:
    1. Analyze the code for **Security Vulnerabilities** (from the list above OR any you find yourself).
    2. Analyze the code for **Logic Bugs** and **Syntax Errors** (e.g., missing colons, wrong indentation, undefined variables).
    3. Provide a FIXED version of the code that is secure, bug-free, and follows PEP-8 standards.
    
    OUTPUT FORMAT (JSON ONLY):
    {{
        "risk_analysis": "A brief summary of security risks AND logic/syntax bugs found.",
        "fixed_code": "The fully corrected, ready-to-run Python code."
        "explanation": "A clear, educational explanation of why the old code was dangerous and how the new code fixes it (e.g., 'I replaced os.system with subprocess.run because...')."
    }}
    """

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful coding assistant that outputs valid JSON only."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.3-70b-versatile", # The smart model!
            temperature=0.1, # Low temperature = more precise code
            response_format={"type": "json_object"}
        )

        return chat_completion.choices[0].message.content

    except Exception as e:
        return json.dumps({
            "risk_analysis": f"AI Analysis Failed: {str(e)}",
            "fixed_code": code # Return original code if AI fails
        })