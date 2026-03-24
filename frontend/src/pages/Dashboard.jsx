import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();

    const scores = [58, 72, 65, 80, 55, 88, 72];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <Layout activePage="dashboard">
            <div className="dashboard-page">
                {/* TOP */}
                <div className="top-bar">
                    <div>
                        <h1>Welcome back, Student 👋</h1>
                        <p>Here's your learning summary for this week</p>
                    </div>
                    <div className="user-chip">
                        <div className="avatar">S</div>
                        <span>Student</span>
                    </div>
                </div>

                {/* STATS */}
                <div className="stats">
                    <div className="stat blue">
                        <div className="s-label">Courses Enrolled</div>
                        <div className="s-val">3</div>
                        <div className="s-sub">↑ 1 this week</div>
                    </div>
                    <div className="stat purple">
                        <div className="s-label">Avg. Quiz Score</div>
                        <div className="s-val">72%</div>
                        <div className="s-sub">↑ 8% improvement</div>
                    </div>
                    <div className="stat cyan">
                        <div className="s-label">Lessons Completed</div>
                        <div className="s-val">14</div>
                        <div className="s-sub">↑ 5 this week</div>
                    </div>
                    <div className="stat green">
                        <div className="s-label">Learning Streak</div>
                        <div className="s-val">7d</div>
                        <div className="s-sub">🔥 Keep it up!</div>
                    </div>
                </div>

                {/* MIDDLE ROW */}
                <div className="grid-2">
                    {/* Course Progress */}
                    <div className="card">
                        <div className="card-title">📚 Active Courses <Link to="/generate">+ New Course</Link></div>
                        <table className="course-table">
                            <thead>
                                <tr>
                                    <th>Course</th>
                                    <th>Level</th>
                                    <th>Progress</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>Machine Learning</strong></td>
                                    <td style={{ color: 'var(--muted)' }}>Intermediate</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div className="prog-bar-bg" style={{ width: '100px', flexShrink: 0 }}>
                                                <div className="prog-bar-fill" style={{ width: '65%' }}></div>
                                            </div>
                                            <span style={{ fontSize: '.75em', color: 'var(--muted)' }}>65%</span>
                                        </div>
                                    </td>
                                    <td><span className="status-badge s-active">Active</span></td>
                                    <td><button className="btn-continue" onClick={() => navigate('/course')}>Continue →</button></td>
                                </tr>
                                <tr>
                                    <td><strong>Web Development</strong></td>
                                    <td style={{ color: 'var(--muted)' }}>Beginner</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div className="prog-bar-bg" style={{ width: '100px', flexShrink: 0 }}>
                                                <div className="prog-bar-fill" style={{ width: '30%' }}></div>
                                            </div>
                                            <span style={{ fontSize: '.75em', color: 'var(--muted)' }}>30%</span>
                                        </div>
                                    </td>
                                    <td><span className="status-badge s-paused">Paused</span></td>
                                    <td><button className="btn-continue" onClick={() => navigate('/course')}>Continue →</button></td>
                                </tr>
                                <tr>
                                    <td><strong>Data Structures</strong></td>
                                    <td style={{ color: 'var(--muted)' }}>Advanced</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div className="prog-bar-bg" style={{ width: '100px', flexShrink: 0 }}>
                                                <div className="prog-bar-fill" style={{ width: '10%' }}></div>
                                            </div>
                                            <span style={{ fontSize: '.75em', color: 'var(--muted)' }}>10%</span>
                                        </div>
                                    </td>
                                    <td><span className="status-badge s-active">Active</span></td>
                                    <td><button className="btn-continue" onClick={() => navigate('/course')}>Continue →</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* AI Recommendations */}
                    <div className="card">
                        <div className="card-title">🤖 AI Recommendations</div>
                        <div className="rec-item">
                            <div className="rec-icon" style={{ background: '#EEF2FF' }}>📈</div>
                            <div>
                                <h4>Focus on Weak Areas</h4>
                                <p>Your quiz scores show gaps in "Neural Networks". AI suggests 2 extra practice lessons.</p>
                                <span className="rec-tag" style={{ background: 'rgba(79,70,229,.1)', color: 'var(--p1)' }}>Adaptive</span>
                            </div>
                        </div>
                        <div className="rec-item">
                            <div className="rec-icon" style={{ background: '#F0FDF4' }}>🎬</div>
                            <div>
                                <h4>Video: Beginner-Friendly Recap</h4>
                                <p>Based on your score, watch this 8-min video to reinforce Module 2 concepts.</p>
                                <span className="rec-tag" style={{ background: 'rgba(34,197,94,.1)', color: '#15803d' }}>Recommended</span>
                            </div>
                        </div>
                        <div className="rec-item">
                            <div className="rec-icon" style={{ background: '#FFF7ED' }}>🏆</div>
                            <div>
                                <h4>Ready for Advanced Module</h4>
                                <p>Your Web Dev progress qualifies you to unlock "React & Modern Frameworks".</p>
                                <span className="rec-tag" style={{ background: 'rgba(234,179,8,.1)', color: '#a16207' }}>Unlock</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM ROW */}
                <div className="grid-2">
                    {/* Weekly chart */}
                    <div className="card">
                        <div className="card-title">📊 Weekly Quiz Performance</div>
                        <div className="bar-chart" id="barChart">
                            {scores.map((s, i) => (
                                <div key={i} className="bar-wrap">
                                    <div style={{ fontSize: '.68em', color: 'var(--muted)', fontWeight: 700 }}>{s}%</div>
                                    <div className="bar" style={{ height: s + 'px' }}></div>
                                    <div className="bar-label">{days[i]}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '.73em', color: 'var(--muted)' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'linear-gradient(var(--p1),var(--p2))' }}></div>
                                Quiz Score %
                            </div>
                        </div>
                    </div>

                    {/* Strength / Weak areas */}
                    <div className="card">
                        <div className="card-title">💪 Strength & Weak Areas</div>
                        <div style={{ marginBottom: '14px' }}>
                            <div className="prog-item">
                                <div className="prog-top"><span>Python Basics</span><span>92%</span></div>
                                <div className="prog-bar-bg">
                                    <div className="prog-bar-fill" style={{ width: '92%', background: 'linear-gradient(90deg,#22c55e,#16a34a)' }}></div>
                                </div>
                            </div>
                            <div className="prog-item">
                                <div className="prog-top"><span>Data Manipulation</span><span>78%</span></div>
                                <div className="prog-bar-bg">
                                    <div className="prog-bar-fill" style={{ width: '78%', background: 'linear-gradient(90deg,var(--c1),#0284c7)' }}></div>
                                </div>
                            </div>
                            <div className="prog-item">
                                <div className="prog-top"><span>Neural Networks</span><span>45%</span></div>
                                <div className="prog-bar-bg">
                                    <div className="prog-bar-fill" style={{ width: '45%', background: 'linear-gradient(90deg,#f97316,#dc2626)' }}></div>
                                </div>
                            </div>
                            <div className="prog-item">
                                <div className="prog-top"><span>HTML & CSS</span><span>85%</span></div>
                                <div className="prog-bar-bg">
                                    <div className="prog-bar-fill" style={{ width: '85%', background: 'linear-gradient(90deg,var(--p1),var(--p2))' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
