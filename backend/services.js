const { GoogleGenerativeAI } = require("@google/generative-ai");

function calculate_health_score(lifestyle) {
    const age = lifestyle.age || 30;
    const gender = lifestyle.gender || 'Other';
    const weight = lifestyle.weight || 70.0;
    const height = lifestyle.height || 170.0;
    const conditions = lifestyle.conditions || [];
    
    const S = lifestyle.sleep_hours;
    const W = lifestyle.steps_daily;
    const H = lifestyle.hydration_liters;
    const St = lifestyle.stress_level;
    
    let base_vitality = 100.0 - (age * 0.25);
    
    let target_W = 10000.0;
    let target_H = 3.2;
    if (gender === 'Male') target_H = 3.7;
    else if (gender === 'Female') target_H = 2.7;
    
    let target_S = 7.5;
    if (age < 18) {
        target_W = 12000.0;
        target_S = 10.0;
    } else if (age > 60) {
        target_W = 6000.0;
        target_S = 8.0;
    }
    
    let s_points = Math.min(30.0, (S / target_S * 30.0));
    if (age >= 45 && S < 6.0) {
        let deficit = (target_S - S) / target_S * 30.0;
        s_points = Math.max(0.0, 30.0 - (deficit * 1.5));
    }
    
    let w_points = Math.min(25.0, (W / target_W * 25.0));
    let height_m = height / 100.0;
    let bmi = height_m > 0 ? weight / (height_m * height_m) : 22.0;
    if (!(bmi >= 18.5 && bmi <= 25.0)) {
        if (W < 4000) {
            w_points = w_points * 0.5;
        }
    }
    
    let h_points = Math.min(15.0, (H / target_H * 15.0));
    let st_points = Math.max(0.0, Math.min(30.0, ((11.0 - St) / 10.0 * 30.0)));
    
    if (conditions.includes('Diabetes') && H < 2.0) {
        h_points = Math.max(0.0, h_points - 10.0);
    }
    
    if (conditions.includes('Hypertension') && St >= 8) {
        st_points = Math.max(0.0, st_points - 15.0);
    }
    
    let score = s_points + w_points + h_points + st_points;
    score = score * (base_vitality / 100.0);
    
    let max_cap = base_vitality;
    if (conditions.includes('Diabetes') && age >= 60) {
        max_cap = Math.min(max_cap, 80.0);
    } else if (age > 70) {
        max_cap = Math.min(max_cap, 90.0);
    }
    
    return Math.min(max_cap, Math.max(0.0, score));
}

function generate_insights(lifestyle, score) {
    const insights = [];
    if (lifestyle.sleep_hours < 7) insights.push("Increase sleep to at least 7-8 hours for optimal recovery.");
    else if (lifestyle.sleep_hours > 9) insights.push("Consider capping sleep at 8 hours for better circadian rhythm.");
    
    if (lifestyle.steps_daily < 8000) insights.push("Increase daily steps closer to 10,000 for better cardiovascular health.");
    if (lifestyle.hydration_liters < 2.5) insights.push("Increase hydration to 3.5L daily to support metabolic functions.");
    if (lifestyle.stress_level > 6) insights.push("Consider stress management techniques as high stress impacts overall longevity.");
    
    if (score >= 90) insights.push("Excellent vitality score! Maintain current lifestyle for longevity.");
    else if (score >= 70) insights.push("Good health baseline. Minor adjustments can lead to peak vitality.");
    else insights.push("High risk for accelerated decay. Suggest immediate lifestyle adjustments.");
    
    return insights;
}

function calculate_trajectory(current_score, age, lifestyle, months) {
    const timeline = [];
    const gender = lifestyle.gender || 'Other';
    const weight = lifestyle.weight || 70.0;
    const height = lifestyle.height || 170.0;
    const conditions = lifestyle.conditions || [];
    
    const optimal_score = calculate_health_score({
        ...lifestyle,
        age, gender, weight, height, conditions,
        sleep_hours: 8, steps_daily: 10000, hydration_liters: 3.5, stress_level: 1
    });
    
    let base_vitality = 100.0 - (age * 0.25);
    let max_cap = base_vitality;
    if (conditions.includes('Diabetes') && age >= 60) max_cap = Math.min(max_cap, 80.0);
    else if (age > 70) max_cap = Math.min(max_cap, 90.0);
    
    const ceiling = Math.min(98.0, max_cap);
    
    const month_decay = (age * 0.002) / 60.0;
    const lifestyle_delta = optimal_score - current_score;
    const pulse_growth = lifestyle_delta > 0 ? (lifestyle_delta * 0.005) / 60.0 : 0;
    
    let c_score = parseFloat(current_score);
    let o_score = parseFloat(current_score);
    
    for (let m = 0; m <= months; m++) {
        timeline.push({
            month: m,
            current_path_score: Number(c_score.toFixed(2)),
            optimized_path_score: Number(o_score.toFixed(2))
        });
        c_score = Math.max(0.0, c_score * (1 - month_decay));
        o_score = Math.min(ceiling, o_score * (1 + pulse_growth));
    }
    
    const final_current = timeline[timeline.length - 1].current_path_score;
    const final_optimized = timeline[timeline.length - 1].optimized_path_score;
    
    return { timeline, current_score: final_current, optimized_score: final_optimized };
}

async function generate_chat_response(message, image_base64) {
    const gemini_key = process.env.GEMINI_API_KEY;
    if (gemini_key) {
        const genAI = new GoogleGenerativeAI(gemini_key);
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            
            if (image_base64) {
                let base64Data = image_base64;
                if (image_base64.includes(",")) {
                    base64Data = image_base64.split(",")[1];
                }
                const result = await model.generateContent([
                    `You are Aeterna Nexus Vision AI. Analyze this image (e.g., report, skin issue, etc) and the user query: '${message}'. Be highly specific and direct. List your observations clearly. Suggest common OTC medications or treatments if applicable. Use short bullet points. Provide only a single short disclaimer at the very end: '*Disclaimer: I am an AI. Consult a doctor for professional advice.*'`,
                    { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
                ]);
                return result.response.text();
            } else {
                const prompt = `You are Aeterna Nexus, a highly advanced Medical AI.
User Query: ${message}

Instructions:
- Be EXTREMELY direct and specific. Dive straight into the medical analysis. DO NOT start with "I understand you are experiencing...".
- If symptoms are given, list the most likely conditions.
- Specify actual common Over-The-Counter (OTC) active ingredients (e.g., Paracetamol, Cetirizine, Ibuprofen) that are typically used for this issue and explain their purpose.
- Provide 3-4 bullet points for fast home remedies and precautions.
- Keep the response structured, clean, and concise. 
- Put exactly ONE short disclaimer at the very bottom: "*Disclaimer: I am an AI. Consult a healthcare provider for medical advice.*"`;
                const result = await model.generateContent(prompt);
                return result.response.text();
            }
        } catch (e) {
            return `An error occurred with the Gemini AI service: ${e.message}`;
        }
    }
    return "Please add your GEMINI_API_KEY to the backend .env file for advanced AI and Vision capabilities!";
}

async function generate_dynamic_diet(req) {
    const gemini_key = process.env.GEMINI_API_KEY;
    if (!gemini_key) throw new Error("GEMINI_API_KEY is not configured.");
    
    const genAI = new GoogleGenerativeAI(gemini_key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `You are Aeterna Nexus, a top-tier nutritionist AI. 
The user needs a dynamic daily diet plan based on their biometric data.

Data:
Age: ${req.profile.age}, Weight: ${req.profile.weight}kg, Height: ${req.profile.height}cm
Medical Conditions: ${(req.profile.conditions || []).join(', ')}
Daily Steps: ${req.lifestyle.steps_daily}
Sleep: ${req.lifestyle.sleep_hours} hrs
Hydration: ${req.lifestyle.hydration_liters} L
Target Calories for the day: ${req.target_calories} kcal

Output JSON exactly in this format WITHOUT markdown ticks:
{
  "strategy": "A highly specific 1-2 sentence core dietary strategy tailored to their conditions and calorie target.",
  "meals": [
    { "name": "Breakfast", "desc": "Detailed meal suggestion with portions.", "macros": "High Protein" },
    { "name": "Lunch", "desc": "Detailed meal suggestion", "macros": "Balanced" },
    { "name": "Snack", "desc": "Detailed snack suggestion", "macros": "Light Core" },
    { "name": "Dinner", "desc": "Detailed meal suggestion", "macros": "Low Carb" }
  ]
}
`;
    const result = await model.generateContent(prompt);
    let raw_text = result.response.text().trim();
    if (raw_text.startsWith("```json")) raw_text = raw_text.slice(7);
    if (raw_text.startsWith("```")) raw_text = raw_text.slice(3);
    if (raw_text.endsWith("```")) raw_text = raw_text.slice(0, -3);
    
    return JSON.parse(raw_text.trim());
}

module.exports = {
    calculate_health_score,
    generate_insights,
    calculate_trajectory,
    generate_chat_response,
    generate_dynamic_diet
};
