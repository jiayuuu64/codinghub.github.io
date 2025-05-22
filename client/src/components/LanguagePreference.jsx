import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Personalize.css';
import API_URL from '../utils/config';

const languages = [
    { name: "Python", logo: "https://img.icons8.com/color/48/000000/python.png" },
    { name: "JavaScript", logo: "https://img.icons8.com/color/48/000000/javascript.png" },
    { name: "HTML", logo: "https://img.icons8.com/color/48/000000/html-5--v1.png" },
    { name: "SQL", logo: "https://img.icons8.com/ios-filled/50/ffffff/sql.png" },
    { name: "CSS", logo: "https://img.icons8.com/color/48/000000/css3.png" },
    { name: "Java", logo: "https://img.icons8.com/color/48/000000/java-coffee-cup-logo.png" },
    { name: "C++", logo: "https://img.icons8.com/color/48/000000/c-plus-plus-logo.png" },
    { name: "PHP", logo: "https://img.icons8.com/officel/48/000000/php-logo.png" },
    { name: "Dart", logo: "https://img.icons8.com/color/48/000000/dart.png" }
];

const LanguagePreference = () => {
    const [selected, setSelected] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const email = localStorage.getItem('email');

    const progress = selected ? 33 : 0;

    const handleSave = async () => {
        try {
            const response = await fetch(`${API_URL}/language-preference`, {
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
                        key={lang.name}
                        className={`preference-item ${selected === lang.name ? 'selected' : ''}`}
                        onClick={() => setSelected(lang.name)}
                    >
                        <img src={lang.logo} alt={`${lang.name} logo`} className="lang-logo" />
                        {lang.name}
                    </button>
                ))}
            </div>
            <button
                onClick={handleSave}
                disabled={!selected}
                className={`save-button ${selected ? 'enabled' : ''}`}
            >
                Continue
            </button>
            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default LanguagePreference;
