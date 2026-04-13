import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
    return (
        <div className="landing-page">
            {/* NAV */}
            <nav>
                <div className="logo">AI CourseGen</div>
                <div className="nav-links">
                    <a href="#features">Features</a>
                    <a href="#how">How it Works</a>
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/admin">Admin</Link>
                </div>
                <div className="nav-cta">
                    <Link to="/login" className="btn-outline">Log In</Link>
                    <Link to="/login?mode=register" className="btn-primary">Get Started Free</Link>
                </div>
            </nav>

            <section className="hero">
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div className="hero-badge"><span></span> AI-Powered · Adaptive · Personalized</div>
                    <h1>Learn Anything, <br />Your Way — Powered by <span className="grad">AI</span></h1>
                    <p>Input any topic and skill level. Our AI generates a full personalized course with videos, quizzes, and an
                        AI tutor — adapted to your performance in real time.</p>
                    <div className="hero-btns">
                        <Link to="/generate" className="btn-hero primary">Generate My Course →</Link>
                        <Link to="/login" className="btn-hero secondary">Sign In</Link>
                    </div>
                    <div className="hero-stats">
                        <div className="stat">
                            <div className="num">10K+</div>
                            <div className="lab">Courses Generated</div>
                        </div>
                        <div className="stat">
                            <div className="num">98%</div>
                            <div className="lab">Learner Satisfaction</div>
                        </div>
                        <div className="stat">
                            <div className="num">50+</div>
                            <div className="lab">Subject Domains</div>
                        </div>
                        <div className="stat">
                            <div className="num">3×</div>
                            <div className="lab">Faster Learning</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <div className="how-section" id="how">
                <div className="how-inner">
                    <div className="section-label">How It Works</div>
                    <div className="section-title">3 Steps to Your Custom Course</div>
                    <div className="steps">
                        <div className="step-card">
                            <div className="step-num">01</div>
                            <div className="step-icon">✏️</div>
                            <h3>Enter Your Topic & Goals</h3>
                            <p>Type any topic, set your skill level and preferred duration. Optionally upload a syllabus PDF.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-num">02</div>
                            <div className="step-icon">🤖</div>
                            <h3>AI Builds Your Course</h3>
                            <p>Our completely AI-powered engine generates modules, lessons, curated videos, code snippets, and quizzes instantly.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-num">03</div>
                            <div className="step-icon">📈</div>
                            <h3>Learn & Adapt</h3>
                            <p>Take quizzes. The AI tracks your performance and continuously updates your learning path — easier or harder.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* FEATURES */}
            <div style={{ background: 'var(--bg)', padding: '80px 0' }} id="features">
                <div className="section">
                    <div className="section-label">Features</div>
                    <div className="section-title">Everything You Need to Learn Smarter</div>
                    <div className="features">
                        <div className="feat">
                            <div className="feat-icon" style={{ background: '#EEF2FF' }}>🧠</div>
                            <h3>AI Course Generation</h3>
                            <p>NLP + RAG + AI transformer generates full structured courses from a single topic input.</p>
                        </div>
                        <div className="feat">
                            <div className="feat-icon" style={{ background: '#F0FDF4' }}>🎬</div>
                            <h3>YouTube Video Integration</h3>
                            <p>Curated videos filtered by duration, popularity, and language — embedded into every lesson.</p>
                        </div>
                        <div className="feat">
                            <div className="feat-icon" style={{ background: '#FFF7ED' }}>📝</div>
                            <h3>Adaptive Quiz Engine</h3>
                            <p>MCQs, true/false, coding challenges. Auto-graded with instant explanations and retake support.</p>
                        </div>
                        <div className="feat">
                            <div className="feat-icon" style={{ background: '#F0EBFF' }}>💬</div>
                            <h3>AI Chatbot Tutor</h3>
                            <p>Ask doubts, get simple explanations, debug code, generate revision notes — all lesson-aware.</p>
                        </div>
                        <div className="feat">
                            <div className="feat-icon" style={{ background: '#ECFEFF' }}>📊</div>
                            <h3>Progress Dashboard</h3>
                            <p>Track completion %, quiz scores, strength areas, and get AI-powered next-step recommendations.</p>
                        </div>
                        <div className="feat">
                            <div className="feat-icon" style={{ background: '#FEF2F2' }}>📤</div>
                            <h3>Export & Share</h3>
                            <p>Download your course as PDF or PPT, export quiz reports, or email the full course to yourself.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="cta-banner">
                <h2>Start Learning with AI Today</h2>
                <p>Join thousands of learners who are already learning smarter, faster.</p>
                <Link to="/login?mode=register">
                    <button className="btn-white">Create Free Account →</button>
                </Link>
            </div>

            {/* FOOTER */}
            <footer>
                <div className="logo-f">AI CourseGen</div>
                <div>© 2025 AI Course Generator. All rights reserved.</div>
                <div style={{ display: 'flex', gap: '24px' }}>
                    <a href="#" style={{ color: 'var(--muted)', transition: '.2s' }}>Terms</a>
                    <a href="#" style={{ color: 'var(--muted)', transition: '.2s' }}>Privacy</a>
                    <a href="#" style={{ color: 'var(--muted)', transition: '.2s' }}>Contact</a>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
