import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.db.database import engine, Base
from app.routes.gig_routes import router as gig_router

app = FastAPI(
    title="Freelance Job Microservice",
    description="Atomic microservice that handles CRUD for freelance gig listings.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(gig_router)

@app.on_event("startup")
def startup():
    retries = 20
    for i in range(retries):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            Base.metadata.create_all(bind=engine)
            print("Database connected and tables created!")
            break
        except Exception as e:
            print(f"Database not ready yet, retrying in 5 seconds... ({i+1}/{retries})")
            time.sleep(5)
    else:
        raise Exception("Database connection failed")

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "freelance-job-service"}