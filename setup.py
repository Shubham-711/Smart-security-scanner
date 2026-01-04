import os

# Define the structure relative to the CURRENT folder
structure = {
    # Backend Structure
    "backend": ["requirements.txt", ".env", "Dockerfile"],
    "backend/app": ["__init__.py", "main.py"],
    "backend/app/api": ["__init__.py", "routes.py"],
    "backend/app/core": ["__init__.py", "config.py"],
    "backend/app/services": ["__init__.py", "bandit_runner.py", "llm_engine.py"],
    "backend/app/db": ["__init__.py", "database.py", "models.py"],
    "backend/app/models": ["__init__.py", "schemas.py"],
    "backend/tests": ["__init__.py"],
    
    # Frontend Structure (React usually creates its own, but we'll make the placeholder)
    "frontend": [],
    "frontend/public": [],
    "frontend/src": ["App.jsx", "main.jsx"],
    "frontend/src/components": ["CodeInput.jsx", "ResultCard.jsx"],
    "frontend/src/services": ["api.js"],
}

def create_structure():
    # Get the current working directory
    base_path = os.getcwd()
    
    print(f"📂 Creating project structure in: {base_path}")
    
    for folder, files in structure.items():
        # Create the full path for the folder
        folder_path = os.path.join(base_path, folder)
        os.makedirs(folder_path, exist_ok=True)
        
        # Create the files inside that folder
        for file in files:
            file_path = os.path.join(folder_path, file)
            with open(file_path, 'w') as f:
                pass # Create empty file
            print(f"  - Created: {os.path.join(folder, file)}")

    print("\n✅ Project structure created successfully!")

if __name__ == "__main__":
    create_structure()