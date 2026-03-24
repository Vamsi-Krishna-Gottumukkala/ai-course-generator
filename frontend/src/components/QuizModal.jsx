import React, { useState, useEffect } from 'react';
import { generateQuiz } from '../services/api';
import './QuizModal.css';

const QuizModal = ({ isVisible, onClose, lessonContent }) => {
    const [questions, setQuestions] = useState([]);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchQuiz = async () => {
            setLoading(true);
            try {
                const res = await generateQuiz(lessonContent);
                if (res.data && res.data.questions) {
                    setQuestions(res.data.questions);
                }
            } catch (err) {
                console.error("Quiz gen error", err);
                alert("Failed to generate quiz.");
                onClose();
            } finally {
                setLoading(false);
            }
        };

        if (isVisible && lessonContent) {
            fetchQuiz();
        } else if (!isVisible) {
            // Reset
            setQuestions([]);
            setSelectedAnswers({});
            setIsSubmitted(false);
        }
    }, [isVisible, lessonContent]);

    if (!isVisible) return null;

    const handleSubmit = () => {
        setIsSubmitted(true);
    };

    const handleSelect = (qIdx, optIdx) => {
        if (isSubmitted) return;
        setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
    };

    const getOptClass = (qIdx, optIdx, correctIdx) => {
        const sel = selectedAnswers[qIdx];
        if (!isSubmitted) return sel === optIdx ? 'sel' : '';
        if (optIdx === correctIdx) return 'correct';
        if (sel === optIdx && sel !== correctIdx) return 'wrong';
        return '';
    };

    return (
        <div className={`overlay ${isVisible ? 'show' : ''}`}>
            <div className="quiz-modal">
                <h3>📝 Lesson Quiz</h3>
                <p className="sub">{loading ? 'AI is generating questions...' : `${questions.length} Questions · Auto-graded · Instant explanation`}</p>
                
                {loading && <div style={{ padding: '40px', textAlign: 'center' }}>Generating Quiz... Requesting from Gemini API.</div>}

                {!loading && questions.map((q, qIdx) => (
                    <div key={qIdx} className="q-box">
                        <div className="q-text">Q{qIdx + 1}. {q.question}</div>
                        <div className="q-opts">
                            {q.options.map((opt, optIdx) => (
                                <div 
                                    key={optIdx}
                                    className={`q-opt ${getOptClass(qIdx, optIdx, q.correctAnswerIndex)}`} 
                                    onClick={() => handleSelect(qIdx, optIdx)}
                                >
                                    {opt} {isSubmitted && optIdx === q.correctAnswerIndex && '✓'}
                                </div>
                            ))}
                        </div>
                        {isSubmitted && (
                            <div style={{ marginTop: '10px', fontSize: '.75em', color: 'var(--p1)', background: 'rgba(79,70,229,.1)', padding: '10px', borderRadius: '8px' }}>
                                <strong>Explanation:</strong> {q.explanation}
                            </div>
                        )}
                    </div>
                ))}

                <div className="quiz-btns">
                    <button className="btn-close" onClick={onClose}>{isSubmitted ? 'Close' : 'Cancel'}</button>
                    {!loading && !isSubmitted && questions.length > 0 && (
                        <button className="btn-submit-q" onClick={handleSubmit}>Submit Answers</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizModal;
