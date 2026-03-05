from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, Base
from app.routes.gig_routes import router as gig_router

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Freelance Job Microservice",
    description="Atomic microservice that handles CRUD for freelance gig listings.",
    version="1.0.0",
)

# Allow requests from the frontend and composite services
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(gig_router)


@app.get("/health")
def health_check():
    """Health check endpoint for Docker and API Gateway."""
    return {"status": "healthy", "service": "freelance-job-service"}
