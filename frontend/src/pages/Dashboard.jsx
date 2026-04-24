import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { supabase } from '../services/supabase';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('Student');

    useEffect(() => {
        const fetchCourses = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/login');
                return;
            }
            if (session.user.user_metadata?.fullName) {
                setUserName(session.user.user_metadata.fullName);
            } else if (session.user.email) {
                setUserName(session.user.email.split('@')[0]);
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

    const [stats, setStats] = useState({
        scores: [],
        days: [],
        completedLessons: 0,
        avgScore: 0,
        enrolled: 0,
        recommendations: [],
        skillAreas: []
    });

    useEffect(() => {
        let totalCompleted = 0;
        let allTests = [];

        courses.forEach(c => {
            if (c.content && c.content.completedLessons) {
                totalCompleted += c.content.completedLessons.length;
            }
            if (c.content && c.content.testHistory) {
                const mapped = c.content.testHistory.map(t => ({ ...t, courseTopic: c.topic }));
                allTests = [...allTests, ...mapped];
            }
        });
        
        // Sort tests by date ascending for charts
        allTests.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // 1. Avg Score
        const avgScore = allTests.length > 0 
            ? Math.round(allTests.reduce((acc, t) => acc + t.score, 0) / allTests.length)
            : 0;

        // 2. Weekly chart (last 5-7 tests)
        const recentTests = allTests.slice(-7);
        const scores = recentTests.map(t => t.score);
        const days = recentTests.map(t => {
            const d = new Date(t.date);
            return `${d.getMonth()+1}/${d.getDate()}`;
        });

        // 3. AI Recommendations
        const recommendations = [];
        const recentFails = recentTests.filter(t => !t.passed);
        if (recentFails.length > 0) {
            recentFails.slice(0, 3).forEach(f => {
                recommendations.push({
                    title: `Review: ${f.courseTopic}`,
                    desc: `Failed a recent assessment. Focus on: ${f.missedTopics[0] || 'core concepts'}.`,
                    icon: '⚠️'
                });
            });
        } else if (allTests.length > 0 && allTests[allTests.length - 1].passed) {
            recommendations.push({
                title: `Ready to Advance!`,
                desc: `You nailed your last test in ${allTests[allTests.length - 1].courseTopic}. Check if there are further levels!`,
                icon: '🚀'
            });
        }

        // 4. Strengths & Weaknesses
        const skillAreas = [];
        const successTests = allTests.filter(t => t.passed);
        
        if (successTests.length > 0) {
            skillAreas.push({ name: successTests[successTests.length - 1].courseTopic + " (Mastered)", prog: 100 });
        }
        if (recentFails.length > 0) {
            const topic = recentFails[recentFails.length - 1].courseTopic;
            const missed = recentFails[recentFails.length - 1].missedTopics[0] || 'Core topics';
            skillAreas.push({ name: topic + " (" + missed + ")", prog: recentFails[recentFails.length - 1].score });
        }
        
        setStats(prev => ({ 
            ...prev, 
            enrolled: courses.length,
            completedLessons: totalCompleted,
            avgScore,
            scores,
            days,
            recommendations,
            skillAreas
        }));
    }, [courses]);

    return (
        <Layout activePage="dashboard">
            <div className="dashboard-page">
                {/* TOP */}
                <div className="top-bar">
                    <div>
                        <h1>Welcome back, {userName} 👋</h1>
                        <p>Here's your learning summary for this week</p>
                    </div>
                    <div className="user-chip">
                        <div className="avatar">{userName.charAt(0).toUpperCase()}</div>
                        <span>{userName}</span>
                    </div>
                </div>

                <div className="stats">
                    <div className="stat blue">
                        <div className="s-label">Courses Enrolled</div>
                        <div className="s-val">{stats.enrolled}</div>
                        <div className="s-sub">Your active paths</div>
                    </div>
                    <div className="stat purple">
                        <div className="s-label">Avg. Quiz Score</div>
                        <div className="s-val">{stats.avgScore}%</div>
                        <div className="s-sub">Ready for tests</div>
                    </div>
                    <div className="stat cyan">
                        <div className="s-label">Lessons Completed</div>
                        <div className="s-val">{stats.completedLessons}</div>
                        <div className="s-sub">Tracking progress</div>
                    </div>
                    <div className="stat green">
                        <div className="s-label">Learning Streak</div>
                        <div className="s-val">{stats.completedLessons > 0 ? '1d' : '0d'}</div>
                        <div className="s-sub">Keep it up!</div>
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
                                {loading && <tr><td colSpan="5">Loading courses...</td></tr>}
                                {!loading && courses.length === 0 && (
                                    <tr><td colSpan="5">No courses generated yet. <Link to="/generate">Create one!</Link></td></tr>
                                )}
                                {courses.map(course => {
                                    let completedCount = course.content?.completedLessons?.length || 0;
                                    let totalCount = 0;
                                    course.content?.modules?.forEach(m => {
                                        if (m.lessons) totalCount += m.lessons.length;
                                    });
                                    let prog = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                                    return (
                                        <tr key={course.id}>
                                            <td><strong>{course.topic}</strong></td>
                                            <td style={{ color: 'var(--muted)' }}>{course.level || 'Beginner'}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div className="prog-bar-bg" style={{ width: '100px', flexShrink: 0 }}>
                                                        <div className="prog-bar-fill" style={{ width: `${prog}%` }}></div>
                                                    </div>
                                                    <span style={{ fontSize: '.75em', color: 'var(--muted)' }}>{prog}%</span>
                                                </div>
                                            </td>
                                            <td><span className={prog === 100 ? "status-badge s-done" : "status-badge s-active"}>{prog === 100 ? 'Done' : 'Active'}</span></td>
                                            <td><button className="btn-continue" onClick={() => navigate(`/course/${course.id}`)}>{prog === 100 ? 'Review →' : 'Continue →'}</button></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* AI Recommendations */}
                    <div className="card">
                        <div className="card-title">🤖 AI Recommendations</div>
                        {stats.recommendations.length > 0 ? (
                            stats.recommendations.map((rec, i) => (
                                <div key={i} className="rec-item">
                                    <div className="rec-icon" style={{ background: '#EEF2FF' }}>{rec.icon || '🎯'}</div>
                                    <div>
                                        <h4>{rec.title}</h4>
                                        <p>{rec.desc}</p>
                                        <span className="rec-tag" style={{ background: 'rgba(79,70,229,.1)', color: 'var(--p1)' }}>Adaptive</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: '0.9em' }}>
                                Complete your first AI quiz to receive personalized learning recommendations.
                            </div>
                        )}
                    </div>
                </div>

                {/* BOTTOM ROW */}
                <div className="grid-2">
                    {/* Weekly chart */}
                    <div className="card">
                        <div className="card-title">📊 Weekly Quiz Performance</div>
                        {stats.scores.length > 0 ? (
                            <div className="bar-chart" id="barChart">
                                {stats.scores.map((s, i) => (
                                    <div key={i} className="bar-wrap">
                                        <div style={{ fontSize: '.68em', color: 'var(--muted)', fontWeight: 700 }}>{s}%</div>
                                        <div className="bar" style={{ height: s + 'px' }}></div>
                                        <div className="bar-label">{stats.days[i]}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: '0.9em' }}>
                                No quiz data recorded yet.
                             </div>
                        )}
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
                            {stats.skillAreas.length > 0 ? (
                                stats.skillAreas.map((area, i) => (
                                    <div key={i} className="prog-item">
                                        <div className="prog-top"><span>{area.name}</span><span>{area.prog}%</span></div>
                                        <div className="prog-bar-bg">
                                            <div className="prog-bar-fill" style={{ width: `${area.prog}%`, background: 'linear-gradient(90deg,var(--p1),var(--p2))' }}></div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: '0.9em' }}>
                                   Take quizzes to see your skills analyze.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
