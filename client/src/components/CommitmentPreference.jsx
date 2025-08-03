import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Personalize.css';
import API_URL from '../utils/config';

// List of commitment options to display
const commitments = [
    "5 min per day (Easygoing)",
    "15 min per day (Standard)",
    "30 min per day (Committed)",
    "60 min per day (Immersive)"
];

const CommitmentPreference = () => {
    const [selected, setSelected] = useState('');         // Tracks selected commitment level
    const [message, setMessage] = useState('');           // Feedback message to user
    const navigate = useNavigate();                       // Navigation hook
    const email = localStorage.getItem('email');          // Retrieve user email from localStorage

    // Calculate progress bar percentage (100% if selected, else 66%)
    const progress = selected ? 100 : 66;

    // Function to save selected preference to backend
    const handleSave = async () => {
        try {
            const response = await fetch(`${API_URL}/commitment-preference`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, preference: selected }),
            });

            const data = await response.json();
            if (response.ok) {
                setMessage('Commitment saved! Redirecting to home...');
                navigate('/home'); // Redirect to home page after saving
            } else {
                setMessage(data.message || 'Failed to save commitment.');
            }
        } catch (err) {
            setMessage('Error occurred while saving.'); // Handle network/server error
        }
    };

    return (
        <div className="preference-container">
            {/* Progress Bar */}
            <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>

            {/* Header */}
            <h2>Select Your Commitment Level</h2>

            {/* Commitment Option Buttons */}
            <div className="preference-list">
                {commitments.map((commitment) => (
                    <button
                        key={commitment}
                        className={`preference-item ${selected === commitment ? 'selected' : ''}`}
                        onClick={() => setSelected(commitment)} // Set selected option
                    >
                        {commitment}
                    </button>
                ))}
            </div>

            {/* Continue Button */}
            <button
                onClick={handleSave}
                disabled={!selected} // Disable if nothing selected
                className={`save-button ${selected ? 'enabled' : ''}`}
            >
                Continue
            </button>

            {/* Feedback Message */}
            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default CommitmentPreference;
