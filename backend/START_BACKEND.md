# How to Start the Backend

This backend is **Python/FastAPI**, not Node.js.

## To start the backend server:

```powershell
cd backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Or in PowerShell:
```powershell
cd C:\Users\Muhammad\OneDrive\Desktop\doctor_app\medrate-sa\backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The server will run on: **http://127.0.0.1:8000**

## To start the frontend:

```powershell
cd frontend
npm run dev
```

The frontend will run on: **http://localhost:3001**

