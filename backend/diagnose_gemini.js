import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// Load .env manually
const require = createRequire(import.meta.url);
const dotenv = require('dotenv');
dotenv.config();

const OUT_FILE = path.resolve('./gemini_raw_response.txt');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const topic   = "Marketing";
const level   = "Beginner";
const goals   = "Understand core marketing principles";
const duration = "2 weeks";
const mode    = "Fast Track";

const instruction = `CRITICAL INSTRUCTION: You MUST write detailed, informative text for each lesson inside \`text_content\`. Treat each lesson as a concise textbook section (approximately 250 words per lesson). Use rich HTML formatting (<h2>, <p>, <strong>) for readability. Ensure paragraphs flow naturally with real-world examples. Do NOT use excessively long bullet lists.`;

const prompt = `You are an expert AI educator. Generate an extensively detailed, comprehensive, high-quality course about "${topic}".
Skill Level: ${level}
Goals: ${goals}
Duration: ${duration}
Learning Mode: ${mode}

${instruction}

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
- NEVER include raw/unescaped double-quote characters inside any string value. Use HTML entities like &quot; if needed.
- Do NOT add trailing commas after the last item in any array or object.
- Do NOT truncate the JSON — always close every bracket and brace fully.
- Keep each lesson's text_content concise enough to ensure the full JSON response fits within the output limit.`;

console.log("Calling Gemini API...");
console.log(`Topic: ${topic}, Mode: ${mode}, Duration: ${duration}`);
console.log("------------------------------------------------------------");

try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            maxOutputTokens: 65536
        }
    });

    const rawText = response.text || '';
    
    // Write the raw response to file
    fs.writeFileSync(OUT_FILE, rawText, 'utf8');
    console.log(`✅ Raw response saved to: ${OUT_FILE}`);
    console.log(`   Total characters: ${rawText.length}`);
    console.log(`   Total lines:      ${rawText.split('\n').length}`);
    console.log("------------------------------------------------------------");
    console.log("First 300 chars:");
    console.log(rawText.slice(0, 300));
    console.log("\n...\n");
    console.log("Last 300 chars:");
    console.log(rawText.slice(-300));
    console.log("------------------------------------------------------------");

    // Try to parse
    try {
        let cleaned = rawText;
        const start = cleaned.indexOf('{');
        const end   = cleaned.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
            cleaned = cleaned.substring(start, end + 1);
        }
        cleaned = cleaned.replace(/[\n\r\t]/g, ' ');
        cleaned = cleaned.replace(/,(\s*[\]}])/g, '$1');
        
        const parsed = JSON.parse(cleaned);
        console.log("✅ JSON.parse SUCCEEDED!");
        const modules = parsed.modules || [];
        let totalLessons = 0;
        modules.forEach(m => { totalLessons += (m.lessons || []).length; });
        console.log(`   Course title: ${parsed.title}`);
        console.log(`   Modules: ${modules.length}`);
        console.log(`   Total lessons: ${totalLessons}`);
    } catch (parseErr) {
        console.error("❌ JSON.parse FAILED!");
        console.error(`   Error: ${parseErr.message}`);

        // Find the approx character position of the error
        const match = parseErr.message.match(/position (\d+)/);
        if (match) {
            const pos = parseInt(match[1]);
            console.log(`\n   Context around position ${pos}:`);
            const rawForPos = rawText.replace(/[\n\r\t]/g, ' ');
            console.log(`   ...${rawForPos.slice(Math.max(0, pos - 100), pos + 100)}...`);
        }

        // Also save a cleaned version for manual inspection
        const cleanedFile = path.resolve('./gemini_cleaned_response.txt');
        let cleanedDump = rawText.replace(/[\n\r\t]/g, ' ').replace(/,(\s*[\]}])/g, '$1');
        fs.writeFileSync(cleanedFile, cleanedDump, 'utf8');
        console.log(`\n   Cleaned version saved to: ${cleanedFile}`);
    }
} catch (apiErr) {
    console.error("❌ Gemini API call FAILED!");
    console.error(apiErr);
}
