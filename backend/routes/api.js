import express from 'express';
import { generateCourse, generateQuiz, generateChatReply } from '../services/gemini.js';
import { fetchVideos } from '../services/youtube.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(requireAuth);

router.post('/generate-course', async (req, res) => {
    try {
        const { topic, level, goals, duration, mode } = req.body;
        
        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' });
        }

        const courseData = await generateCourse(topic, level, goals, duration, mode);
        res.json(courseData);
    } catch (error) {
        console.error('Error generating course:', error);
        res.status(500).json({ error: 'Failed to generate course. Please try again later.' });
    }
});

router.post('/generate-quiz', async (req, res) => {
    try {
        const { lessonContent } = req.body;
        
        if (!lessonContent) return res.status(400).json({ error: 'Lesson content is required' });

        const quizData = await generateQuiz(lessonContent);
        res.json(quizData);
    } catch (error) {
        console.error('Error generating quiz:', error);
        res.status(500).json({ error: 'Failed to generate quiz' });
    }
});

router.post('/chat', async (req, res) => {
    try {
        const { message, context } = req.body;
        
        if (!message) return res.status(400).json({ error: 'Message is required' });

        const reply = await generateChatReply(message, context);
        res.json({ reply });
    } catch (error) {
        console.error('Error in chat:', error);
        res.status(500).json({ error: 'Failed to process chat message' });
    }
});

router.get('/videos', async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const videos = await fetchVideos(query);
        res.json({ videos });
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ error: 'Failed to fetch videos' });
    }
});

export default router;
