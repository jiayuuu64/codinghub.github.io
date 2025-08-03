import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Personalize.css';
import API_URL from '../utils/config';

// List of available programming languages with their logo URLs
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
  // === State hooks ===
  const [selected, setSelected] = useState('');         // Holds selected language name
  const [message, setMessage] = useState('');           // Message shown after submission
  const navigate = useNavigate();                       // React Router navigation
  const email = localStorage.getItem('email');          // Fetch user's email from local storage

  // Determine progress bar fill (1/3 of total onboarding)
  const progress = selected ? 33 : 0;

  // === Function to save selected preference ===
  const handleSave = async () => {
    try {
      const response = await fetch(`${API_URL}/language-preference`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, preference: selected }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show success message and move to next step
        setMessage('Language preference saved! Redirecting...');
        navigate('/experience-preference');
      } else {
        // Show error message from server
        setMessage(data.message || 'Failed to save language preference.');
      }
    } catch (err) {
      setMessage('Error saving preference.');
    }
  };

  return (
    <div className="preference-container">
      {/* === Progress bar at the top === */}
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
      </div>

      {/* === Page title === */}
      <h2>Select your preferred language</h2>

      {/* === List of language buttons === */}
      <div className="preference-list">
        {languages.map((lang) => (
          <button
            key={lang.name}
            className={`preference-item ${selected === lang.name ? 'selected' : ''}`}
            onClick={() => setSelected(lang.name)} // Set selected language on click
          >
            <img src={lang.logo} alt={`${lang.name} logo`} className="lang-logo" />
            {lang.name}
          </button>
        ))}
      </div>

      {/* === Continue button, only active if a language is selected === */}
      <button
        onClick={handleSave}
        disabled={!selected}
        className={`save-button ${selected ? 'enabled' : ''}`}
      >
        Continue
      </button>

      {/* === Display message (success or error) === */}
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default LanguagePreference;
