import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { supabase } from '../services/supabase';
import './Dashboard.css'; // Re-use dashboard table styles

const MyCourses = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/login');
                return;
            }
            
            // Fetch enrolled courses
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setCourses(data);
            }
            setLoading(false);
        };
        fetchCourses();
    }, [navigate]);

    return (
        <Layout activePage="course">
            <div className="dashboard-page overflow-y-auto">
                <div className="top-bar">
                    <div>
                        <h1>My Enrolled Courses 📚</h1>
                        <p>View and manage all your AI-generated learning paths here.</p>
                    </div>
                    <div className="user-chip">
                        <div className="avatar">S</div>
                        <span>Student</span>
                    </div>
                </div>

                <div className="card" style={{ marginTop: '20px' }}>
                    <div className="card-title">All Courses</div>
                    <table className="course-table">
                        <thead>
                            <tr>
                                <th>Course Topic</th>
                                <th>Skill Level</th>
                                <th>Duration</th>
                                <th>Progress</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && <tr><td colSpan="5">Loading courses...</td></tr>}
                            {!loading && courses.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                                        No courses generated yet.{' '}
                                        <button 
                                            onClick={() => navigate('/generate')}
                                            style={{ color: 'var(--p1)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            Generate one now!
                                        </button>
                                    </td>
                                </tr>
                            )}
                            {courses.map(course => {
                                // Calculate basic progress (we'll refine this logic when we implement progress tracking)
                                let completed = 0;
                                let total = 0;
                                if (course.content?.modules) {
                                    course.content.modules.forEach(m => {
                                        if (m.lessons) total += m.lessons.length;
                                    });
                                }
                                if (course.content?.completedLessons) {
                                    completed = course.content.completedLessons.length;
                                }
                                const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

                                return (
                                    <tr key={course.id}>
                                        <td><strong>{course.topic}</strong></td>
                                        <td style={{ color: 'var(--muted)' }}>{course.level || 'Beginner'}</td>
                                        <td style={{ color: 'var(--muted)' }}>{course.duration || '1 Week'}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div className="prog-bar-bg" style={{ width: '100px', flexShrink: 0 }}>
                                                    <div className="prog-bar-fill" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--p1), var(--p2))' }}></div>
                                                </div>
                                                <span style={{ fontSize: '.75em', color: 'var(--muted)' }}>{pct}%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <button className="btn-continue" onClick={() => navigate(`/course/${course.id}`)}>
                                                {pct === 100 ? 'Review →' : 'Continue →'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default MyCourses;
