import argparse
import time
import requests
import sys
import json
import os
from rich.console import Console
from rich.markdown import Markdown
from rich.panel import Panel
from rich.syntax import Syntax

# Initialize Rich Console for beautiful output
console = Console()
API_URL = os.environ.get("SECURE_SCAN_API_URL", "http://127.0.0.1:8000")

def scan_file(file_path):
    if not os.path.exists(file_path):
        console.print(f"[bold red]❌ Error: File '{file_path}' not found![/bold red]")
        return

    with open(file_path, "r") as f:
        code_content = f.read()

    # 1. Start the Scan
    console.print(f"[cyan]🚀 Uploading '{file_path}' to SecureScan AI...[/cyan]")
    try:
        response = requests.post(f"{API_URL}/scan", json={"code": code_content})
        response.raise_for_status()
        scan_id = response.json()["scan_id"]
    except requests.exceptions.RequestException as e:
        console.print(f"[bold red]❌ Connection Error: Could not reach backend at {API_URL}[/bold red]")
        console.print(f"[red]{e}[/red]")
        return

    # 2. Poll for Results
    with console.status("[bold green]🤖 AI is analyzing and fixing your code...[/bold green]", spinner="dots"):
        while True:
            status_res = requests.get(f"{API_URL}/scan/{scan_id}")
            if status_res.status_code != 200:
                console.print("[bold red]❌ Error checking status.[/bold red]")
                return
            
            data = status_res.json()
            if data["status"] in ["completed", "failed"]:
                break
            time.sleep(1)

    # 3. Handle Result
    if data["status"] == "failed":
        console.print("[bold red]❌ Scan Failed![/bold red]")
        console.print(f"Error: {data.get('ai_fix', 'Unknown error')}")
        return

    # Parse the AI response safely
    try:
        ai_result = json.loads(data["ai_fix"])
    except json.JSONDecodeError:
        ai_result = {"risk_analysis": "Error parsing AI output", "fixed_code": data["ai_fix"]}

    # 4. Print the Report
    console.print("\n")
    console.rule("[bold red]🛡️ VULNERABILITY REPORT[/bold red]")
    
    # Show Risk Analysis
    risk_md = Markdown(ai_result.get("risk_analysis", "No analysis provided."))
    console.print(Panel(risk_md, title="🔍 Analysis", border_style="red"))

    # Show Explanation (if available)
    if "explanation" in ai_result:
        explain_md = Markdown(ai_result["explanation"])
        console.print(Panel(explain_md, title="💡 Why was this dangerous?", border_style="blue"))

    # Show Fixed Code
    console.print("\n[bold green]✅ SECURE FIX:[/bold green]")
    syntax = Syntax(ai_result.get("fixed_code", ""), "python", theme="monokai", line_numbers=True)
    console.print(syntax)

    # Show Verification Badge
    if ai_result.get("verified_secure"):
        console.print("\n[bold green on black] 🛡️ VERIFIED SECURE BY BANDIT [/bold green on black]")
    else:
        console.print("\n[bold yellow on black] ⚠️ VERIFICATION FAILED - REVIEW MANUALLY [/bold yellow on black]")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SecureScan AI - CLI Tool")
    parser.add_argument("file", help="Path to the python file you want to scan")
    args = parser.parse_args()
    
    scan_file(args.file)