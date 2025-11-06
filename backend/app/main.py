"""
FastAPI Main Application
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.exceptions import RequestValidationError, HTTPException
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.routes import auth, doctors, hospitals
# Temporarily disabled
# from app.routes import ai
from app.database import engine, Base
from app.models import enhanced_models
# Temporarily disabled until services/dependencies are implemented
# from app.routes import appointments, admin, reviews, payments

# Create database tables on startup
try:
    Base.metadata.create_all(bind=engine)
    print("[OK] Database tables created/verified")
except Exception as e:
    print(f"[WARNING] Database initialization warning: {e}")

app = FastAPI(
    title="RateTheDoctor API",
    description="AI-powered doctor discovery, booking, and review platform for South Africa",
    version="1.0.0"
)

# Startup event to verify app is loading
@app.on_event("startup")
async def startup_event():
    print("[OK] FastAPI app started successfully")
    print("[OK] Exception handlers registered")

# Add middleware FIRST to catch all errors - MUST be before other middleware
@app.middleware("http")
async def catch_exceptions_middleware(request: Request, call_next):
    import sys
    # Force flush to ensure output appears immediately
    sys.stdout.flush()
    sys.stderr.flush()
    
    try:
        print(f"\n{'='*60}", flush=True)
        print(f"[DEBUG] ===== NEW REQUEST =====", flush=True)
        print(f"[DEBUG] Method: {request.method}", flush=True)
        print(f"[DEBUG] Path: {request.url.path}", flush=True)
        print(f"[DEBUG] Full URL: {request.url}", flush=True)
        
        response = await call_next(request)
        
        print(f"[DEBUG] Response status: {response.status_code}", flush=True)
        content_type = response.headers.get('content-type', '')
        print(f"[DEBUG] Response content-type: {content_type}", flush=True)
        
        # Check if response is plain text error - convert to JSON
        if response.status_code >= 400 and 'text/plain' in content_type:
            print(f"[ERROR] Plain text error detected! Status: {response.status_code}", flush=True)
            # Return JSON error instead of plain text
            return JSONResponse(
                status_code=response.status_code,
                content={"detail": "Internal server error", "message": "An error occurred on the server", "type": "ServerError"}
            )
        
        return response
    except Exception as exc:
        import traceback
        error_trace = traceback.format_exc()
        error_msg = str(exc)
        error_type = type(exc).__name__
        print(f"[ERROR] Middleware caught error: {error_type}: {error_msg}", flush=True)
        print(error_trace, flush=True)
        return JSONResponse(
            status_code=500,
            content={"detail": error_msg, "type": error_type, "message": f"{error_type}: {error_msg}"}
        )

# Register exception handlers AFTER middleware
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle FastAPI HTTP exceptions"""
    detail = exc.detail
    if isinstance(detail, dict):
        return JSONResponse(status_code=exc.status_code, content=detail)
    return JSONResponse(status_code=exc.status_code, content={"detail": str(detail), "message": str(detail)})

@app.exception_handler(StarletteHTTPException)
async def starlette_http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle Starlette HTTP exceptions"""
    detail = exc.detail
    if isinstance(detail, dict):
        return JSONResponse(status_code=exc.status_code, content=detail)
    return JSONResponse(status_code=exc.status_code, content={"detail": str(detail), "message": str(detail)})

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle request validation errors"""
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "message": "Validation error", "type": "ValidationError"}
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler to catch all errors"""
    import traceback
    import sys
    error_trace = traceback.format_exc()
    error_msg = str(exc)
    error_type = type(exc).__name__
    print(f"\n{'='*60}", flush=True)
    print(f"[ERROR] Global error handler: {error_type}: {error_msg}", flush=True)
    print(f"[ERROR] Request: {request.method} {request.url.path}", flush=True)
    print(error_trace, flush=True)
    sys.stdout.flush()
    sys.stderr.flush()
    return JSONResponse(
        status_code=500,
        content={"detail": error_msg, "type": error_type, "message": f"{error_type}: {error_msg}"}
    )

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "https://ratethedoctor.co.za"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted hosts
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["ratethedoctor.co.za", "*.ratethedoctor.co.za", "localhost", "127.0.0.1"]
)

# Rate limiting disabled for now to fix FastAPI issues

# Include routers
print("[DEBUG] Including routers...", flush=True)
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
print("[DEBUG] Auth router included", flush=True)
app.include_router(doctors.router, prefix="/api/doctors", tags=["Doctors"])
app.include_router(hospitals.router, prefix="/api/hospitals", tags=["Hospitals"])
print("[DEBUG] All routers included", flush=True)
# Temporarily disabled until services/dependencies are implemented
# app.include_router(appointments.router, prefix="/api/appointments", tags=["Appointments"])
# app.include_router(reviews.router, prefix="/api/reviews", tags=["Reviews"])
# app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
# app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
# Temporarily disabled due to dependency injection issues
# app.include_router(ai.router, prefix="/api/ai", tags=["AI"])

@app.get("/")
async def root():
    return {"message": "RateTheDoctor API", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy", "message": "Backend is running"}

@app.get("/api/test")
async def test_get():
    """Simple test endpoint"""
    print("[DEBUG] GET /api/test called")
    return {"status": "ok", "message": "Backend is accessible"}

@app.post("/api/test")
async def test_post(request: Request):
    """Test endpoint to verify routing works"""
    print("[DEBUG] ===== TEST POST ENDPOINT CALLED =====")
    try:
        body = await request.json()
        print(f"[DEBUG] Request body: {body}")
        return {"status": "ok", "received": body, "message": "Test endpoint works!"}
    except Exception as e:
        print(f"[ERROR] Test endpoint error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

