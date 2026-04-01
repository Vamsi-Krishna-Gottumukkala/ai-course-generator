import React from 'react';
import './ModuleList.css';

const ModuleList = ({ course, activeLesson, onSelectLesson, completedLessons = [], onGoToTest, allDone }) => {
    if (!course) return <div className="modules-col">Loading...</div>;

    const modules = course.modules || [];
    const totalLessons = modules.reduce((acc, m) => acc + (m.lessons || []).length, 0);
    const doneCount = completedLessons.length;
    const progressPct = totalLessons > 0 ? Math.round((doneCount / totalLessons) * 100) : 0;

    return (
        <div className="modules-col">
            <div className="col-header">
                <span>📚 Course Modules</span>
                <span style={{ fontSize: '0.8em', color: 'var(--muted)' }}>{doneCount}/{totalLessons}</span>
            </div>
            <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progressPct}%` }}></div>
            </div>
            <div className="mod-list">
                {modules.map((mod, idx) => (
                    <div key={idx} className="module-group">
                        <div className="mod-group-title">Module {idx + 1} — {mod.title}</div>
                        
                        {(mod.lessons || []).map((lesson, lIdx) => {
                            const lessonTitle = typeof lesson === 'string' ? lesson : lesson.title;
                            const isActive = activeLesson && (typeof activeLesson === 'string' ? activeLesson === lessonTitle : activeLesson.title === lessonTitle);
                            const isDone = completedLessons.includes(lessonTitle);
                            return (
                                <div 
                                    key={lIdx} 
                                    className={`lesson-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
                                    onClick={() => onSelectLesson(lesson)}
                                >
                                    <div className="lesson-dot"></div>
                                    <span className="lesson-title">{lessonTitle}</span>
                                    {isDone && <span style={{ fontSize: '0.75em', color: '#22c55e' }}>✓</span>}
                                </div>
                            );
                        })}
                    </div>
                ))}

                {/* Final Test Entry */}
                <div className={`lesson-item test-entry ${allDone ? '' : 'locked'}`} onClick={allDone ? onGoToTest : undefined}>
                    <div className="lesson-dot test-dot"></div>
                    <span className="lesson-title">
                        {allDone ? '🎯 Take Final Test' : '🔒 Final Test (Complete all lessons)'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ModuleList;
