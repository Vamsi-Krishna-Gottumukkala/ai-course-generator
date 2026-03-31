import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { supabase } from '../services/supabase';
import { generateCourse, generateComprehensiveTest } from '../services/api';
import './Test.css';

const Test = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [testState, setTestState] = useState('selection'); // 'selection', 'generating', 'testing', 'results', 'rebuilding'
    
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/login');
                return;
            }
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (!error && data) setCourses(data);
            setLoading(false);
        };
        fetchCourses();
    }, [navigate]);

    const startTest = async (course) => {
        setSelectedCourse(course);
        setTestState('generating');
        
        try {
            // We pass the stringified content of the course to build targeted questions
            const response = await generateComprehensiveTest(course.topic, JSON.stringify(course.content));
            const data = response.data;
            
            if (data.questions && data.questions.length > 0) {
                setQuestions(data.questions);
                setAnswers({});
                setTestState('testing');
            } else {
                throw new Error("Invalid question format");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to generate test. Make sure your GEMINI_API_KEY is active and valid.");
            setTestState('selection');
        }
    };

    const handleAnswerSelect = (qIdx, optionIdx) => {
        setAnswers(prev => ({ ...prev, [qIdx]: optionIdx }));
    };

    const submitTest = async () => {
        // Need to answer all 20 questions theoretically, 
        // but we grading based on length
        let score = 0;
        let missedTopics = [];
        
        questions.forEach((q, idx) => {
            if (answers[idx] === q.correctAnswerIndex) {
                score++;
            } else {
                // If wrong, add the implied topic of this question to missed list (or the question itself)
                missedTopics.push(q.topicEmphasis || q.question);
            }
        });

        const percentage = Math.round((score / questions.length) * 100);
        const passed = percentage >= 75;

        setResult({ score, percentage, passed, missedTopics });
        setTestState('results');
        
        // Log to Supabase testHistory
        try {
            const courseData = {...selectedCourse.content};
            const history = courseData.testHistory || [];
            
            const newHistoryBlock = {
                date: new Date().toISOString(),
                score: percentage,
                passed,
                missedTopics: missedTopics.slice(0, 5) // keep it brief
            };
            
            const newContent = { ...courseData, testHistory: [newHistoryBlock, ...history] };
            
            // Critical fix: update React state so the Rebuild function later has access to this data!
            setSelectedCourse(prev => ({ ...prev, content: newContent }));
            
            await supabase
                .from('courses')
                .update({ content: newContent })
                .eq('id', selectedCourse.id);
                
        } catch (e) {
             console.error("Failed to save test history", e);
        }
    };

    const handleAdaptiveStep = async () => {
        setTestState('rebuilding');
        
        try {
            const levels = ['Beginner', 'Intermediate', 'Advanced'];
            let currentLevelIdx = levels.indexOf(selectedCourse.level || 'Beginner');
            
            let applyLevel = selectedCourse.level || 'Beginner';
            let applyGoals = selectedCourse.goals || 'Learn fundamentals';
            
            if (result.passed) {
                // Level Up
                if (currentLevelIdx < levels.length - 1) {
                    applyLevel = levels[currentLevelIdx + 1];
                    applyGoals = "Student passed previous tier test. Advance the material conceptually.";
                } else {
                    alert("You have mastered this entire track! No further levels available.");
                    navigate('/dashboard');
                    return;
                }
            } else {
                // Stay same level, focus on weak points
                const weakPointsStr = result.missedTopics.slice(0, 3).join(", ");
                applyGoals = `The student recently failed an assessment. You MUST focus heavily on re-teaching these exact topics: ${weakPointsStr}`;
            }
            
            // Trigger generation
            const response = await generateCourse({ 
                topic: selectedCourse.topic, 
                level: applyLevel, 
                goals: applyGoals, 
                duration: selectedCourse.duration || '1 Week', 
                mode: selectedCourse.content?.mode || 'Video + Text' 
            });
            
            // Overwrite existing course completely but retain testHistory
            const oldHistory = selectedCourse.content?.testHistory || [];
            const newContent = { ...response.data, mode: selectedCourse.content?.mode || 'Video + Text', testHistory: oldHistory, completedLessons: [] };
            
            await supabase
                .from('courses')
                .update({ 
                    level: applyLevel,
                    goals: applyGoals,
                    content: newContent 
                })
                .eq('id', selectedCourse.id);
                
            navigate(`/course/${selectedCourse.id}`);
            
        } catch (err) {
            console.error("Adaptive Generation Error", err);
            alert("Failed to adapt course.");
            navigate('/dashboard');
        }
    };

    return (
        <Layout activePage="test">
            <div className="test-page">
                <div className="top-bar">
                    <h1>🎯 Adaptive Testing</h1>
                    <p>Evaluate your skills. Pass to level up, or let AI rebuild your course to fix your weak points.</p>
                </div>

                <div className="test-body">
                    {testState === 'selection' && (
                        <div className="selection-view">
                            <h2>Select a Course to Evaluate</h2>
                            {loading ? <p>Loading courses...</p> : courses.length === 0 ? <p>No courses enrolled.</p> : (
                                <div className="course-grid">
                                    {courses.map(c => (
                                        <div key={c.id} className="test-course-card">
                                            <h3>{c.topic}</h3>
                                            <div className="tcc-meta">
                                                <span>Level: {c.level || 'Beginner'}</span>
                                                <span className={c.content?.completedLessons?.length > 0 ? "c-active" : "c-new"}>
                                                    {c.content?.completedLessons?.length || 0} Lessons Read
                                                </span>
                                            </div>
                                            <button className="btn-start" onClick={() => startTest(c)}>Start 20-Question Test</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {testState === 'generating' && (
                        <div className="loading-state">
                            <div className="loader-spinner"></div>
                            <h2>Generating Comprehensive Test...</h2>
                            <p>Gemini AI is analyzing your specific course curriculum to build a rigorous 20-question evaluation.</p>
                        </div>
                    )}

                    {testState === 'testing' && (
                        <div className="testing-view">
                            <div className="test-header">
                                <h2>Evaluation: {selectedCourse.topic}</h2>
                                <span>{Object.keys(answers).length} / {questions.length} Answered</span>
                            </div>
                            
                            <div className="questions-list">
                                {questions.map((q, qIndex) => (
                                    <div key={qIndex} className="question-card">
                                        <h4><span>{qIndex + 1}.</span> {q.question}</h4>
                                        <div className="options">
                                            {q.options.map((opt, optIndex) => (
                                                <div 
                                                    key={optIndex} 
                                                    className={`option-card ${answers[qIndex] === optIndex ? 'selected' : ''}`}
                                                    onClick={() => handleAnswerSelect(qIndex, optIndex)}
                                                >
                                                    <div className="opt-indicator">{['A', 'B', 'C', 'D'][optIndex]}</div>
                                                    <div>{opt}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="test-footer">
                                <button className="btn-submit" onClick={submitTest} disabled={Object.keys(answers).length < questions.length}>
                                    Submit & Evaluate
                                </button>
                            </div>
                        </div>
                    )}

                    {testState === 'results' && result && (
                        <div className="results-view">
                            <div className={`score-card ${result.passed ? 'passed' : 'failed'}`}>
                                <h2>{result.percentage}%</h2>
                                <h3>{result.passed ? 'Test Passed! 🎉' : 'Needs Improvement'}</h3>
                                <p>{result.score} out of {questions.length} correct</p>
                            </div>
                            
                            <div className="action-card">
                                {result.passed ? (
                                    <>
                                        <h3>Ready to Level Up</h3>
                                        <p>You have demonstrated mastery over the <b>{selectedCourse.level || 'Beginner'}</b> material. The AI will now generate an entirely new, heavily advanced curriculum to continue your learning journey. Your 'completed' progress will reset to 0%.</p>
                                        <button className="btn-adapt pass" onClick={handleAdaptiveStep}>Generate Next Level Course</button>
                                    </>
                                ) : (
                                    <>
                                        <h3>Adaptive Rebuild Recommended</h3>
                                        <p>You struggled with some specific concepts based on your answers. The AI will now surgically reconstruct your course to emphasize definitions and practice models for your weak areas.</p>
                                        <button className="btn-adapt fail" onClick={handleAdaptiveStep}>Rebuild My Course</button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {testState === 'rebuilding' && (
                        <div className="loading-state">
                            <div className="loader-spinner"></div>
                            <h2>{result?.passed ? 'Structuring Next Level...' : 'Rebuilding Curriculum...'}</h2>
                            <p>We are overwriting your course data with {result?.passed ? 'advanced concepts' : 'targeted remedial concepts'}. Please wait.</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Test;
