import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ModuleList from '../components/ModuleList';
import Chatbot from '../components/Chatbot';
import QuizModal from '../components/QuizModal';
import { fetchVideos } from '../services/api';
import './CourseView.css';

const CourseView = () => {
    const [isQuizVisible, setIsQuizVisible] = useState(false);
    const [course, setCourse] = useState(null);
    const [activeLesson, setActiveLesson] = useState(null);
    const [video, setVideo] = useState(null);
    const [loadingVideo, setLoadingVideo] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('currentCourse');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setCourse(parsed);
                // Set first lesson active
                if (parsed.modules?.[0]?.lessons?.[0]) {
                    handleLessonSelect(parsed.modules[0].lessons[0]);
                }
            } catch (e) {
                console.error("Error parsing saved course.");
            }
        }
    }, []);

    const handleLessonSelect = async (lessonName) => {
        setActiveLesson(lessonName);
        setLoadingVideo(true);
        setVideo(null);
        try {
            const courseTitle = course?.title || '';
            const query = `${courseTitle} ${lessonName} educational tutorial in depth`;
            const res = await fetchVideos(query);
            if (res.data.videos && res.data.videos.length > 0) {
                setVideo(res.data.videos[0]);
            }
        } catch (error) {
            console.error("Failed to fetch video", error);
        } finally {
            setLoadingVideo(false);
        }
    };

    if (!course) {
        return (
            <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
                <Sidebar activePage="course" />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p>No course found. Go to <a href="/generate">Generate Course</a>.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            <Sidebar activePage="course" />

            <div className="course-view-page">
                {/* COL 1: Modules */}
                <ModuleList 
                    course={course} 
                    activeLesson={activeLesson} 
                    onSelectLesson={handleLessonSelect} 
                />

                {/* COL 2: Content */}
                <div className="content-col">
                    <div className="video-wrap">
                        {loadingVideo ? (
                            <div style={{ color: 'white', padding: '100px', textAlign: 'center' }}>Loading Video...</div>
                        ) : video ? (
                            <iframe 
                                src={`https://www.youtube.com/embed/${video.videoId}`}
                                allowFullScreen 
                                title="Lesson Video"
                            ></iframe>
                        ) : (
                            <div style={{ color: 'white', padding: '100px', textAlign: 'center' }}>No video available for this lesson.</div>
                        )}
                    </div>
                    
                    <div className="content-scroll">
                        <div className="lesson-heading">{activeLesson || 'Select a lesson'}</div>
                        <div className="lesson-meta">
                            <span>📚 {course.title}</span>
                            <span>⏱️ ~15 min</span>
                            <span>🤖 AI Generated</span>
                        </div>
                        <div className="content-body">
                            <div className="key-points">
                                <p>💡 <strong>Focus:</strong> Watch the video above to master {activeLesson}. You can ask the AI Tutor on the right for clarification or explanations anytime.</p>
                            </div>
                            <h3>Overview</h3>
                            <p>This lesson is part of "{course.title}". Make sure to practice the concepts actively. If you are stuck, ask the tutor for simplified examples, code snippets, or analogies.</p>
                        </div>
                    </div>
                    
                    <div className="quiz-bar">
                        <p>Ready to test your knowledge? Take the AI-generated quiz.</p>
                        <button className="btn-quiz" onClick={() => setIsQuizVisible(true)}>📝 Take Quiz</button>
                    </div>
                </div>

                {/* COL 3: AI Tutor */}
                <Chatbot context={`Course: ${course.title}. Current Lesson: ${activeLesson}`} />
            </div>

            <QuizModal 
                isVisible={isQuizVisible} 
                onClose={() => setIsQuizVisible(false)} 
                lessonContent={`Course: ${course.title}. Lesson: ${activeLesson}`} 
            />
        </div>
    );
};

export default CourseView;
