import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabase';
import './Login.css';

const Login = () => {
    const [activeTab, setActiveTab] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('mode') === 'register') {
            setActiveTab('register');
        }

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                setActiveTab('update-password');
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [location]);

    const handleLogin = async (e) => {
        e.preventDefault();
        
        // Admin Gateway Intercept
        if (email === 'admin@gmail.com' && password === 'admin@1234') {
            localStorage.setItem('isAdmin', 'true');
            navigate('/admin');
            return;
        }
        
        setLoading(true);
        // Wipe any dormant admin sessions if logging in as standard user
        localStorage.removeItem('isAdmin');
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
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.signUp({ 
                email, 
                password,
                options: { data: { fullName } }
            });
            if (error) throw error;
            alert('Signup successful! Please log in.');
            setPassword(''); 
            setConfirmPassword('');
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
                                <div className="field">
                                    <label>Confirm Password</label>
                                    <input type="password" placeholder="Min 8 characters" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
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

                    {/* UPDATE PASSWORD PANEL */}
                    {activeTab === 'update-password' && (
                        <div className="panel active">
                            <p style={{ fontSize: '.85em', color: 'var(--muted)', marginBottom: '22px', lineHeight: '1.6' }}>
                                Please enter your new password below.
                            </p>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                if (password !== confirmPassword) {
                                    alert('Passwords do not match');
                                    return;
                                }
                                setLoading(true);
                                try {
                                    const { error } = await supabase.auth.updateUser({ password });
                                    if (error) throw error;
                                    alert('Password updated successfully! You are now logged in.');
                                    setPassword('');
                                    setConfirmPassword('');
                                    navigate('/dashboard');
                                } catch (err) {
                                    alert(err.message);
                                } finally {
                                    setLoading(false);
                                }
                            }}>
                                <div className="field">
                                    <label>New Password</label>
                                    <input type="password" placeholder="Min 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </div>
                                <div className="field">
                                    <label>Confirm New Password</label>
                                    <input type="password" placeholder="Min 8 characters" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                                </div>
                                <button type="submit" className="btn-submit" disabled={loading}>
                                    {loading ? 'Updating...' : 'Update Password'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
