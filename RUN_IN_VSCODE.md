# How to Run the Application in VS Code

## Prerequisites

1. **Install VS Code Extensions:**
   - Python (by Microsoft)
   - Pylance (Python language server)
   - ESLint (for TypeScript/React)
   - Prettier (code formatter)

2. **Install Dependencies:**
   - Backend: `pip install -r backend/requirements.txt`
   - Frontend: `npm install` (in the `frontend` folder)

## Method 1: Using VS Code Tasks (Recommended)

### Step 1: Open the Project
1. Open VS Code
2. File → Open Folder
3. Select: `C:\Users\Muhammad\OneDrive\Desktop\doctor_app\medrate-sa`

### Step 2: Run Both Servers
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type: `Tasks: Run Task`
3. Select: **"Start Both Servers"**

This will start both the backend (port 8000) and frontend (port 3001) simultaneously.

### Step 3: Run Individual Servers
- **Backend only**: `Tasks: Run Task` → "Start Backend Server"
- **Frontend only**: `Tasks: Run Task` → "Start Frontend Server"

## Method 2: Using VS Code Debug/Launch

### Step 1: Open the Project
Same as Method 1

### Step 2: Start Debugging
1. Press `F5` or go to Run → Start Debugging
2. Select: **"Start Backend + Frontend"** from the dropdown
3. Both servers will start in debug mode

### Step 3: Run Individual Servers
- **Backend**: Select "Python: FastAPI Backend" from debug dropdown, then press `F5`
- **Frontend**: Select "Next.js: Frontend" from debug dropdown, then press `F5`

## Method 3: Using Integrated Terminal (Manual)

### Step 1: Open the Project
Same as Method 1

### Step 2: Open Terminal
1. Press `` Ctrl+` `` (backtick) or View → Terminal
2. You can split the terminal: Click the `+` dropdown → "Split Terminal"

### Step 3: Start Backend
In the first terminal:
```bash
cd backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Step 4: Start Frontend
In the second terminal (or new terminal):
```bash
cd frontend
npm run dev
```

## Access the Application

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs (Swagger UI)

## Troubleshooting

### Port Already in Use
If you get "port already in use" errors:
1. **Kill existing processes:**
   ```powershell
   # Windows PowerShell
   netstat -ano | findstr :8000
   taskkill /PID <PID_NUMBER> /F
   
   netstat -ano | findstr :3001
   taskkill /PID <PID_NUMBER> /F
   ```

### Backend Not Starting
- Check if Python dependencies are installed: `pip install -r backend/requirements.txt`
- Check if database file exists: `backend/medrate.db` (SQLite)
- Check terminal for error messages

### Frontend Not Starting
- Check if Node modules are installed: `cd frontend && npm install`
- Check if port 3001 is available
- Check terminal for error messages

## VS Code Tips

1. **Multiple Terminals**: You can have multiple terminal tabs for different tasks
2. **Terminal Panels**: Right-click terminal tab → "Split Terminal" to run both servers side-by-side
3. **Auto-save**: Files auto-save on change (configured in settings.json)
4. **Debugging**: Set breakpoints in Python or TypeScript files and use F5 to debug

## Quick Commands

- **Stop All Tasks**: `Ctrl+Shift+P` → "Tasks: Terminate Task"
- **Restart Backend**: Stop and run "Start Backend Server" task again
- **View Logs**: Check the terminal panels for server output

