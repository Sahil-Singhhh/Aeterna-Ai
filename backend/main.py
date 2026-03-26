from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from schemas import LifestyleInput, HealthScoreResponse, PredictionRequest, PredictionResponse, ChatRequest, ChatResponse, DietRequest, DietResponse
import services

app = FastAPI(title="Aeterna-AI Backend", version="2.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "Aeterna-AI API running"}

@app.post("/api/v1/analyze-lifestyle", response_model=HealthScoreResponse)
def analyze_lifestyle(lifestyle: LifestyleInput):
    score = services.calculate_health_score(lifestyle)
    insights = services.generate_insights(lifestyle, score)
    return HealthScoreResponse(health_score=round(score, 2), insights=insights)

@app.post("/api/v1/predict-trajectory", response_model=PredictionResponse)
def predict_trajectory(req: PredictionRequest):
    base_score = services.calculate_health_score(req.lifestyle)
    timeline, c_score, o_score = services.calculate_trajectory(
        current_score=base_score,
        age=req.lifestyle.age,
        lifestyle=req.lifestyle,
        months=req.months
    )
    return PredictionResponse(
        timeline=timeline,
        current_score=c_score,
        optimized_score=o_score
    )

@app.post("/api/v1/chat", response_model=ChatResponse)
def chat_with_ai(req: ChatRequest):
    reply = services.generate_chat_response(req.message, req.image_base64)
    return ChatResponse(reply=reply)

@app.post("/api/v1/generate-diet", response_model=DietResponse)
def generate_diet(req: DietRequest):
    try:
        data = services.generate_dynamic_diet(req)
        return DietResponse(**data)
    except Exception as e:
        return DietResponse(
            strategy="Fallback strategy triggered due to a dynamic generation error.",
            meals=[{"name": "Error", "desc": str(e), "macros": "N/A"}]
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
