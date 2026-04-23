import json
import os
from typing import List, Optional

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

load_dotenv()

app = FastAPI(title="MediGrid AI Service", version="1.0.0")

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"


class UsagePoint(BaseModel):
    date: str
    consumedQuantity: float


class ForecastRequest(BaseModel):
    itemId: str
    horizonDays: int = Field(default=14, ge=1, le=180)
    usageHistory: List[UsagePoint] = Field(default_factory=list)


class ExpiryRiskRequest(BaseModel):
    itemName: str
    currentStock: float = Field(ge=0)
    dailyUsageRate: float = Field(ge=0)
    daysToExpiry: int = Field(ge=1)


async def call_groq(system_prompt: str, user_prompt: str) -> Optional[str]:
    if not GROQ_API_KEY:
        return None

    payload = {
        "model": GROQ_MODEL,
        "temperature": 0.2,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "response_format": {"type": "json_object"}
    }

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(GROQ_ENDPOINT, json=payload, headers=headers)
        if response.status_code >= 400:
            raise HTTPException(status_code=502, detail=f"Groq API error: {response.text}")
        data = response.json()
        return data["choices"][0]["message"]["content"]


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "service": "medigrid-ai"}


@app.post("/forecast-demand")
async def forecast_demand(request: ForecastRequest) -> dict:
    if not request.usageHistory:
        return {
            "predictedDemand": max(1, request.horizonDays * 2),
            "confidence": "LOW",
            "reasoning": "Insufficient usage history. Returning heuristic estimate.",
        }

    avg_daily = sum(point.consumedQuantity for point in request.usageHistory) / len(request.usageHistory)
    heuristic = round(avg_daily * request.horizonDays, 2)

    prompt = {
        "itemId": request.itemId,
        "horizonDays": request.horizonDays,
        "usageHistory": [point.model_dump() for point in request.usageHistory],
        "instruction": "Return strict JSON with predictedDemand(number), confidence(string), reasoning(string).",
    }

    try:
        result = await call_groq(
            "You are a hospital supply forecasting assistant. Output JSON only.",
            json.dumps(prompt),
        )
        if not result:
            return {
                "predictedDemand": heuristic,
                "confidence": "MEDIUM",
                "reasoning": "Groq key not configured. Using average usage heuristic.",
            }

        cleaned_result = result.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(cleaned_result)
        parsed.setdefault("predictedDemand", heuristic)
        parsed.setdefault("confidence", "MEDIUM")
        parsed.setdefault("reasoning", "Computed via prompt-based inference")
        return parsed
    except json.JSONDecodeError:
        return {
            "predictedDemand": heuristic,
            "confidence": "MEDIUM",
            "reasoning": "Model returned non-JSON output. Falling back to heuristic.",
        }


@app.post("/expiry-risk")
async def expiry_risk(request: ExpiryRiskRequest) -> dict:
    coverage_days = request.currentStock / request.dailyUsageRate if request.dailyUsageRate > 0 else 9999
    if coverage_days >= request.daysToExpiry:
        heuristic_risk = "HIGH"
    elif coverage_days >= request.daysToExpiry * 0.7:
        heuristic_risk = "MEDIUM"
    else:
        heuristic_risk = "LOW"

    prompt = {
        "itemName": request.itemName,
        "currentStock": request.currentStock,
        "dailyUsageRate": request.dailyUsageRate,
        "daysToExpiry": request.daysToExpiry,
        "instruction": "Return strict JSON with riskLevel(HIGH|MEDIUM|LOW) and reasoning(string).",
    }

    try:
        result = await call_groq(
            "You are a hospital expiry-risk evaluator. Output JSON only.",
            json.dumps(prompt),
        )
        if not result:
            return {
                "riskLevel": heuristic_risk,
                "reasoning": "Groq key not configured. Using deterministic expiry heuristic.",
            }
        cleaned_result = result.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(cleaned_result)
        parsed.setdefault("riskLevel", heuristic_risk)
        parsed.setdefault("reasoning", "Computed via prompt-based inference")
        return parsed
    except json.JSONDecodeError:
        return {
            "riskLevel": heuristic_risk,
            "reasoning": "Model returned non-JSON output. Falling back to deterministic heuristic.",
        }
