import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ModuleList from '../components/ModuleList';
import Chatbot from '../components/Chatbot';
import QuizModal from '../components/QuizModal';
import { fetchVideos } from '../services/api';
import { supabase } from '../services/supabase';
import './CourseView.css';

const CourseView = () => {
    const { id } = useParams();
    const [isQuizVisible, setIsQuizVisible] = useState(false);
    const [course, setCourse] = useState(null);
    const [activeLesson, setActiveLesson] = useState(null);
    const [video, setVideo] = useState(null);
    const [loadingVideo, setLoadingVideo] = useState(false);
    const [isVideoVisible, setIsVideoVisible] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    useEffect(() => {
        const fetchCourse = async () => {
            if (!id) return;
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) {
                console.error("Error fetching course:", error);
                return;
            }
            if (data && data.content) {
                setCourse(data.content);
                if (data.content.modules?.[0]?.lessons?.[0]) {
                    handleLessonSelect(data.content.modules[0].lessons[0], data.content.title);
                }
            }
        };

        if (id) {
            fetchCourse();
        } else {
            // Fallback for old localStorage strategy if no ID is provided
            const saved = localStorage.getItem('currentCourse');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setCourse(parsed);
                    if (parsed.modules?.[0]?.lessons?.[0]) {
                        handleLessonSelect(parsed.modules[0].lessons[0], parsed.title);
                    }
                } catch (e) {
                    console.error("Error parsing saved course.");
                }
            }
        }
    }, [id]);

    const handleLessonSelect = async (lessonObj, overrideCourseTitle) => {
        setActiveLesson(lessonObj);
        
        // Handle Video visibility logic based on mode
        const mode = course?.mode || 'Video + Text';
        if (mode === 'Text Only') {
            setIsVideoVisible(false);
            setVideo(null);
            return; // Skip fetching entirely
        }
        
        // Auto-show video if it's purely a video course, otherwise hide until toggle
        setIsVideoVisible(mode === 'Video');
        setLoadingVideo(true);
        setVideo(null);
        
        const lessonTitle = typeof lessonObj === 'string' ? lessonObj : lessonObj.title;

        try {
            const courseTitle = overrideCourseTitle || course?.title || '';
            const query = `${courseTitle} ${lessonTitle} educational tutorial in depth`;
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

    const markAsComplete = async () => {
        const lessonTitle = typeof activeLesson === 'string' ? activeLesson : activeLesson?.title;
        if (!lessonTitle) return;

        const currentCompleted = course.completedLessons || [];
        if (currentCompleted.includes(lessonTitle)) return;

        const newCompleted = [...currentCompleted, lessonTitle];
        const newContent = { ...course, completedLessons: newCompleted };

        setCourse(newContent);

        if (id) {
            await supabase.from('courses').update({ content: newContent }).eq('id', id);
        } else {
            localStorage.setItem('currentCourse', JSON.stringify(newContent));
        }
    };

    const isCompleted = course?.completedLessons?.includes(
        typeof activeLesson === 'string' ? activeLesson : activeLesson?.title
    );

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
                    {isVideoVisible && (
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
                    )}
                    
                    <div className="content-scroll">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                            <div className="lesson-heading" style={{ marginBottom: 0 }}>
                                {typeof activeLesson === 'string' ? activeLesson : activeLesson?.title || 'Select a lesson'}
                            </div>
                            
                            {/* Only show 'Watch Video' button if NOT Text Only and NOT Video (where it auto-shows) */}
                            {(!course.mode || (course.mode !== 'Text Only' && course.mode !== 'Video')) && (
                                <button 
                                    className="btn-toggle-video" 
                                    onClick={() => setIsVideoVisible(!isVideoVisible)}
                                    style={{
                                        background: 'var(--bg)',
                                        color: 'var(--p1)',
                                        border: '1px solid var(--border)',
                                        padding: '6px 14px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '0.85em',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        transition: '0.2s',
                                    }}
                                >
                                    {isVideoVisible ? 'Hide Video' : '🎥 Watch Lesson Video'}
                                </button>
                            )}
                        </div>
                        <div className="lesson-meta">
                            <span>📚 {course.title}</span>
                            <span>⏱️ ~15 min</span>
                            <span>🤖 AI Generated</span>
                            {course.mode && <span style={{ color: 'var(--p1)' }}>🕹️ {course.mode}</span>}
                        </div>
                        
                        <div className="content-body">
                            {/* Only show the written content body if the mode is NOT pure Video */}
                            {course.mode !== 'Video' && (
                                <>
                                    {activeLesson && typeof activeLesson !== 'string' && activeLesson.text_content ? (
                                        <div dangerouslySetInnerHTML={{ __html: activeLesson.text_content }} className="generated-lesson-content" />
                                    ) : (
                                        <>
                                            <div className="key-points">
                                                <p>💡 <strong>Focus:</strong> Use the modules pane to navigate. Ask the AI Tutor on the right for clarification or explanations anytime.</p>
                                            </div>
                                            <h3>Overview</h3>
                                            <p>Select a generated lesson from the modules pane. Make sure to practice the concepts actively.</p>
                                        </>
                                    )}
                                </>
                            )}
                            
                            {activeLesson && (
                                <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center' }}>
                                    <button 
                                        onClick={markAsComplete} 
                                        disabled={isCompleted}
                                        style={{
                                            background: isCompleted ? 'rgba(34, 197, 94, 0.1)' : 'var(--p1)',
                                            color: isCompleted ? '#22c55e' : '#fff',
                                            border: isCompleted ? '1px solid #22c55e' : 'none',
                                            padding: '12px 32px',
                                            borderRadius: '8px',
                                            fontWeight: 'bold',
                                            cursor: isCompleted ? 'default' : 'pointer',
                                            transition: '0.2s'
                                        }}
                                    >
                                        {isCompleted ? '✅ Module Completed' : 'Mark as Complete'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="quiz-bar">
                        <p>Ready to test your knowledge? Take the AI-generated quiz.</p>
                        <button className="btn-quiz" onClick={() => setIsQuizVisible(true)}>📝 Take Quiz</button>
                    </div>
                </div>

                {/* COL 3: AI Tutor (now a sliding panel) */}
                <div className={`chat-panel ${isChatOpen ? 'open' : ''}`}>
                    <div className="chat-panel-header">
                        <button className="close-chat-btn" onClick={() => setIsChatOpen(false)}>✕</button>
                    </div>
                    <Chatbot context={`Course: ${course.title}. Current Lesson: ${typeof activeLesson === 'string' ? activeLesson : activeLesson?.title || 'None'}`} />
                </div>
            </div>

            {/* Floating Chat Button */}
            {!isChatOpen && (
                <button className="floating-chat-btn" onClick={() => setIsChatOpen(true)}>
                    💬
                </button>
            )}

            <QuizModal 
                isVisible={isQuizVisible} 
                onClose={() => setIsQuizVisible(false)} 
                lessonContent={`Course: ${course.title}. Lesson: ${typeof activeLesson === 'string' ? activeLesson : activeLesson?.title || 'None'}`} 
            />
        </div>
    );
};

export default CourseView;
