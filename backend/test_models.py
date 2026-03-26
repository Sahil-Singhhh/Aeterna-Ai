import os
import google.generativeai as genai
import json
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

try:
    models = []
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            models.append(m.name)
    with open('models.json', 'w', encoding='utf-8') as f:
        json.dump(models, f)
except Exception as e:
    with open('models.json', 'w', encoding='utf-8') as f:
        json.dump({"error": str(e)}, f)
