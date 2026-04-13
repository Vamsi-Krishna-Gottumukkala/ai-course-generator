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
    let ragContext = "";
    try {
        const pyRes = await fetch('http://127.0.0.1:8000/get-rag-context', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic, level, goals, duration, mode })
        });
        
        if (pyRes.ok) {
            const pyData = await pyRes.json();
            ragContext = pyData.context || "";
        }
    } catch (e) {
        console.warn("Failed to get RAG context from Python, proceeding natively:", e.message);
    }

    const aiClient = getAI();
    if (!aiClient) {
        return {
            title: topic,
            modules: [
                { title: "Module 1: Foundations", lessons: [{ title: "Overview", text_content: "Placeholder" }] }
            ]
        };
    }

    let instruction = "";
    if (mode === "Video") {
        instruction = `CRITICAL INSTRUCTION: This is a strictly Video-focused course. You MUST generate the JSON outline with modules and lesson titles accurately, but you MUST leave \`text_content\` completely BLANK as an empty string ("") for ALL lessons. Saving tokens is priority. Do NOT generate text descriptions.`;
    } else if (mode === "Fast Track") {
        instruction = `CRITICAL INSTRUCTION: You MUST write extensive, descriptive text for each lesson inside \`text_content\`. Treat each lesson as a full textbook chapter. Provide a minimum of 400 words per lesson in straight paragraph formats. Do NOT just give short summaries or use extensive listicles. Use rich HTML formatting (<h2>, <p>, <strong>) for readability. Ensure paragraphs flow naturally to explain real-world examples and context.`;
    } else {
        instruction = `CRITICAL INSTRUCTION: You MUST structure the \`text_content\` for each lesson as highly scannable study notes. Avoid long walls of paragraph text. Instead:\n- Use extensive bullet points, numbered lists, and short punchy sentences.\n- Use bold text for key terms and abbreviations where possible to speed up reading.\n- Break down concepts step-by-step with clear <h3> or <h4> subheadings.\n- Use rich HTML formatting (<ul>, <li>, <strong>, <code> blocks).\nThe student needs efficient, well-structured list-based notes to review the concepts securely.`;
    }

    const prompt = `You are an expert AI educator. Generate an extensively detailed, comprehensive, high-quality course about "${topic}".
Skill Level: ${level}
Goals: ${goals || 'Learn the fundamentals and practical applications deeply'}
Duration: ${duration}
Learning Mode: ${mode}

${instruction}

Use this retrieved real-world context if relevant to improve the course accuracy:
${ragContext}

Output strictly valid JSON with the following structure:
{
  "title": "Course Title",
  "modules": [
    {
      "title": "Module Title",
      "lessons": [
          {
              "title": "Lesson 1 Name",
              "text_content": "<html content>"
          }
      ]
    }
  ]
}`;

    const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });

    try {
        let cleaned = response.text;
        const start = cleaned.indexOf('{');
        const end = cleaned.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
            cleaned = cleaned.substring(start, end + 1);
        }
        return JSON.parse(cleaned);
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
        let cleaned = response.text;
        const start = cleaned.indexOf('{');
        const end = cleaned.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
            cleaned = cleaned.substring(start, end + 1);
        }
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("Failed to parse Quiz JSON", response.text);
        throw new Error("Invalid quiz output format from AI.");
    }
};

export const generateTest = async (topic, courseContent) => {
    const aiClient = getAI();
    if (!aiClient) {
        // Mock fallback
        return {
            questions: Array(20).fill(null).map((_, i) => ({
                question: `Mock Question ${i + 1} about ${topic}?`,
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswerIndex: 0,
                topicEmphasis: "Mock Topic",
                explanation: "This is a mock quiz."
            }))
        };
    }

    const prompt = `Generate a rigorous 20-question multiple choice test based on the actual concepts taught in this course content:
Topic: ${topic}
Content Details: "${courseContent}"

This test will evaluate the student's mastery of the entire syllabus. 

Output strictly valid JSON matching this exact schema for exactly 20 questions:
{
  "questions": [
    {
      "question": "Rigorous question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 0,
      "topicEmphasis": "The exact sub-topic this question covers (e.g. 'Neural Networks' or 'React Hooks')",
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
        let cleaned = response.text;
        const start = cleaned.indexOf('{');
        const end = cleaned.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
            cleaned = cleaned.substring(start, end + 1);
        }
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("Failed to parse Test JSON", response.text);
        throw new Error("Invalid test output format from AI.");
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
