import React, { useState, useEffect } from 'react';
import { chatWithTutor } from '../services/api';
import './Chatbot.css';

const Chatbot = ({ context }) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setMessages([
            { type: 'ai', text: `Hi! I'm your AI tutor. I see you are learning **${context}**. Ask me anything!` }
        ]);
    }, [context]);

    const handleSend = async (text) => {
        if (!text.trim()) return;

        setMessages(prev => [...prev, { type: 'user', text }]);
        setInputValue('');
        setLoading(true);

        try {
            const res = await chatWithTutor(text, context);
            setMessages(prev => [...prev, { type: 'ai', text: res.data.reply }]);
        } catch (err) {
            console.error("Chat error", err);
            setMessages(prev => [...prev, { type: 'ai', text: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tutor-col">
            <div className="tutor-header">
                <div className="online-dot"></div>
                <h3>AI Tutor</h3>
                <span className="badge">Online</span>
            </div>
            <div className="suggestions">
                <div className="sug" onClick={() => handleSend("Explain simply")}>Explain simply</div>
                <div className="sug" onClick={() => handleSend("Give an example")}>Give an example</div>
                <div className="sug" onClick={() => handleSend("Debug my code")}>Debug my code</div>
                <div className="sug" onClick={() => handleSend("Revision notes")}>Revision notes</div>
            </div>
            <div className="chat-messages">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`msg ${msg.type}`}>
                        {msg.text}
                    </div>
                ))}
                {loading && <div className="msg ai">Thinking...</div>}
            </div>
            <div className="chat-input-row">
                <input 
                    type="text" 
                    placeholder="Ask anything about this lesson…" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSend(inputValue);
                    }}
                    disabled={loading}
                />
                <button className="send-btn" onClick={() => handleSend(inputValue)} disabled={loading}>→</button>
            </div>
        </div>
    );
};

export default Chatbot;
