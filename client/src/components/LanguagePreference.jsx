import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Personalize.css';

const languages = ["Python", "JavaScript", "HTML", "SQL", "CSS", "Java", "C++", "PHP", "Dart"];

const LanguagePreference = () => {
    const [selected, setSelected] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const email = localStorage.getItem('email');

    // Progress calculation for Language step
    const progress = selected ? 33 : 0;

    const handleSave = async () => {
        try {
            const response = await fetch('http://localhost:5050/api/users/language-preference', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, preference: selected }),
            });

            const data = await response.json();
            if (response.ok) {
                setMessage('Language preference saved! Redirecting...');
                navigate('/experience-preference');
            } else {
                setMessage(data.message || 'Failed to save language preference.');
            }
        } catch (err) {
            setMessage('Error saving preference.');
        }
    };

    return (
        <div className="preference-container">
            <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <h2>Select your preferred language</h2>
            <div className="preference-list">
                {languages.map((lang) => (
                    <button
                        key={lang}
                        className={`preference-item ${selected === lang ? 'selected' : ''}`}
                        onClick={() => setSelected(lang)}
                    >
                        {lang}
                    </button>
                ))}
            </div>
            <button 
                onClick={handleSave} 
                disabled={!selected} 
                className="save-button"
            >
                Save Preference
            </button>
            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default LanguagePreference;
