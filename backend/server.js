require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const services = require('./services');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aeterna';
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected successfully (MERN stack initialized)"))
  .catch(err => console.log("MongoDB connection warning:", err.message));

app.get('/', (req, res) => {
    res.json({ status: "Aeterna-AI API running (Node.js/Express)" });
});

app.post('/api/v1/analyze-lifestyle', (req, res) => {
    const lifestyle = req.body;
    const score = services.calculate_health_score(lifestyle);
    const insights = services.generate_insights(lifestyle, score);
    res.json({ health_score: Number(score.toFixed(2)), insights });
});

app.post('/api/v1/predict-trajectory', (req, res) => {
    const base_score = services.calculate_health_score(req.body.lifestyle);
    const result = services.calculate_trajectory(
        base_score,
        req.body.lifestyle.age,
        req.body.lifestyle,
        req.body.months
    );
    res.json({
        timeline: result.timeline,
        current_score: result.current_score,
        optimized_score: result.optimized_score
    });
});

app.post('/api/v1/chat', async (req, res) => {
    const { message, image_base64 } = req.body;
    const reply = await services.generate_chat_response(message, image_base64);
    res.json({ reply });
});

app.post('/api/v1/generate-diet', async (req, res) => {
    try {
        const data = await services.generate_dynamic_diet(req.body);
        res.json(data);
    } catch (e) {
        res.json({
            strategy: "Fallback strategy triggered due to a dynamic generation error.",
            meals: [{ name: "Error", desc: e.message, macros: "N/A" }]
        });
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
