import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ activePage }) => {
    const navigate = useNavigate();

    const handleLogout = (e) => {
        e.preventDefault();
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            <div className="logo">AI CourseGen</div>
            <nav className="nav">
                <Link className={`nl ${activePage === 'home' ? 'active' : ''}`} to="/">🏠 Home</Link>
                <Link className={`nl ${activePage === 'dashboard' ? 'active' : ''}`} to="/dashboard">📊 Dashboard</Link>
                <Link className={`nl ${activePage === 'generate' ? 'active' : ''}`} to="/generate">✨ Generate Course</Link>
                <Link className={`nl ${activePage === 'course' ? 'active' : ''}`} to="/course">📚 My Courses</Link>
                <Link className={`nl ${activePage === 'progress' ? 'active' : ''}`} to="#">📈 Progress</Link>
                <Link className={`nl ${activePage === 'admin' ? 'active' : ''}`} to="/admin">⚙️ Admin</Link>
            </nav>
            <div className="sidebar-foot">
                <a href="#" onClick={handleLogout}>← Logout</a>
            </div>
        </aside>
    );
};

export default Sidebar;
