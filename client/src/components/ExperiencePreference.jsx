import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Personalize.css';
import API_URL from '../utils/config';

// Available experience level options
const experienceLevels = [
    "Complete Beginner",
    "Some Experience",
    "Confident Coder",
    "Expert"
];

const ExperiencePreference = () => {
    const [selected, setSelected] = useState(''); // Tracks selected experience level
    const [message, setMessage] = useState('');   // Feedback message to user
    const navigate = useNavigate();               // React Router navigation
    const email = localStorage.getItem('email');  // Retrieve user email from localStorage

    // Determine progress bar fill (66% if selected, else 33%)
    const progress = selected ? 66 : 33;

    // Function to save experience level to backend
    const handleSave = async () => {
        try {
            const response = await fetch(`${API_URL}/experience-preference`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, preference: selected }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Experience level saved! Redirecting...');
                navigate('/commitment-preference'); // Go to next step
            } else {
                setMessage(data.message || 'Failed to save experience level.');
            }
        } catch (err) {
            setMessage('Error occurred while saving.'); // Handle server/network error
        }
    };

    return (
        <div className="preference-container">
            {/* Progress bar display */}
            <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>

            {/* Header */}
            <h2>Select Your Experience Level</h2>

            {/* Experience Level Options */}
            <div className="preference-list">
                {experienceLevels.map((level) => (
                    <button
                        key={level}
                        className={`preference-item ${selected === level ? 'selected' : ''}`}
                        onClick={() => setSelected(level)} // Set selected level
                    >
                        {level}
                    </button>
                ))}
            </div>

            {/* Continue Button */}
            <button
                onClick={handleSave}
                disabled={!selected} // Disable button until a selection is made
                className={`save-button ${selected ? 'enabled' : ''}`}
            >
                Continue
            </button>

            {/* Feedback Message */}
            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default ExperiencePreference;
