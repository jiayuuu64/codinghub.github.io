import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Personalize.css';

const experienceLevels = [
    "Complete Beginner",
    "Some Experience",
    "Confident Coder",
    "Expert"
];

const ExperiencePreference = () => {
    const [selected, setSelected] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const email = localStorage.getItem('email');

    // Progress calculation for Experience step
    const progress = selected ? 66 : 33;

    const handleSave = async () => {
        try {
            const response = await fetch('http://localhost:5050/api/users/experience-preference', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, preference: selected }),
            });

            const data = await response.json();
            if (response.ok) {
                setMessage('Experience level saved! Redirecting...');
                navigate('/commitment-preference');
            } else {
                setMessage(data.message || 'Failed to save experience level.');
            }
        } catch (err) {
            setMessage('Error occurred while saving.');
        }
    };

    return (
        <div className="preference-container">
            <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <h2>Select Your Experience Level</h2>
            <div className="preference-list">
                {experienceLevels.map((level) => (
                    <button
                        key={level}
                        className={`preference-item ${selected === level ? 'selected' : ''}`}
                        onClick={() => setSelected(level)}
                    >
                        {level}
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

export default ExperiencePreference;
