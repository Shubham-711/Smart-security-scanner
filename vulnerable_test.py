import os
import sqlite3

# 1. The Eval Risk
def calculate_math_problem():
    user_input = input("Enter a math problem: ")
    result = eval(user_input)
    print(f"The answer is: {result}")

# 2. The SQL Injection Risk
def get_user(username):
    db = sqlite3.connect("users.db")
    # VULNERABLE: Direct string formatting
    query = f"SELECT * FROM accounts WHERE name = '{username}'"
    db.execute(query)

# 3. The Command Injection Risk
def ping_server(ip):
    # VULNERABLE: Using os.system with user input
    os.system("ping -c 1 " + ip)