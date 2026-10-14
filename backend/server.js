
import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();



app.use(cors());
app.use(express.json());

const client = new OpenAI({
    baseURL: "https://api-inference.modelscope.ai/v1",
    apiKey: process.env.MODELSCOPE_API_KEY,
});

app.post("/generate", async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({
                error: "Prompt is required",
            });
        }

        const r = await client.chat.completions.create({
            model: "deepseek-ai/DeepSeek-V4.1-Flash",
            messages: [
                { role: "user", content: prompt },
            ],
             max_tokens: 100,
        });

        res.json({
            text: r.choices[0].message.content,
        });

    } catch (e) {
        console.error("API Error:", {
            message: e.message,
            status: e.status,
            code: e.code,
            type: e.type,
        });

        res.status(e.status || 500).json({
            error: e.message,
        });
    }
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 
