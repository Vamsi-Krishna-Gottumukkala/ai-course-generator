import React, { useState } from 'react';
import Layout from '../components/Layout';
import './Admin.css';

const Admin = () => {
    const [activeTab, setActiveTab] = useState('users');

    return (
        <Layout activePage="admin">
            <div className="admin-page">
                {/* TOP */}
                <div className="top-bar">
                    <h1>⚙️ Admin Panel</h1>
                    <span className="admin-chip">Admin Access</span>
                </div>

                {/* STATS */}
                <div className="stats">
                    <div className="stat">
                        <div className="s-label">Total Users</div>
                        <div className="s-val" style={{ color: 'var(--p1)' }}>1,248</div>
                        <div className="s-trend up">↑ 34 this week</div>
                    </div>
                    <div className="stat">
                        <div className="s-label">Courses Generated</div>
                        <div className="s-val" style={{ color: 'var(--p2)' }}>5,892</div>
                        <div className="s-trend up">↑ 412 this week</div>
                    </div>
                    <div className="stat">
                        <div className="s-label">API Calls Today</div>
                        <div className="s-val" style={{ color: 'var(--c1)' }}>24.7K</div>
                        <div className="s-trend up">↑ 12% vs yesterday</div>
                    </div>
                    <div className="stat">
                        <div className="s-label">System Uptime</div>
                        <div className="s-val" style={{ color: '#22c55e' }}>99.8%</div>
                        <div className="s-trend up">✓ All systems healthy</div>
                    </div>
                </div>

                {/* TABS */}
                <div className="tab-bar">
                    <div className={`t ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>👥 Users</div>
                    <div className={`t ${activeTab === 'api' ? 'active' : ''}`} onClick={() => setActiveTab('api')}>📡 API Monitor</div>
                    <div className={`t ${activeTab === 'content' ? 'active' : ''}`} onClick={() => setActiveTab('content')}>📁 Content</div>
                    <div className={`t ${activeTab === 'feedback' ? 'active' : ''}`} onClick={() => setActiveTab('feedback')}>💬 Feedback</div>
                </div>

                {/* USERS SECTION */}
                {activeTab === 'users' && (
                    <div id="users">
                        <div className="sec-title">User Management</div>
                        <div className="table-card">
                            <table>
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Role</th>
                                        <th>Courses</th>
                                        <th>Last Active</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><strong>Aditya Kumar</strong><br/><span style={{ color: 'var(--muted)', fontSize: '.78em' }}>aditya@email.com</span></td>
                                        <td><span className="badge b-student">Student</span></td>
                                        <td>3</td>
                                        <td>Today</td>
                                        <td><span className="badge b-active">Active</span></td>
                                        <td><button className="action-btn">View</button> <button className="action-btn danger">Suspend</button></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Priya Sharma</strong><br/><span style={{ color: 'var(--muted)', fontSize: '.78em' }}>priya@email.com</span></td>
                                        <td><span className="badge b-teacher">Teacher</span></td>
                                        <td>12</td>
                                        <td>Yesterday</td>
                                        <td><span className="badge b-active">Active</span></td>
                                        <td><button className="action-btn">View</button> <button className="action-btn danger">Suspend</button></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Rahul Mehta</strong><br/><span style={{ color: 'var(--muted)', fontSize: '.78em' }}>rahul@email.com</span></td>
                                        <td><span className="badge b-student">Student</span></td>
                                        <td>1</td>
                                        <td>3 days ago</td>
                                        <td><span className="badge b-inactive">Inactive</span></td>
                                        <td><button className="action-btn">View</button> <button className="action-btn danger">Remove</button></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Admin User</strong><br/><span style={{ color: 'var(--muted)', fontSize: '.78em' }}>admin@system.com</span></td>
                                        <td><span className="badge b-admin">Admin</span></td>
                                        <td>—</td>
                                        <td>Now</td>
                                        <td><span className="badge b-active">Active</span></td>
                                        <td><button className="action-btn">View</button></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* API SECTION */}
                {activeTab === 'api' && (
                    <div id="api">
                        <div className="sec-title">API Quota Monitoring</div>
                        <div className="api-grid">
                            <div className="api-card">
                                <div className="api-name">Gemini AI API</div>
                                <div className="api-status">
                                    <div className="api-dot" style={{ background: '#22c55e' }}></div>
                                    <span style={{ color: '#15803d' }}>Operational</span>
                                </div>
                                <div className="quota-bar">
                                    <div className="quota-fill" style={{ width: '62%', background: 'linear-gradient(90deg,var(--p1),var(--p2))' }}></div>
                                </div>
                                <div className="quota-text">62,000 / 100,000 calls used today</div>
                            </div>
                            <div className="api-card">
                                <div className="api-name">YouTube Data API</div>
                                <div className="api-status">
                                    <div className="api-dot" style={{ background: '#22c55e' }}></div>
                                    <span style={{ color: '#15803d' }}>Operational</span>
                                </div>
                                <div className="quota-bar">
                                    <div className="quota-fill" style={{ width: '45%', background: 'linear-gradient(90deg,var(--c1),#0284c7)' }}></div>
                                </div>
                                <div className="quota-text">4,500 / 10,000 units used</div>
                            </div>
                            <div className="api-card">
                                <div className="api-name">NLP / RAG Engine</div>
                                <div className="api-status">
                                    <div className="api-dot" style={{ background: '#f59e0b' }}></div>
                                    <span style={{ color: '#a16207' }}>High Load</span>
                                </div>
                                <div className="quota-bar">
                                    <div className="quota-fill" style={{ width: '88%', background: 'linear-gradient(90deg,#f59e0b,#ef4444)' }}></div>
                                </div>
                                <div className="quota-text">8,800 / 10,000 requests (88% used)</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* CONTENT SECTION */}
                {activeTab === 'content' && (
                    <div id="content">
                        <div className="sec-title">AI Content Moderation</div>
                        <div className="table-card">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Course Title</th>
                                        <th>Generated By</th>
                                        <th>Modules</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><strong>Intro to Machine Learning</strong></td>
                                        <td>AI (Gemini)</td>
                                        <td>5</td>
                                        <td><span className="badge b-active">Approved</span></td>
                                        <td><button className="action-btn">Review</button> <button className="action-btn danger">Remove</button></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Python for Beginners</strong></td>
                                        <td>AI (Gemini)</td>
                                        <td>7</td>
                                        <td><span className="badge" style={{ background: 'rgba(234,179,8,.1)', color: '#a16207' }}>Pending</span></td>
                                        <td><button className="action-btn">Review</button> <button className="action-btn danger">Remove</button></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* FEEDBACK SECTION */}
                {activeTab === 'feedback' && (
                    <div id="feedback">
                        <div className="sec-title">User Feedback</div>
                        <div className="feedback-list">
                            <div className="fb-item">
                                <div className="fb-avatar">AK</div>
                                <div>
                                    <div className="stars">★★★★★</div>
                                    <p>"The AI tutor is incredible. It explained neural networks in a way no book ever could!"</p>
                                    <div className="fb-meta">Aditya Kumar · Student · Machine Learning Course</div>
                                </div>
                            </div>
                            <div className="fb-item">
                                <div className="fb-avatar">PS</div>
                                <div>
                                    <div className="stars">★★★★☆</div>
                                    <p>"The adaptive quiz feature is genuinely smart — it noticed my weakness and adjusted. Impressive."</p>
                                    <div className="fb-meta">Priya Sharma · Teacher · Web Development Course</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Admin;
