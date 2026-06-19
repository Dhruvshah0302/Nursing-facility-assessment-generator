from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import averages, provider, quality

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://nursing-facility-assessment.vercel.app",
        "https://nursing-facility-assessment-generator.vercel.app",
        "https://*.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(provider.router, prefix="/provider", tags=["Provider"])
app.include_router(quality.router, prefix="/quality", tags=["Quality"])
app.include_router(averages.router, prefix="/averages", tags=["Averages"])

@app.get("/")
def root():
    return {"message": "Facility Assessment API is running"}