import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateCourse } from '../services/api';
import Layout from '../components/Layout';
import './Generate.css';

const demoModules = [
    { title: 'Introduction & Foundations', lessons: ['Core concepts overview', 'Key terminology', 'Historical context', 'Why this matters today'] },
    { title: 'Core Principles', lessons: ['Fundamental theory', 'Building blocks', 'Step-by-step breakdown', 'Worked examples'] },
    { title: 'Practical Application', lessons: ['Real-world use cases', 'Hands-on exercises', 'Mini project', 'Common mistakes'] },
    { title: 'Advanced Topics', lessons: ['Deep dive concepts', 'Optimisation techniques', 'Best practices', 'Industry standards'] },
    { title: 'Assessment & Review', lessons: ['Module quizzes', 'Adaptive practice problems', 'Revision flashcards', 'Final project guide'] },
];

const Generate = () => {
    const navigate = useNavigate();
    const [topic, setTopic] = useState('');
    const [goals, setGoals] = useState('');
    const [level, setLevel] = useState('Beginner');
    const [duration, setDuration] = useState('1 Week');
    const [mode, setMode] = useState('Text Only');
    const [debouncedTopic, setDebouncedTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedTopic(topic.trim());
        }, 350);
        return () => clearTimeout(timer);
    }, [topic]);

    const handleGenerate = async () => {
        if (!topic.trim()) {
            alert('Please enter a topic first!');
            return;
        }
        setIsGenerating(true);
        try {
            const response = await generateCourse({ topic, level, goals, duration, mode });
            localStorage.setItem('currentCourse', JSON.stringify(response.data));
            navigate('/course');
        } catch (error) {
            console.error('Generation Error:', error);
            alert('Failed to generate course. Check backend console for details.');
            setIsGenerating(false);
        }
    };

    return (
        <Layout activePage="generate">
            <div className="generate-page">
                <div className="top-bar">
                    <h1>✨ Generate a New Course</h1>
                    <div className="user-chip">
                        <div className="avatar">S</div>
                        <span>Student</span>
                    </div>
                </div>

                <div className="body">
                    {/* FORM */}
                    <div className="form-pane">
                        <h2>Configure Your Learning Path</h2>
                        <p>Fill in your preferences and click Generate — AI will build your full course instantly.</p>

                        {/* Topic */}
                        <div className="form-section">
                            <label className="form-label">📌 What do you want to learn?</label>
                            <input 
                                type="text" 
                                placeholder="e.g. Machine Learning, Web Dev, Data Structures" 
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                            />
                        </div>

                        {/* Goals */}
                        <div className="form-section">
                            <label className="form-label">🎯 Learning Objectives (optional)</label>
                            <textarea 
                                placeholder="e.g. Understand neural networks, build a web app..." 
                                value={goals}
                                onChange={(e) => setGoals(e.target.value)}
                            />
                        </div>

                        {/* Skill Level */}
                        <div className="form-section">
                            <label className="form-label">📶 Skill Level</label>
                            <div className="pills">
                                {['Beginner', 'Intermediate', 'Advanced'].map(l => (
                                    <div 
                                        key={l}
                                        className={`pill ${level === l ? 'sel' : ''}`} 
                                        onClick={() => setLevel(l)}
                                    >
                                        {l}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Duration */}
                        <div className="form-section">
                            <label className="form-label">⏱️ Learning Duration</label>
                            <div className="dur-grid">
                                {[
                                    { t: '1 Week', sub: '~1 hr/day' },
                                    { t: '2 Weeks', sub: '~45 min/day' },
                                    { t: '1 Month', sub: '~30 min/day' },
                                    { t: 'Custom', sub: 'Set your own' },
                                ].map(d => (
                                    <div 
                                        key={d.t}
                                        className={`dur-card ${duration === d.t ? 'sel' : ''}`} 
                                        onClick={() => setDuration(d.t)}
                                    >
                                        <div className="d-title">{d.t}</div>
                                        <div className="d-sub">{d.sub}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Learning Mode */}
                        <div className="form-section">
                            <label className="form-label">🎮 Learning Mode</label>
                            <div className="mode-grid">
                                {[
                                    { l: 'Text Only', i: '📝' },
                                    { l: 'Video + Text', i: '🎬' },
                                    { l: 'Interactive', i: '🖥️' },
                                    { l: 'Fast Track', i: '⚡' },
                                ].map(m => (
                                    <div 
                                        key={m.l}
                                        className={`mode-card ${mode === m.l ? 'sel' : ''}`} 
                                        onClick={() => setMode(m.l)}
                                    >
                                        <div className="m-icon">{m.i}</div>
                                        <div className="m-label">{m.l}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button className="btn-gen" onClick={handleGenerate} disabled={isGenerating}>
                            {isGenerating ? '⏳ Generating...' : '🚀 Generate My Learning Path'}
                        </button>
                    </div>

                    {/* PREVIEW */}
                    <div className="preview-pane">
                        <h2>Course Preview <span className="live-badge">LIVE</span></h2>
                        
                        {!debouncedTopic ? (
                            <div className="empty-preview">
                                <div className="icon">🧠</div>
                                <p>Start typing a topic to see your AI-generated course outline appear here in real time.</p>
                            </div>
                        ) : (
                            <div>
                                <div className="course-title-preview">{debouncedTopic}</div>
                                <div className="course-meta">
                                    <span>📶 {level}</span>
                                    <span>📦 5 Modules</span>
                                    <span>🎬 15 Lessons</span>
                                    <span>📝 5 Quizzes</span>
                                </div>
                                
                                {demoModules.map((m, i) => (
                                    <div key={i} className="module-card">
                                        <div className="mc-header">
                                            <div className="module-chip">M{i + 1}</div>
                                            <h3>{m.title}: {debouncedTopic}</h3>
                                        </div>
                                        <ul>
                                            {m.lessons.map((l, li) => <li key={li}>{l}</li>)}
                                        </ul>
                                        <div className="tags">
                                            <span className="tag">AI Generated</span>
                                            <span className="tag">Quiz Included</span>
                                            <span className="tag">Videos</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Generate;
