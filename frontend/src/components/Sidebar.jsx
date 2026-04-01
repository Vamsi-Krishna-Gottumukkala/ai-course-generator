import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ activePage }) => {
    const navigate = useNavigate();

    const handleLogout = (e) => {
        e.preventDefault();
        localStorage.removeItem('isAdmin');
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            <div className="logo">AI CourseGen</div>
            <nav className="nav">
                {localStorage.getItem('isAdmin') ? (
                    <Link className={`nl ${activePage === 'admin' ? 'active' : ''}`} to="/admin">⚙️ Admin Panel</Link>
                ) : (
                    <>
                        <Link className={`nl ${activePage === 'dashboard' ? 'active' : ''}`} to="/dashboard">📊 Dashboard</Link>
                        <Link className={`nl ${activePage === 'generate' ? 'active' : ''}`} to="/generate">✨ Generate Course</Link>
                        <Link className={`nl ${activePage === 'course' ? 'active' : ''}`} to="/course">📚 My Courses</Link>
                    </>
                )}
            </nav>
            <div className="sidebar-foot">
                <a href="#" onClick={handleLogout}>← Logout</a>
            </div>
        </aside>
    );
};

export default Sidebar;
