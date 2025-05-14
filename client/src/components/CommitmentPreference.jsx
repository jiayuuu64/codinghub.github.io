import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Personalize.css';

const commitments = [
    "5 min per day (Easygoing)",
    "15 min per day (Standard)",
    "30 min per day (Committed)",
    "60 min per day (Immersive)"
];

const CommitmentPreference = () => {
    const [selected, setSelected] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const email = localStorage.getItem('email');

    // Progress calculation for Commitment step
    const progress = selected ? 100 : 66;

    const handleSave = async () => {
        try {
            const response = await fetch('http://localhost:5050/api/users/commitment-preference', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, preference: selected }),
            });

            const data = await response.json();
            if (response.ok) {
                setMessage('Commitment saved! Redirecting to home...');
                navigate('/home');
            } else {
                setMessage(data.message || 'Failed to save commitment.');
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
            <h2>Select Your Commitment Level</h2>
            <div className="preference-list">
                {commitments.map((commitment) => (
                    <button
                        key={commitment}
                        className={`preference-item ${selected === commitment ? 'selected' : ''}`}
                        onClick={() => setSelected(commitment)}
                    >
                        {commitment}
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

export default CommitmentPreference;
