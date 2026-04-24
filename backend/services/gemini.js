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

/**
 * Model waterfall with smart error classification.
 *
 * Error handling strategy:
 *  - 503 SERVICE_UNAVAILABLE   → model overloaded, retry same model with longer wait, then switch
 *  - 429 RESOURCE_EXHAUSTED    → daily/minute quota gone; skip to next model immediately (no retry)
 *  - 429 RATE_LIMITED (non-zero limit) → requests/min exceeded; brief wait then switch
 *  - 404 NOT_FOUND             → model not available in this API version; skip immediately
 *  - anything else             → real error, propagate immediately
 *
 * Models confirmed available for this API version (from ListModels):
 */
const MODELS = [
    'gemini-2.5-flash',      // primary: latest, most capable
    'gemini-2.5-flash-lite', // fallback 1: lighter 2.5 variant
    'gemini-3-flash-preview', // fallback 2: next-gen flash
];

/** Returns true when the 429 is a hard quota exhaustion (daily limit = 0, no point retrying) */
const isQuotaExhausted = (err) => {
    try {
        const body = typeof err.message === 'string' ? JSON.parse(err.message) : err;
        const status = body?.error?.status;
        if (status === 'RESOURCE_EXHAUSTED') {
            // "limit: 0" in the message signals daily quota is fully gone
            return body?.error?.message?.includes('limit: 0') ?? false;
        }
    } catch (_) {}
    return false;
};

const withModelFallback = async (fn, label = 'Gemini') => {
    let lastErr;

    for (let mi = 0; mi < MODELS.length; mi++) {
        const model = MODELS[mi];
        // 503: retry same model up to 3 times with longer waits (server just busy)
        // 429/404: at most 1 attempt before switching to next model
        const maxAttempts = 3;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                if (mi > 0 || attempt > 1) {
                    console.warn(`[${label}] Trying model: ${model} (attempt ${attempt})`);
                }
                return await fn(model);
            } catch (err) {
                const status = err?.status ?? err?.error?.code;
                const code = err?.cause?.code || err?.code;
                lastErr = err;

                const isTimeout = code === 'UND_ERR_HEADERS_TIMEOUT' || code === 'UND_ERR_CONNECT_TIMEOUT' || err.message?.includes('fetch failed');

                // ── Non-retryable errors ──────────────────────────────────────────────
                if (![429, 503, 404].includes(status) && !isTimeout) {
                    throw err; // auth failure, bad request, etc. — no point retrying
                }

                // ── Model not in this API version (404) ──────────────────────────────
                if (status === 404) {
                    console.warn(`[${label}] ${model} not available (404). Switching model...`);
                    break; // skip to next model immediately
                }

                // ── Daily quota fully exhausted (429 RESOURCE_EXHAUSTED, limit 0) ────
                if (isQuotaExhausted(err)) {
                    console.warn(`[${label}] ${model} daily quota exhausted. Switching model...`);
                    break; // no point retrying — quota won't restore until tomorrow
                }

                // ── Overloaded (503) or minute-rate-limit (429) or Timeout ──────────
                if (attempt < maxAttempts) {
                    // Exponential back-off: 3s → 6s → 12s (gives overloaded server time to recover)
                    const waitMs = 3000 * Math.pow(2, attempt - 1);
                    console.warn(`[${label}] ${model} returned ${status || 'TIMEOUT'}. Retrying in ${waitMs / 1000}s...`);
                    await new Promise(r => setTimeout(r, waitMs));
                } else {
                    console.warn(`[${label}] ${model} still unavailable after ${maxAttempts} attempts. Switching model...`);
                }
            }
        }
    }

    console.error(`[${label}] All models exhausted.`);
    throw lastErr;
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
        instruction = `CRITICAL INSTRUCTION: You MUST write detailed, informative text for each lesson inside \`text_content\`. Treat each lesson as a concise textbook section (approximately 250 words per lesson). Use rich HTML formatting (<h2>, <p>, <strong>) for readability. Ensure paragraphs flow naturally with real-world examples. Do NOT use excessively long bullet lists.`;
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
}

JSON SAFETY RULES (MUST FOLLOW):
- All string values MUST use only double-quoted JSON strings.
- NEVER include raw/unescaped double-quote characters (\`) inside any string value. Use HTML entities like &quot; if needed.
- Do NOT add trailing commas after the last item in any array or object.
- Do NOT truncate the JSON — always close every bracket and brace fully.
- Keep each lesson's text_content concise enough to ensure the full JSON response fits within the output limit.`;

    const courseSchema = {
        type: "OBJECT",
        properties: {
            title: { type: "STRING" },
            modules: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        title: { type: "STRING" },
                        lessons: {
                            type: "ARRAY",
                            items: {
                                type: "OBJECT",
                                properties: {
                                    title: { type: "STRING" },
                                    text_content: { type: "STRING" }
                                },
                                required: ["title", "text_content"]
                            }
                        }
                    },
                    required: ["title", "lessons"]
                }
            }
        },
        required: ["title", "modules"]
    };

    const response = await withModelFallback(
        (model) => aiClient.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: courseSchema,
                maxOutputTokens: 65536
            }
        }),
        'generateCourse'
    );

    try {
        let cleaned = response.text;
        // responseSchema guarantees valid JSON, but we safely substring just in case
        const start = cleaned.indexOf('{');
        const end = cleaned.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
            cleaned = cleaned.substring(start, end + 1);
        }
        return JSON.parse(cleaned);
    } catch (e) {
        const preview = response.text?.slice(-500) || '';
        console.error(`[generateCourse] JSON parse failed. Last 500 chars of response:\n${preview}`);
        console.error(`Parse error: ${e.message}`);
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

    const quizSchema = {
        type: "OBJECT",
        properties: {
            questions: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        question: { type: "STRING" },
                        options: { type: "ARRAY", items: { type: "STRING" } },
                        correctAnswerIndex: { type: "INTEGER" },
                        explanation: { type: "STRING" }
                    },
                    required: ["question", "options", "correctAnswerIndex", "explanation"]
                }
            }
        },
        required: ["questions"]
    };

    const response = await withModelFallback(
        (model) => aiClient.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: quizSchema,
                maxOutputTokens: 8192
            }
        }),
        'generateQuiz'
    );

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
            questions: Array(15).fill(null).map((_, i) => ({
                question: `Mock Question ${i + 1} about ${topic}?`,
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswerIndex: 0,
                topicEmphasis: "Mock Topic",
                explanation: "This is a mock quiz."
            }))
        };
    }

    const prompt = `Generate a rigorous 15-question multiple choice test based on the actual concepts taught in this course content:
Topic: ${topic}
Content Details: "${courseContent}"

This test will evaluate the student's mastery of the entire syllabus. 

Output strictly valid JSON matching this exact schema for exactly 15 questions:
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

    const testSchema = {
        type: "OBJECT",
        properties: {
            questions: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        question: { type: "STRING" },
                        options: { type: "ARRAY", items: { type: "STRING" } },
                        correctAnswerIndex: { type: "INTEGER" },
                        topicEmphasis: { type: "STRING" },
                        explanation: { type: "STRING" }
                    },
                    required: ["question", "options", "correctAnswerIndex", "topicEmphasis", "explanation"]
                }
            }
        },
        required: ["questions"]
    };

    const response = await withModelFallback(
        (model) => aiClient.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: testSchema,
                maxOutputTokens: 16384
            }
        }),
        'generateTest'
    );

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

    const response = await withModelFallback(
        (model) => aiClient.models.generateContent({
            model,
            contents: prompt
        }),
        'generateChatReply'
    );

    return response.text;
};
