from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import sys
import os
import json
import asyncio
from concurrent.futures import ThreadPoolExecutor

# Load env before any agent imports
from dotenv import load_dotenv
env_path = os.path.join(os.path.dirname(__file__), "src", ".env")
if os.path.exists(env_path):
    load_dotenv(env_path)

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))

from agent import run_agent

_executor = ThreadPoolExecutor(max_workers=4)

async def run_agent_async(user_input: str) -> str:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(_executor, run_agent, user_input)

app = FastAPI(title="Deep Competitive Analyst API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisRequest(BaseModel):
    company_a: str
    company_b: str
    focus_areas: list[str] = ["products", "pricing", "market_position", "strengths_weaknesses"]

class AnalysisResponse(BaseModel):
    run_id: str
    status: str
    output: str | None = None

class CompanyProfileRequest(BaseModel):
    company: str
    focus_areas: list[str] = ["products", "pricing", "market_position", "strengths_weaknesses"]

class GenericRunRequest(BaseModel):
    prompt: str

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/run", response_model=AnalysisResponse)
async def generic_run(request: GenericRunRequest):
    try:
        result = await run_agent_async(request.prompt)
        return AnalysisResponse(
            run_id=str(hash(request.prompt)),
            status="completed",
            output=result,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze(request: AnalysisRequest):
    try:
        user_input = (
            f"Conduct a thorough competitive analysis between {request.company_a} and {request.company_b}. "
            f"Focus areas: {', '.join(request.focus_areas)}. "
            f"Create company profiles for both companies and a competitive analysis report."
        )

        result = await run_agent_async(user_input)

        return AnalysisResponse(
            run_id=str(hash(str(request))),
            status="completed",
            output=result,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/company-profile")
async def company_profile(request: CompanyProfileRequest):
    try:
        user_input = (
            f"Create a detailed company profile for {request.company}. "
            f"Focus areas: {', '.join(request.focus_areas)}."
        )

        result = await run_agent_async(user_input)

        return AnalysisResponse(
            run_id=str(hash(str(request.company))),
            status="completed",
            output=result,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.environ.get("DCA_PORT", 8010))
    uvicorn.run(app, host="0.0.0.0", port=port)
