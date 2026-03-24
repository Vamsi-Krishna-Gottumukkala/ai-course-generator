import { GoogleGenAI } from '@google/genai';

let ai;

const getAI = () => {
    if (!ai) {
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.trim() === '') {
            console.warn("WARN: GEMINI_API_KEY is not set. Using mock mode for Gemini responses.");
        } else {
            console.log("Initializing Gemini API client...");
            ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        }
    }
    return ai;
};

export const generateCourse = async (topic, level, goals, duration, mode) => {
    const aiClient = getAI();
    if (!aiClient) {
        // Mock fallback if no API key
        return {
            title: topic,
            modules: [
                { title: "Module 1: Foundations", lessons: ["Overview", "Basic Concepts"] },
                { title: "Module 2: Advanced", lessons: ["Deep Dive", "Conclusion"] }
            ]
        };
    }

    const prompt = `You are an expert AI educator. Generate a highly structured course outline about "${topic}".
Skill Level: ${level}
Goals: ${goals || 'Learn the fundamentals and practical applications'}
Duration: ${duration}
Learning Mode: ${mode}

Output strictly valid JSON with the following structure:
{
  "title": "Course Title",
  "modules": [
    {
      "title": "Module Title",
      "lessons": ["Lesson 1 Name", "Lesson 2 Name"]
    }
  ]
}`;

    const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });

    try {
        return JSON.parse(response.text);
    } catch (e) {
        console.error("Failed to parse JSON", response.text);
        throw new Error("Invalid output format from AI. Expected JSON.");
    }
};

export const generateQuiz = async (lessonContent) => {
    const aiClient = getAI();
    if (!aiClient) {
        // Mock fallback
        return {
            questions: [
                {
                    question: "Mock Question 1?",
                    options: ["A", "B", "C", "D"],
                    correctAnswerIndex: 0,
                    explanation: "This is a mock quiz because no API key is specified."
                }
            ]
        };
    }

    const prompt = `Generate a 3-question multiple choice quiz based on this content:
"${lessonContent}"

Output strictly valid JSON matching this schema:
{
  "questions": [
    {
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}`;

    const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });

    try {
        return JSON.parse(response.text);
    } catch (e) {
        console.error("Failed to parse Quiz JSON", response.text);
        throw new Error("Invalid quiz output format from AI.");
    }
};

export const generateChatReply = async (message, context) => {
    const aiClient = getAI();
    if (!aiClient) {
        return "This is a mock reply from your AI Tutor. Please configure GEMINI_API_KEY to see real responses.";
    }

    const prompt = `You are an expert, encouraging AI Tutor. 
Context of what the student is learning right now: ${context}
Student asks: ${message}

Provide a concise, helpful, and easily digestible response.`;

    const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    return response.text;
};
