"""
FastAPI Main Application - Simplified for testing
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="RateTheDoctor API",
    description="AI-powered doctor discovery, booking, and review platform for South Africa",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "RateTheDoctor API", "version": "1.0.0", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "RateTheDoctor API"}

@app.get("/api/doctors")
async def get_doctors():
    """Get doctors list (mock)"""
    return {
        "success": True,
        "data": {
            "doctors": [
                {
                    "id": "1",
                    "name": "Dr. John Doe",
                    "specialization": "General Practitioner",
                    "rating": 4.5,
                    "verified": True
                }
            ]
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

