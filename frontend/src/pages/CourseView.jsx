import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ModuleList from '../components/ModuleList';
import Chatbot from '../components/Chatbot';
import QuizModal from '../components/QuizModal';
import { fetchVideos, generateComprehensiveTest, generateCourse } from '../services/api';
import { supabase } from '../services/supabase';
import './CourseView.css';

const CourseView = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [isQuizVisible, setIsQuizVisible] = useState(false);
    const [course, setCourse] = useState(null);
    const [courseRecord, setCourseRecord] = useState(null); // full DB row
    const [activeLesson, setActiveLesson] = useState(null);
    const [video, setVideo] = useState(null);
    const [loadingVideo, setLoadingVideo] = useState(false);
    const [isVideoVisible, setIsVideoVisible] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // ── In-course Test State ──────────────────────────────────────────────
    const [testView, setTestView] = useState('none'); // 'none' | 'generating' | 'questions' | 'results' | 'rebuilding'
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [testResult, setTestResult] = useState(null);

    useEffect(() => {
        const fetchCourse = async () => {
            if (!id) return;
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .eq('id', id)
                .single();

            if (error) { console.error('Error fetching course:', error); return; }
            if (data && data.content) {
                setCourseRecord(data);
                setCourse(data.content);
                if (data.content.modules?.[0]?.lessons?.[0]) {
                    handleLessonSelect(data.content.modules[0].lessons[0], data.content.title);
                }
            }
        };

        if (id) {
            fetchCourse();
        } else {
            const saved = localStorage.getItem('currentCourse');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setCourse(parsed);
                    if (parsed.modules?.[0]?.lessons?.[0]) {
                        handleLessonSelect(parsed.modules[0].lessons[0], parsed.title);
                    }
                } catch (e) { console.error('Error parsing saved course.'); }
            }
        }
    }, [id]);

    const handleLessonSelect = async (lessonObj, overrideCourseTitle) => {
        setTestView('none'); // hide test when switching lessons
        setActiveLesson(lessonObj);

        const mode = course?.mode || 'Video + Text';
        if (mode === 'Text Only') {
            setIsVideoVisible(false);
            setVideo(null);
            return;
        }

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
            console.error('Failed to fetch video', error);
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

    // ── Derived state ─────────────────────────────────────────────────────
    const completedLessons = course?.completedLessons || [];
    const allModuleLessons = (course?.modules || []).flatMap(m => (m.lessons || []).map(l => (typeof l === 'string' ? l : l.title)));
    const allDone = allModuleLessons.length > 0 && allModuleLessons.every(l => completedLessons.includes(l));
    const isCompleted = completedLessons.includes(typeof activeLesson === 'string' ? activeLesson : activeLesson?.title);

    // ── Inline Test Logic ─────────────────────────────────────────────────
    const startFinalTest = async () => {
        setTestView('generating');
        try {
            const response = await generateComprehensiveTest(course.title || courseRecord?.topic, JSON.stringify(course));
            const data = response.data;
            if (data.questions && data.questions.length > 0) {
                setQuestions(data.questions);
                setAnswers({});
                setTestView('questions');
            } else {
                throw new Error('No questions returned');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to generate test. Please try again.');
            setTestView('none');
        }
    };

    const submitTest = async () => {
        let score = 0;
        let missedTopics = [];

        questions.forEach((q, idx) => {
            if (answers[idx] === q.correctAnswerIndex) {
                score++;
            } else {
                missedTopics.push(q.topicEmphasis || q.question);
            }
        });

        const percentage = Math.round((score / questions.length) * 100);
        const passed = percentage >= 75;
        setTestResult({ score, percentage, passed, missedTopics });
        setTestView('results');

        // Save to testHistory
        try {
            const newHistory = { date: new Date().toISOString(), score: percentage, passed, missedTopics: missedTopics.slice(0, 5) };
            const newContent = { ...course, testHistory: [newHistory, ...(course.testHistory || [])] };
            setCourse(newContent);
            if (id) await supabase.from('courses').update({ content: newContent }).eq('id', id);
        } catch (e) { console.error('Failed to save test history', e); }
    };

    const handleAdaptiveStep = async () => {
        setTestView('rebuilding');
        try {
            const levels = ['Beginner', 'Intermediate', 'Advanced'];
            const currentLevel = courseRecord?.level || 'Beginner';
            const currentLevelIdx = levels.indexOf(currentLevel);

            let applyLevel = currentLevel;
            let applyGoals = courseRecord?.goals || 'Learn fundamentals';

            if (testResult.passed) {
                if (currentLevelIdx < levels.length - 1) {
                    applyLevel = levels[currentLevelIdx + 1];
                    applyGoals = 'Student passed previous tier test. Advance the material conceptually.';
                } else {
                    alert("You've mastered the highest level! No further levels available.");
                    navigate('/dashboard');
                    return;
                }
            } else {
                const weakStr = testResult.missedTopics.slice(0, 3).join(', ');
                applyGoals = `The student recently failed an assessment. Focus heavily on re-teaching: ${weakStr}`;
            }

            const response = await generateCourse({
                topic: courseRecord?.topic || course.title,
                level: applyLevel,
                goals: applyGoals,
                duration: courseRecord?.duration || '1 Week',
                mode: course?.mode || 'Video + Text'
            });

            const oldHistory = course?.testHistory || [];
            const newContent = {
                ...response.data,
                mode: course?.mode || 'Video + Text',
                testHistory: oldHistory,
                completedLessons: []
            };

            await supabase.from('courses').update({ level: applyLevel, goals: applyGoals, content: newContent }).eq('id', id);
            // Reload page with the fresh curriculum
            window.location.reload();

        } catch (err) {
            console.error('Adaptive error', err);
            alert('Failed to adapt course. Please try again.');
            setTestView('results');
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
                    completedLessons={completedLessons}
                    allDone={allDone}
                    onGoToTest={() => { setActiveLesson(null); setTestView('intro'); }}
                />

                {/* COL 2: Content */}
                <div className="content-col">
                    {/* ── NORMAL LESSON VIEW ── */}
                    {testView === 'none' || testView === 'intro' ? (
                        <>
                            {testView === 'intro' ? (
                                /* ── TEST INTRO SCREEN ── */
                                <div className="content-scroll inline-test-wrap">
                                    <div className="test-intro-card">
                                        <div className="ti-icon">🎯</div>
                                        <h2>Final Course Assessment</h2>
                                        <p>You've completed all lessons in <strong>{course.title}</strong>. This 15-question test evaluates your full understanding of the curriculum.</p>
                                        <ul>
                                            <li>📋 15 multiple-choice questions</li>
                                            <li>✅ Pass threshold: <strong>75%</strong></li>
                                            <li>🚀 Pass → Course levels up to the next tier</li>
                                            <li>🔁 Fail → AI rebuilds course targeting your weak spots</li>
                                        </ul>
                                        <button className="btn-start-test" onClick={startFinalTest}>Begin Assessment</button>
                                    </div>
                                </div>
                            ) : (
                                /* ── LESSON CONTENT ── */
                                <>
                                    {isVideoVisible && (
                                        <div className="video-wrap">
                                            {loadingVideo ? (
                                                <div style={{ color: 'white', padding: '100px', textAlign: 'center' }}>Loading Video...</div>
                                            ) : video ? (
                                                <iframe src={`https://www.youtube.com/embed/${video.videoId}`} allowFullScreen title="Lesson Video"></iframe>
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
                                            {(!course.mode || (course.mode !== 'Text Only' && course.mode !== 'Video')) && (
                                                <button
                                                    className="btn-toggle-video"
                                                    onClick={() => setIsVideoVisible(!isVideoVisible)}
                                                    style={{ background: 'var(--bg)', color: 'var(--p1)', border: '1px solid var(--border)', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85em', display: 'flex', alignItems: 'center', gap: '6px', transition: '0.2s' }}
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
                                            {course.mode !== 'Video' && (
                                                <>
                                                    {activeLesson && typeof activeLesson !== 'string' && activeLesson.text_content ? (
                                                        <div dangerouslySetInnerHTML={{ __html: activeLesson.text_content }} className="generated-lesson-content" />
                                                    ) : (
                                                        <>
                                                            <div className="key-points">
                                                                <p>💡 <strong>Focus:</strong> Use the modules pane to navigate. Ask the AI Tutor for clarification anytime.</p>
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
                                                        style={{ background: isCompleted ? 'rgba(34, 197, 94, 0.1)' : 'var(--p1)', color: isCompleted ? '#22c55e' : '#fff', border: isCompleted ? '1px solid #22c55e' : 'none', padding: '12px 32px', borderRadius: '8px', fontWeight: 'bold', cursor: isCompleted ? 'default' : 'pointer', transition: '0.2s' }}
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
                                </>
                            )}
                        </>
                    ) : null}

                    {/* ── GENERATING ── */}
                    {testView === 'generating' && (
                        <div className="content-scroll inline-test-wrap">
                            <div className="test-loading">
                                <div className="test-spinner"></div>
                                <h2>Generating Assessment...</h2>
                                <p>Our Advanced AI is analyzing your full course curriculum to build 15 rigorous evaluation questions.</p>
                            </div>
                        </div>
                    )}

                    {/* ── QUESTIONS ── */}
                    {testView === 'questions' && (
                        <div className="content-scroll">
                            <div className="lesson-heading">📋 Final Assessment — {course.title}</div>
                            <div className="lesson-meta">
                                <span>{Object.keys(answers).length} / {questions.length} answered</span>
                                <span>Pass threshold: 75%</span>
                            </div>
                            <div className="content-body">
                                {questions.map((q, qIndex) => (
                                    <div key={qIndex} className="inline-question">
                                        <h4><span className="q-num">{qIndex + 1}.</span> {q.question}</h4>
                                        <div className="inline-options">
                                            {q.options.map((opt, optIndex) => (
                                                <div
                                                    key={optIndex}
                                                    className={`inline-option ${answers[qIndex] === optIndex ? 'selected' : ''}`}
                                                    onClick={() => setAnswers(prev => ({ ...prev, [qIndex]: optIndex }))}
                                                >
                                                    <span className="opt-letter">{['A', 'B', 'C', 'D'][optIndex]}</span>
                                                    <span>{opt}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                                    <button
                                        className="btn-submit-test"
                                        onClick={submitTest}
                                        disabled={Object.keys(answers).length < questions.length}
                                    >
                                        {Object.keys(answers).length < questions.length
                                            ? `Answer all questions (${questions.length - Object.keys(answers).length} remaining)`
                                            : 'Submit & Evaluate'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── RESULTS ── */}
                    {testView === 'results' && testResult && (
                        <div className="content-scroll inline-test-wrap">
                            <div className={`test-result-card ${testResult.passed ? 'passed' : 'failed'}`}>
                                <div className="tr-score">{testResult.percentage}%</div>
                                <h2>{testResult.passed ? '🎉 Assessment Passed!' : 'Needs Improvement'}</h2>
                                <p>{testResult.score} out of {questions.length} correct</p>
                            </div>

                            <div className="test-review" style={{ width: '100%', maxWidth: '800px', marginTop: '30px' }}>
                                <h3 style={{ marginBottom: '20px', textAlign: 'center', fontSize: '1.2em' }}>Detailed Review</h3>
                                {questions.map((q, qIndex) => {
                                    const userAns = answers[qIndex];
                                    const isCorrect = userAns === q.correctAnswerIndex;
                                    return (
                                        <div key={qIndex} className="inline-question" style={{ borderColor: isCorrect ? '#22c55e' : '#ef4444' }}>
                                            <h4><span className="q-num">{qIndex + 1}.</span> {q.question}</h4>
                                            <div className="inline-options">
                                                {q.options.map((opt, optIndex) => {
                                                    let bg = 'var(--bg)';
                                                    let border = 'var(--border)';
                                                    let icon = '';
                                                    if (optIndex === q.correctAnswerIndex) {
                                                        bg = '#f0fdf4'; border = '#22c55e'; icon = '✅';
                                                    } else if (userAns === optIndex && !isCorrect) {
                                                        bg = '#fef2f2'; border = '#ef4444'; icon = '❌';
                                                    }
                                                    return (
                                                        <div key={optIndex} className="inline-option" style={{ background: bg, borderColor: border, cursor: 'default' }}>
                                                            <span className="opt-letter">{['A', 'B', 'C', 'D'][optIndex]}</span>
                                                            <span>{opt} {icon}</span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                            <div style={{ marginTop: '14px', padding: '12px', background: 'rgba(79,70,229,.1)', borderRadius: '8px', fontSize: '0.88em', color: 'var(--text)' }}>
                                                <strong>Explanation:</strong> {q.explanation}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="adapt-card">
                                {testResult.passed ? (
                                    <>
                                        <h3>🚀 Ready to Level Up</h3>
                                        <p>You've demonstrated mastery over this material. The AI will now generate an advanced curriculum for the next tier. Progress will reset to 0% as you begin a new level.</p>
                                        <button className="btn-adapt pass" onClick={handleAdaptiveStep}>Generate Next Level</button>
                                    </>
                                ) : (
                                    <>
                                        <h3>🔁 Adaptive Rebuild</h3>
                                        <p>Our AI detected specific weak concepts from your answers. It will now surgically rebuild your course to heavily reinforce those exact topics.</p>
                                        <button className="btn-adapt fail" onClick={handleAdaptiveStep}>Rebuild My Course</button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── REBUILDING ── */}
                    {testView === 'rebuilding' && (
                        <div className="content-scroll inline-test-wrap">
                            <div className="test-loading">
                                <div className="test-spinner"></div>
                                <h2>{testResult?.passed ? 'Structuring Next Level...' : 'Rebuilding Curriculum...'}</h2>
                                <p>Please wait while we overwrite your course with {testResult?.passed ? 'advanced material' : 'targeted remedial content'}.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* COL 3: AI Tutor sliding panel */}
                <div className={`chat-panel ${isChatOpen ? 'open' : ''}`}>
                    <div className="chat-panel-header">
                        <button className="close-chat-btn" onClick={() => setIsChatOpen(false)}>✕</button>
                    </div>
                    <Chatbot context={`Course: ${course.title}. Current Lesson: ${typeof activeLesson === 'string' ? activeLesson : activeLesson?.title || 'None'}`} />
                </div>
            </div>

            {/* Floating Chat Button */}
            {!isChatOpen && (
                <button className="floating-chat-btn" onClick={() => setIsChatOpen(true)}>💬</button>
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
