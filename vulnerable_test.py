def calculate_math_problem():
    # SECURITY RISK: The user can type "import os; os.system('rm -rf /')" 
    # and the eval() function will execute it!
    user_input = input("Enter a math problem (like 2 + 2): ")
    
    result = eval(user_input)
    
    print(f"The answer is: {result}")

calculate_math_problem()