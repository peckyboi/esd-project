import time
import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.browse_gig_routes import router as browse_gig_router
from app.http_client import FREELANCE_JOB_SERVICE_URL, REVIEW_SERVICE_URL

app = FastAPI(
    title="Browse Gig Composite Service",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(browse_gig_router)

@app.on_event("startup")
async def startup():
    retries = 20
    dependencies = {
        "Freelance Job Service": f"{FREELANCE_JOB_SERVICE_URL}/health",
        "Review Service": f"{REVIEW_SERVICE_URL}/actuator/health"
    }
    
    for i in range(retries):
        all_ready = True
        async with httpx.AsyncClient() as client:
            try:
                for name, url in dependencies.items():
                    response = await client.get(url, timeout=2.0)
                    if response.status_code != 200:
                        all_ready = False
                        break
            except Exception:
                all_ready = False
        
        if all_ready:
            print("All dependent services are ready!")
            break
        else:
            print(f"Dependencies not ready yet, retrying in 5 seconds... ({i+1}/{retries})")
            time.sleep(5)
    else:
        raise Exception("Critical Dependencies (Job or Review Service) are unreachable. Startup aborted.")

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "browse-gig-composite"}