import { GoogleGenAI } from '@google/genai';
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import jiraRoutes from './routes/jiraRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', jiraRoutes);

console.log('JIRA_BASE_URL:', process.env.JIRA_BASE_URL);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


app.post("/api/ai-report", async (req, res) => {
    const { data, prompt } = req.body;
    // console.log(data,'data',prompt,'prompt')
    if (!data || !prompt) return res.status(400).json({ error: "Missing data or prompt" });
    try {
        const completion = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            // model: 'gemini-2.0-flash-001',
            contents: [
                {
                    parts: [
                        { text: `${prompt}` },
                        { text: `Data to analyze: ${JSON.stringify(data)}` } // Convert data to a string
                    ],
                }
            ],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 800,
                topP: 0.95,
                topK: 40,
               
            }
        })
        // console.log(completion.candidates[0].content.parts[0].JSON,'completion===========> ')
        res.send({ reply: completion.text });

    } catch (error) {
        console.error("Error from Gemini API:", error);
        if (error.response && error.response.status) {
            res.status(error.response.status).json({
                error: `API Error ${error.response.status}: ${error.response.statusText || error.message}. ${error.response.data ? JSON.stringify(error.response.data) : ''}`
            });
        }
        else {
            res.status(500).json({ error: `Internal Server Error: ${error.message}` });
        }
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack for debugging
    res.status(500).json({ error: 'Something went wrong on the server.' });
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log("Server running on http://localhost:3001"));
