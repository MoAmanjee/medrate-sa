# How to View Backend Error Messages in VS Code

## Problem
You can't see error messages in the VS Code terminal when the backend is running.

## Solution

### Option 1: Use VS Code Integrated Terminal (Recommended)

1. **Open VS Code Terminal:**
   - Press `` Ctrl+` `` (backtick) or go to `Terminal` → `New Terminal`

2. **Start Backend in Terminal:**
   ```powershell
   cd backend
   python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

3. **Keep Terminal Visible:**
   - The terminal will show all `[DEBUG]` and `[ERROR]` messages in real-time
   - All print statements use `flush=True` so they appear immediately

### Option 2: Use VS Code Tasks

1. **Open Command Palette:**
   - Press `Ctrl+Shift+P`

2. **Run Task:**
   - Type: `Tasks: Run Task`
   - Select: `Start Backend Server`

3. **View Output:**
   - Go to `Terminal` → `Output` panel
   - Select the task output from the dropdown

### Option 3: Use VS Code Debug Console

1. **Set Breakpoints:**
   - Open `backend/app/routes/auth.py`
   - Click left of line numbers to set breakpoints

2. **Start Debugging:**
   - Press `F5` or go to `Run` → `Start Debugging`
   - Select: `Python: FastAPI`

3. **View Debug Output:**
   - Check the `Debug Console` panel at the bottom
   - All print statements will appear there

## What You Should See

When you register/login, you should see:

```
[DEBUG] ===== NEW REQUEST =====
[DEBUG] Method: POST
[DEBUG] Path: /api/auth/register
[DEBUG] Registration request: email=user@example.com, phone=1234567890
[DEBUG] Creating AuthService...
[DEBUG] Calling register_user...
[DEBUG] Register result: success=True
[DEBUG] Registration successful!
[DEBUG] Response status: 200
```

If there's an error, you'll see:

```
[ERROR] Registration exception: ErrorType: Error message
[ERROR] Traceback (most recent call last):
  ...
```

## Troubleshooting

### No messages appearing?
- Make sure the backend is actually running (check for "Application startup complete")
- Check that you're looking at the correct terminal/output panel
- Try restarting the backend

### Still can't see errors?
- The backend might be running in a different terminal window
- Check Windows Task Manager for Python processes
- Kill all Python processes and restart

## Quick Test

To verify logging works, try registering a user from the frontend and watch the backend terminal. You should see `[DEBUG]` messages immediately.

