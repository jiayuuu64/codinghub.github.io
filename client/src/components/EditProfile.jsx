// src/components/EditProfile.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import '../styles/EditProfile.css';
import axios from 'axios';

const EditProfile = () => {
    const navigate = useNavigate();
    const email = localStorage.getItem('email');

    const [profile, setProfile] = useState({
        name: '',
        email: email,
        languagePreference: '',
        experiencePreference: '',
        commitmentPreference: ''
    });

    const experienceLevels = [
        "Complete Beginner",
        "Some Experience",
        "Confident Coder",
        "Expert"
    ];

    const commitments = [
        "5 min per day (Easygoing)",
        "15 min per day (Standard)",
        "30 min per day (Committed)",
        "60 min per day (Immersive)"
    ];

    const languages = [
        "Python", "JavaScript", "HTML", "SQL", "CSS", "Java", "C++", "PHP", "Dart"
    ];

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/user-preferences?email=${email}`);
                setProfile((prev) => ({
                    ...prev,
                    name: response.data.name || '',
                    languagePreference: response.data.languagePreference || '',
                    experiencePreference: response.data.experiencePreference || '',
                    commitmentPreference: response.data.commitmentPreference || ''
                }));
            } catch (err) {
                console.error("Error fetching profile:", err);
            }
        };
        fetchProfile();
    }, [email]);

    const handleSaveProfile = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/update-profile`, profile);
            alert("Profile updated successfully!");
            navigate('/profile');
        } catch (err) {
            alert("Failed to update profile.");
            console.error(err);
        }
    };

    return (
        <>
            <Navbar />
            <div className="edit-profile-container">
                <div className="header-with-back">
                    <span className="back-arrow" onClick={() => navigate(-1)}>&larr; Back</span>
                    <h2>Edit Profile</h2>
                </div>

                <label>Name:</label>
                <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />

                <label>Email:</label>
                <input
                    type="email"
                    value={profile.email}
                    disabled
                />

                <label>Language Preference:</label>
                <select
                    value={profile.languagePreference}
                    onChange={(e) => setProfile({ ...profile, languagePreference: e.target.value })}
                >
                    <option value="">Select</option>
                    {languages.map((lang, idx) => (
                        <option key={idx} value={lang}>{lang}</option>
                    ))}
                </select>

                <label>Experience Preference:</label>
                <select
                    value={profile.experiencePreference}
                    onChange={(e) => setProfile({ ...profile, experiencePreference: e.target.value })}
                >
                    <option value="">Select</option>
                    {experienceLevels.map((level, idx) => (
                        <option key={idx} value={level}>{level}</option>
                    ))}
                </select>

                <label>Commitment Preference:</label>
                <select
                    value={profile.commitmentPreference}
                    onChange={(e) => setProfile({ ...profile, commitmentPreference: e.target.value })}
                >
                    <option value="">Select</option>
                    {commitments.map((commit, idx) => (
                        <option key={idx} value={commit}>{commit}</option>
                    ))}
                </select>

                <button className="save-button" onClick={handleSaveProfile}>Save Profile</button>

                <p className="change-password-link" onClick={() => navigate('/change-password')}>
                    Change Password?
                </p>
            </div>
        </>
    );
};

export default EditProfile;
