from schemas import LifestyleInput, TrajectoryPoint
from typing import List, Tuple

def calculate_health_score(lifestyle: LifestyleInput) -> float:
    # Adding age-adaptive logic based on Neural Profile
    age = getattr(lifestyle, 'age', 30)
    gender = getattr(lifestyle, 'gender', 'Other')
    weight = getattr(lifestyle, 'weight', 70.0)
    height = getattr(lifestyle, 'height', 170.0)
    conditions = getattr(lifestyle, 'conditions', [])
    
    S = lifestyle.sleep_hours
    W = lifestyle.steps_daily
    H = lifestyle.hydration_liters
    St = lifestyle.stress_level
    
    # 1. Age-Decay Curve: Base Vitality starts at 100 - (Age * 0.25)
    base_vitality = 100.0 - (age * 0.25)
    
    # Target calculations
    target_W = 10000.0
    # Gender Variance for Hydration
    if gender == 'Male':
        target_H = 3.7
    elif gender == 'Female':
        target_H = 2.7
    else:
        target_H = 3.2
        
    target_S = 7.5
    if age < 18:
        target_W = 12000.0
        target_S = 10.0
    elif age > 60:
        target_W = 6000.0
        target_S = 8.0
        
    # Calculate Component Points out of their respective weights (30, 25, 15, 30)
    s_points = min(30.0, (S / target_S * 30.0))
    # Older age (45+) Recovery Penalty
    if age >= 45 and S < 6.0:
        deficit = (target_S - S) / target_S * 30.0
        s_points = max(0.0, 30.0 - (deficit * 1.5))
        
    w_points = min(25.0, (W / target_W * 25.0))
    # Weight/Height Impact (BMI) Cost of inactivity
    height_m = height / 100.0
    bmi = weight / (height_m * height_m) if height_m > 0 else 22.0
    if not (18.5 <= bmi <= 25.0):
        if W < 4000:
            w_points = w_points * 0.5 # Vitality drops 2x faster
            
    h_points = min(15.0, (H / target_H * 15.0))
    st_points = max(0.0, min(30.0, ((11.0 - St) / 10.0 * 30.0)))
    
    # Hard-Caps: Diabetes
    if 'Diabetes' in conditions and H < 2.0:
        h_points = max(0.0, h_points - 10.0) # Immediate System Dehydration penalty
        
    # Hard-Caps: Hypertension
    if 'Hypertension' in conditions and St >= 8:
        st_points = max(0.0, st_points - 15.0) # Red Alert drop
        
    score = s_points + w_points + h_points + st_points
    # Apply proportional reduction based on age-decay base (so max is base_vitality)
    score = score * (base_vitality / 100.0)
    
    # Absolute Caps
    max_cap = base_vitality
    if 'Diabetes' in conditions and age >= 60:
        max_cap = min(max_cap, 80.0)
    elif age > 70:
        max_cap = min(max_cap, 90.0)
        
    return min(max_cap, max(0.0, score))

def generate_insights(lifestyle: LifestyleInput, score: float) -> List[str]:
    insights = []
    if lifestyle.sleep_hours < 7:
        insights.append("Increase sleep to at least 7-8 hours for optimal recovery.")
    elif lifestyle.sleep_hours > 9:
        insights.append("Consider capping sleep at 8 hours for better circadian rhythm.")
        
    if lifestyle.steps_daily < 8000:
        insights.append("Increase daily steps closer to 10,000 for better cardiovascular health.")
        
    if lifestyle.hydration_liters < 2.5:
        insights.append("Increase hydration to 3.5L daily to support metabolic functions.")
        
    if lifestyle.stress_level > 6:
        insights.append("Consider stress management techniques as high stress impacts overall longevity.")
        
    if score >= 90:
        insights.append("Excellent vitality score! Maintain current lifestyle for longevity.")
    elif score >= 70:
        insights.append("Good health baseline. Minor adjustments can lead to peak vitality.")
    else:
        insights.append("High risk for accelerated decay. Suggest immediate lifestyle adjustments.")
        
    return insights

def calculate_trajectory(current_score: float, age: float, lifestyle: LifestyleInput, months: int) -> Tuple[List[TrajectoryPoint], float, float]:
    timeline = []
    
    gender = getattr(lifestyle, 'gender', 'Other')
    weight = getattr(lifestyle, 'weight', 70.0)
    height = getattr(lifestyle, 'height', 170.0)
    conditions = getattr(lifestyle, 'conditions', [])
    
    # Calculate a rough delta from optimal based on current lifestyle vs optimal baseline
    optimal_score = calculate_health_score(
        LifestyleInput(
            age=age,
            gender=gender,
            weight=weight,
            height=height,
            conditions=conditions,
            sleep_hours=8,
            steps_daily=10000,
            hydration_liters=3.5,
            stress_level=1
        )
    )
    
    # Calculate dynamic max cap for simulation ceiling
    base_vitality = 100.0 - (age * 0.25)
    max_cap = base_vitality
    if 'Diabetes' in conditions and age >= 60:
        max_cap = min(max_cap, 80.0)
    elif age > 70:
        max_cap = min(max_cap, 90.0)
    
    # Bound the optimal growth ceiling safely
    ceiling = min(98.0, max_cap)
    
    # Current path: score * (1 - (age * 0.002)) over 60 months
    # Let's say decay_factor is calculated per month
    month_decay = (age * 0.002) / 60.0 # simple linear distribution matching formula description
    
    # Optimized path: score * (1 + lifestyle_delta * 0.005) capped at dynamic ceiling
    # Delta score ratio
    lifestyle_delta = optimal_score - current_score
    pulse_growth = (lifestyle_delta * 0.005) / 60.0 if lifestyle_delta > 0 else 0
    
    c_score: float = float(current_score)
    o_score: float = float(current_score)

    for m in range(months + 1):
        timeline.append(TrajectoryPoint(
            month=m,
            current_path_score=round(float(c_score), 2),
            optimized_path_score=round(float(o_score), 2)
        ))
        
        # apply decay for next month
        c_score = max(0.0, c_score * (1 - month_decay))
        
        # apply growth for next month, capped at dynamic ceiling
        o_score = min(ceiling, o_score * (1 + pulse_growth))
        
    final_current = timeline[-1].current_path_score
    final_optimized = timeline[-1].optimized_path_score
            
    return timeline, final_current, final_optimized

import os
import io
import base64
import json
import urllib.request
import urllib.error
from dotenv import load_dotenv

load_dotenv()

def generate_chat_response(message: str, image_base64: str = None) -> str:
    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key:
        import google.generativeai as genai
        from PIL import Image
            
        genai.configure(api_key=gemini_key)
        
        try:
            
            if image_base64:
                # remove data:image/... prefix if present
                if "," in image_base64:
                    image_base64 = image_base64.split(",")[1]
                
                image_data = base64.b64decode(image_base64)
                img = Image.open(io.BytesIO(image_data))
                
                model = genai.GenerativeModel('gemini-2.5-flash')
                response = model.generate_content([
                    f"You are Aeterna Nexus Vision AI. Analyze this image (e.g., report, skin issue, etc) and the user query: '{message}'. Be highly specific and direct. List your observations clearly. Suggest common OTC medications or treatments if applicable. Use short bullet points. Provide only a single short disclaimer at the very end: '*Disclaimer: I am an AI. Consult a doctor for professional advice.*'", 
                    img
                ])
                try:
                    return response.text
                except ValueError:
                    return "The AI processed the image but returned no text. This might be due to safety filters or a short prompt. Please try asking a clear question accompanied by the image."
            else:
                model = genai.GenerativeModel('gemini-2.5-flash')
                prompt = f"""You are Aeterna Nexus, a highly advanced Medical AI.
User Query: {message}

Instructions:
- Be EXTREMELY direct and specific. Dive straight into the medical analysis. DO NOT start with "I understand you are experiencing...".
- If symptoms are given, list the most likely conditions.
- Specify actual common Over-The-Counter (OTC) active ingredients (e.g., Paracetamol, Cetirizine, Ibuprofen) that are typically used for this issue and explain their purpose.
- Provide 3-4 bullet points for fast home remedies and precautions.
- Keep the response structured, clean, and concise. 
- Put exactly ONE short disclaimer at the very bottom: "*Disclaimer: I am an AI. Consult a healthcare provider for medical advice.*"
"""
                response = model.generate_content(prompt)
                try:
                    return response.text
                except ValueError:
                    return "The AI returned an empty response. Please try rephrasing your symptom or question, as it may have triggered safety filters without logging a formal violation."
        except Exception as e:
            return f"An error occurred with the Gemini AI service: {str(e)}"
    
    # Fallback to local Ollama if no API key
    url = "http://localhost:11434/api/generate"
    prompt = f"You are a helpful medical AI assistant. The user says: {message}. Provide useful suggestions, precautions, and general advice. End with a disclaimer."
    
    data = {
        "model": "llama3",
        "prompt": prompt,
        "stream": False
    }
    
    try:
        req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req, timeout=3) as response:
            result = json.loads(response.read().decode())
            return result.get('response', "I'm sorry, I couldn't generate a proper response.")
    except Exception:
        if not gemini_key:
            return "Please add your GEMINI_API_KEY to the backend .env file for advanced AI and Vision capabilities! (I tried reaching local Ollama as a fallback but failed).\n\nHowever, I can still help! Maintain basic healthy habits such as staying hydrated and getting proper rest. For accurate diagnosis regarding specific diseases, please consult a qualified healthcare professional."
        return "Failed to connect to AI providers."

def generate_dynamic_diet(req) -> dict:
    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        raise Exception("GEMINI_API_KEY is not configured.")
    import google.generativeai as genai
    genai.configure(api_key=gemini_key)
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    prompt = f"""You are Aeterna Nexus, a top-tier nutritionist AI. 
The user needs a dynamic daily diet plan based on their biometric data.

Data:
Age: {req.profile.age}, Weight: {req.profile.weight}kg, Height: {req.profile.height}cm
Medical Conditions: {', '.join(req.profile.conditions)}
Daily Steps: {req.lifestyle.steps_daily}
Sleep: {req.lifestyle.sleep_hours} hrs
Hydration: {req.lifestyle.hydration_liters} L
Target Calories for the day: {req.target_calories} kcal

Output JSON exactly in this format WITHOUT markdown ticks:
{{
  "strategy": "A highly specific 1-2 sentence core dietary strategy tailored to their conditions and calorie target.",
  "meals": [
    {{ "name": "Breakfast", "desc": "Detailed meal suggestion with portions.", "macros": "High Protein" }},
    {{ "name": "Lunch", "desc": "Detailed meal suggestion", "macros": "Balanced" }},
    {{ "name": "Snack", "desc": "Detailed snack suggestion", "macros": "Light Core" }},
    {{ "name": "Dinner", "desc": "Detailed meal suggestion", "macros": "Low Carb" }}
  ]
}}
"""
    response = model.generate_content(prompt)
    try:
        raw_text = response.text.strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        if raw_text.startswith("```"):
            raw_text = raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
        data = json.loads(raw_text.strip())
        return data
    except Exception as e:
        raise Exception(f"Failed to parse AI response: {str(e)}")
