import React from 'react';
import './ModuleList.css';

const ModuleList = ({ course, activeLesson, onSelectLesson }) => {
    if (!course) return <div className="modules-col">Loading...</div>;

    const modules = course.modules || [];

    return (
        <div className="modules-col">
            <div className="col-header">
                <span>📚 Course Modules</span>
            </div>
            <div className="progress-bar">
                <div className="progress-fill" style={{ width: '0%' }}></div>
            </div>
            <div className="mod-list">
                {modules.map((mod, idx) => (
                    <div key={idx} className="module-group">
                        <div className="mod-group-title">Module {idx + 1} — {mod.title}</div>
                        
                        {(mod.lessons || []).map((lesson, lIdx) => {
                            const isActive = activeLesson === lesson;
                            return (
                                <div 
                                    key={lIdx} 
                                    className={`lesson-item ${isActive ? 'active' : ''}`}
                                    onClick={() => onSelectLesson(lesson)}
                                >
                                    <div className="lesson-dot"></div>
                                    <span className="lesson-title">{lesson}</span>
                                    <span className="dur-badge">Vid</span>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ModuleList;
