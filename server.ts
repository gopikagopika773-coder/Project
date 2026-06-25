import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("Warning: GEMINI_API_KEY is not defined in environment variables.");
}

const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Schema definition for Structured Content Calendar
const contentCalendarSchema = {
  type: Type.OBJECT,
  properties: {
    niche: { type: Type.STRING },
    targetAudience: { type: Type.STRING },
    tone: { type: Type.STRING },
    platform: { type: Type.STRING },
    goal: { type: Type.STRING },
    days: {
      type: Type.ARRAY,
      description: "Array of exactly 7 days of structured, creative, high-engaging content ideas.",
      items: {
        type: Type.OBJECT,
        properties: {
          dayNumber: { type: Type.INTEGER, description: "Day number from 1 to 7" },
          dayName: { type: Type.STRING, description: "e.g., 'Day 1 (Monday)' or 'Day 1'" },
          topic: { type: Type.STRING, description: "Highly compelling and actionable post title/topic" },
          contentType: { 
            type: Type.STRING, 
            description: "Must be exactly one of: 'Post', 'Reel', 'Story', 'Carousel', 'Threads', or 'Video'"
          },
          bestPostingTime: { type: Type.STRING, description: "Recommended posting time, e.g. 09:30 AM or 05:00 PM" },
          captionIdea: { type: Type.STRING, description: "Full, premium, ready-to-use high-converting caption with an attention hook, value paragraph, line breaks, and clear Call To Action." },
          suggestedHashtags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Suggested hashtags specific to this individual post"
          },
          visualPrompt: { type: Type.STRING, description: "Detailed visual instructions/ideas for the photo, video reel, or carousel slides" },
          keyObjective: { type: Type.STRING, description: "Strategic objective, e.g., 'Education', 'Inspiration', 'Engagement', 'Authority', 'Promo'" }
        },
        required: [
          "dayNumber", 
          "dayName", 
          "topic", 
          "contentType", 
          "bestPostingTime", 
          "captionIdea", 
          "suggestedHashtags", 
          "visualPrompt", 
          "keyObjective"
        ]
      }
    },
    generalStrategy: { type: Type.STRING, description: "A high-level 1-2 sentence tactical recommendation for this calendar" },
    weeklyHashtagPool: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A pool of 10-15 relevant, high-performing industry hashtags"
    }
  },
  required: ["niche", "targetAudience", "tone", "platform", "goal", "days", "generalStrategy", "weeklyHashtagPool"]
};

// 1. Generate full 7-day content calendar
app.post("/api/generate-calendar", async (req, res) => {
  try {
    const { niche, targetAudience, tone, platform, goal } = req.body;

    if (!niche) {
      return res.status(400).json({ error: "Niche is required." });
    }

    const systemInstruction = `You are an elite Social Media Strategist and Copywriter.
Your goal is to build a highly actionable, highly engaging, premium 7-day content calendar tailored to the user's specific parameters.
Ensure each post has:
1. Compelling, scroll-stopping hooks.
2. Full, ready-to-publish, perfectly spaced captions (with line breaks, emojis, and clear Call to Actions).
3. Strategic variation of content types (Reels, Carousels, Stories, Posts).
4. Realistic, tailored posting times.
5. Highly visual creative directions (visualPrompt) to guide content creation.
6. Highly targeted, specific hashtags (avoid spammy general ones, use niche-specific).`;

    const prompt = `Create a 7-day social media content calendar for:
- Business/Niche: ${niche}
- Target Audience: ${targetAudience || "General Target Audience"}
- Brand Tone of Voice: ${tone || "Professional and Engaging"}
- Preferred Platform: ${platform || "All Platforms (Instagram/LinkedIn/TikTok)"}
- Primary Objective/Goal: ${goal || "Increase brand awareness and audience engagement"}

Ensure the JSON matches the schema exactly and returns structured calendar data for all 7 days.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: contentCalendarSchema,
        temperature: 1.0,
      }
    });

    if (!response.text) {
      throw new Error("Empty response received from Gemini.");
    }

    const calendar = JSON.parse(response.text.trim());
    return res.json(calendar);
  } catch (error: any) {
    console.error("Error generating content calendar:", error);
    return res.status(500).json({ 
      error: error.message || "Failed to generate content calendar. Please check your API key setup." 
    });
  }
});

// 2. Refine the entire calendar with a specific instructions
app.post("/api/refine-calendar", async (req, res) => {
  try {
    const { calendar, instruction } = req.body;

    if (!calendar || !instruction) {
      return res.status(400).json({ error: "Current calendar and refinement instructions are required." });
    }

    const systemInstruction = `You are an elite Social Media Strategist.
Take the existing 7-day content calendar and apply the requested refinement instruction carefully across the calendar, keeping the JSON structure identical.
Do not lose the original quality; only modify what is necessary to fulfill the user's specific instruction.`;

    const prompt = `Here is the current content calendar:
${JSON.stringify(calendar, null, 2)}

Refinement Request:
"${instruction}"

Please adjust the calendar according to this request and return the updated calendar matching the exact JSON schema structure.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: contentCalendarSchema,
        temperature: 0.9,
      }
    });

    if (!response.text) {
      throw new Error("Empty response received from Gemini refinement.");
    }

    const updatedCalendar = JSON.parse(response.text.trim());
    return res.json(updatedCalendar);
  } catch (error: any) {
    console.error("Error refining calendar:", error);
    return res.status(500).json({ error: error.message || "Failed to refine content calendar." });
  }
});

// 3. Refine a single day's content specifically
app.post("/api/refine-day", async (req, res) => {
  try {
    const { dayContent, instruction, niche, tone } = req.body;

    if (!dayContent || !instruction) {
      return res.status(400).json({ error: "Day content and instruction are required." });
    }

    const systemInstruction = `You are an expert Social Media Copywriter.
Refine the provided single-day post content according to the user's instruction.
Maintain the exact fields in the JSON object.
Return the updated day object matching the same schema fields.`;

    const singleDaySchema = {
      type: Type.OBJECT,
      properties: {
        dayNumber: { type: Type.INTEGER },
        dayName: { type: Type.STRING },
        topic: { type: Type.STRING },
        contentType: { type: Type.STRING },
        bestPostingTime: { type: Type.STRING },
        captionIdea: { type: Type.STRING },
        suggestedHashtags: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        visualPrompt: { type: Type.STRING },
        keyObjective: { type: Type.STRING }
      },
      required: ["dayNumber", "dayName", "topic", "contentType", "bestPostingTime", "captionIdea", "suggestedHashtags", "visualPrompt", "keyObjective"]
    };

    const prompt = `Niche: ${niche || "General"}
Tone of Voice: ${tone || "Engaging"}

Current Single Day Content:
${JSON.stringify(dayContent, null, 2)}

Refinement Request:
"${instruction}"

Update this day and return the single day object matching the original structure exactly.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: singleDaySchema,
        temperature: 0.95,
      }
    });

    if (!response.text) {
      throw new Error("Empty response received from Gemini day refinement.");
    }

    const updatedDay = JSON.parse(response.text.trim());
    return res.json(updatedDay);
  } catch (error: any) {
    console.error("Error refining single day:", error);
    return res.status(500).json({ error: error.message || "Failed to refine single day post." });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
