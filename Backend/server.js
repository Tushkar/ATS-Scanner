import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
const PORT = process.env.PORT || 5000;

dotenv.config();

const app = express();
app.use(bodyParser.json({ limit: "10mb" }));
app.use(cors());

// const genAI = new GoogleGenerativeAI("AIzaSyDEh17LBGes4_o5ZjF-1nVP6Ih0BgaBbIQ");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

app.post("/scan", async (req, res) => {
  try {
    const { resume, jobDescription } = req.body;

    const prompt = `
You are an ATS scanner.
Compare this resume with the job description and return results **only in JSON** with this format (no explanations, no markdown, no code fences):

{
  "match_score": <number>,
  "matched_keywords": ["keyword1", "keyword2"],
  "missing_keywords": ["keyword3", "keyword4"],
  "suggestions": ["suggestion1", "suggestion2"]
}

Resume:
${resume}

Job Description:
${jobDescription}
`;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text();

    
    responseText = responseText.replace(/```json|```/g, "").trim();

    
    let jsonData;
    try {
      jsonData = JSON.parse(responseText);
    } catch (err) {
      console.error("JSON parse error:", err);
      
      return res.status(500).json({ error: "Failed to respond" });
    }

    res.json(jsonData);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(PORT, () =>
  console.log(` Server running on http://localhost:${PORT}`)
);
