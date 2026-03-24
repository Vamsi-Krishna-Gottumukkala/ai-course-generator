import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabase';
import './Login.css';

const Login = () => {
    const [activeTab, setActiveTab] = useState('login');
    const [role, setRole] = useState('Student');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('mode') === 'register') {
            setActiveTab('register');
        }
    }, [location]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            navigate('/dashboard');
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.signUp({ 
                email, 
                password,
                options: { data: { fullName, role } }
            });
            if (error) throw error;
            alert('Signup successful! Please log in.');
            setActiveTab('login');
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const renderRingDashes = () => {
        const dashes = [];
        for (let i = 0; i < 36; i++) {
            const opacity = (0.3 + ((i % 9) / 9) * 0.7).toFixed(2);
            dashes.push(
                <div
                    key={i}
                    className="dash"
                    style={{
                        transform: `rotate(${i * 10}deg)`,
                        opacity: opacity
                    }}
                />
            );
        }
        return dashes;
    };

    return (
        <div className="login-page">
            <div className="ring-wrap">
                <div className="dash-ring" id="ring">
                    {renderRingDashes()}
                </div>
                <div className="card">
                    <div className="brand">AI CourseGen</div>

                    {/* TABS */}
                    <div className="tabs">
                        <div className={`tab ${activeTab === 'login' ? 'active' : ''}`} onClick={() => setActiveTab('login')}>Login</div>
                        <div className={`tab ${activeTab === 'register' ? 'active' : ''}`} onClick={() => setActiveTab('register')}>Register</div>
                        <div className={`tab ${activeTab === 'forgot' ? 'active' : ''}`} onClick={() => setActiveTab('forgot')}>Forgot</div>
                    </div>

                    {/* LOGIN PANEL */}
                    {activeTab === 'login' && (
                        <div className="panel active">
                            <div className="role-btns">
                                <div className={`role-btn ${role === 'Student' ? 'sel' : ''}`} onClick={() => setRole('Student')}>Student</div>
                                <div className={`role-btn ${role === 'Teacher' ? 'sel' : ''}`} onClick={() => setRole('Teacher')}>Teacher</div>
                                <div className={`role-btn ${role === 'Admin' ? 'sel' : ''}`} onClick={() => setRole('Admin')}>Admin</div>
                            </div>
                            <button className="btn-google">
                                <svg width="18" height="18" viewBox="0 0 48 48">
                                    <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 34.3 29.3 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.3-.2-2.7-.4-4z" />
                                    <path fill="#FF3D00" d="M6.3 14.7l7 5.1C15.1 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6-6C34.6 5.1 29.6 3 24 3 16.3 3 9.7 7.8 6.3 14.7z" />
                                    <path fill="#4CAF50" d="M24 45c5.2 0 10-1.9 13.7-5l-6.3-5.4C29.5 36.3 26.9 37 24 37c-5.2 0-9.6-3.5-11.2-8.3l-6.9 5.3C9.5 41 16.3 45 24 45z" />
                                    <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.5-2.4 4.6-4.4 6l6.3 5.4C41.5 35.9 44 30.5 44 24c0-1.3-.2-2.7-.4-4z" />
                                </svg>
                                Continue with Google
                            </button>
                            <div className="divider">or sign in with email</div>
                            <form onSubmit={handleLogin}>
                                <div className="field">
                                    <label>Email</label>
                                    <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                                <div className="field">
                                    <label>Password</label>
                                    <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </div>
                                <button type="submit" className="btn-submit" disabled={loading}>
                                    {loading ? 'Signing in...' : 'Sign In'}
                                </button>
                            </form>
                            <div className="note">No account?  
                                <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('register'); }}>Create one →</a>
                            </div>
                        </div>
                    )}

                    {/* REGISTER PANEL */}
                    {activeTab === 'register' && (
                        <div className="panel active">
                            <div className="role-btns">
                                <div className={`role-btn ${role === 'Student' ? 'sel' : ''}`} onClick={() => setRole('Student')}>Student</div>
                                <div className={`role-btn ${role === 'Teacher' ? 'sel' : ''}`} onClick={() => setRole('Teacher')}>Teacher</div>
                            </div>
                            <form onSubmit={handleSignup}>
                                <div className="field">
                                    <label>Full Name</label>
                                    <input type="text" placeholder="Your name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                                </div>
                                <div className="field">
                                    <label>Email</label>
                                    <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                                <div className="field">
                                    <label>Password</label>
                                    <input type="password" placeholder="Min 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </div>
                                <button type="submit" className="btn-submit" disabled={loading}>
                                    {loading ? 'Creating...' : 'Create Account'}
                                </button>
                            </form>
                            <div className="note">Already have an account?  
                                <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('login'); }}>Sign in</a>
                            </div>
                        </div>
                    )}

                    {/* FORGOT PANEL */}
                    {activeTab === 'forgot' && (
                        <div className="panel active">
                            <p style={{ fontSize: '.85em', color: 'var(--muted)', marginBottom: '22px', lineHeight: '1.6' }}>
                                Enter your registered email and we'll send you a link to reset your password.
                            </p>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                setLoading(true);
                                try {
                                    const { error } = await supabase.auth.resetPasswordForEmail(email);
                                    if (error) throw error;
                                    alert('Reset link sent! Check your inbox.');
                                } catch (err) {
                                    alert(err.message);
                                } finally {
                                    setLoading(false);
                                }
                            }}>
                                <div className="field">
                                    <label>Email Address</label>
                                    <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                                <button type="submit" className="btn-submit" disabled={loading}>
                                    {loading ? 'Sending...' : 'Send Reset Link'}
                                </button>
                            </form>
                            <div className="note">
                                <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('login'); }}>← Back to Login</a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
