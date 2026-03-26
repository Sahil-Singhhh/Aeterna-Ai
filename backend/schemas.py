from pydantic import BaseModel, Field
from typing import List, Optional

class LifestyleInput(BaseModel):
    age: float = Field(..., ge=0, le=120)
    sleep_hours: float = Field(..., ge=0, le=24)
    steps_daily: int = Field(..., ge=0)
    hydration_liters: float = Field(..., ge=0, le=10)
    stress_level: int = Field(..., ge=1, le=10)

class HealthScoreResponse(BaseModel):
    health_score: float
    insights: List[str]

class PredictionRequest(BaseModel):
    months: int = Field(..., ge=1, le=1200)
    lifestyle: LifestyleInput

class TrajectoryPoint(BaseModel):
    month: int
    current_path_score: float
    optimized_path_score: float

class PredictionResponse(BaseModel):
    timeline: List[TrajectoryPoint]
    current_score: float
    optimized_score: float

class ReportParserRule(BaseModel):
    keyword_regex: str
    threshold: float
    action: str

class ChatRequest(BaseModel):
    message: str
    image_base64: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str

class ProfileInfo(BaseModel):
    age: float
    weight: float
    height: float
    conditions: List[str]

class DietRequest(BaseModel):
    lifestyle: LifestyleInput
    profile: ProfileInfo
    target_calories: int

class MealPlan(BaseModel):
    name: str
    desc: str
    macros: str

class DietResponse(BaseModel):
    strategy: str
    meals: List[MealPlan]

