import axios from 'axios';
import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(async (config) => {
    // Inject auth token from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
});

export const generateCourse = (data) => api.post('/generate-course', data);
export const generateQuiz = (lessonContent) => api.post('/generate-quiz', { lessonContent });
export const generateComprehensiveTest = (topic, courseContent) => api.post('/generate-test', { topic, courseContent });
export const chatWithTutor = (message, context) => api.post('/chat', { message, context });
export const fetchVideos = (query) => axios.get('http://localhost:8000/search-video', { params: { query } });

export default api;
