import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import '../styles/Profile.css';
import axios from 'axios';


const Profile = () => {
    const navigate = useNavigate();
    const email = localStorage.getItem('email');

    const [profile, setProfile] = useState({
        name: '',
        avatar: '',
        languagePreference: '',
        experiencePreference: '',
        commitmentPreference: ''
    });

    const [preview, setPreview] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/user-preferences?email=${email}`);
                setProfile(response.data);
            } catch (err) {
                console.error("Error fetching profile:", err);
            }
        };
        fetchProfile();
    }, [email]);

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // ✅ Allow up to 5MB
        if (file.size > 5 * 1024 * 1024) {
            alert("Please select an image smaller than 5MB.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result;

            try {
                const res = await axios.post(`${import.meta.env.VITE_API_URL}/update-avatar`, {
                    email,
                    avatarBase64: base64String
                });

                setPreview(base64String);
                alert(res.data.message || "Profile picture updated successfully");
            } catch (error) {
                if (error.response?.status === 413) {
                    alert("Image is too large. Please upload a file under 5MB.");
                } else {
                    alert("Failed to update profile picture");
                }
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <>
            <Navbar />
            <div className="profile-container">
                <div className="profile-header">
                    <div className="avatar-wrapper">
                        <img
                            src={preview || profile.avatar || 'https://img.icons8.com/ios-glyphs/90/ffffff/user--v1.png'}
                            alt="avatar"
                            className="avatar"
                        />
                        <label className="edit-avatar-button">
                            <input type="file" onChange={handleAvatarUpload} accept="image/*" hidden />
                            ✏️ Edit
                        </label>
                    </div>
                    <h2>{profile.name || 'User'}</h2>
                    <p>{email}</p>
                </div>

                <section className="preferences-section">
                    <h3>Your Preferences</h3>
                    <div className="preferences-cards">
                        <div className="preference-card">
                            <h4>Language</h4>
                            <p>{profile.languagePreference || 'Not set'}</p>
                        </div>
                        <div className="preference-card">
                            <h4>Experience</h4>
                            <p>{profile.experiencePreference || 'Not set'}</p>
                        </div>
                        <div className="preference-card">
                            <h4>Commitment</h4>
                            <p>{profile.commitmentPreference || 'Not set'}</p>
                        </div>
                    </div>
                </section>

                <div className="profile-section">
                    <h3>Course Progress</h3>
                    <div className="profile-progress-bar">
                        <div className="fill" style={{ width: '60%' }}></div>
                    </div>
                    <p>6 of 10 courses completed</p>
                </div>

                <div className="profile-footer">
                    <button className="edit-btn" onClick={() => navigate('/edit-profile')}>Edit Profile</button>
                </div>
            </div>
        </>
    );
};

export default Profile;
