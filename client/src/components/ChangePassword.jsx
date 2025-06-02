// src/components/ChangePassword.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import '../styles/EditProfile.css';
import axios from 'axios';

const validatePasswordStrength = (password) => {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return strongRegex.test(password) ? 'strong' : 'weak';
};

const ChangePassword = () => {
    const navigate = useNavigate();
    const email = localStorage.getItem('email');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert("Please fill in all fields.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("New passwords do not match.");
            return;
        }

        if (validatePasswordStrength(newPassword) !== 'strong') {
            alert("New password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
            return;
        }

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/change-password`, {
                email,
                currentPassword,
                newPassword,
                confirmPassword
            });
            alert("Password changed successfully!");
            navigate('/profile');
        } catch (err) {
            console.error("Error changing password:", err);
            alert(err.response?.data?.message || "Failed to change password.");
        }
    };

    return (
        <>
            <Navbar />
            <div className="edit-profile-container">
                <div className="header-with-back">
                    <span className="back-arrow" onClick={() => navigate('/profile')}>&larr; Back</span>
                    <h2>Change Password</h2>
                </div>

                <label>Current Password:</label>
                <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                />

                <label>New Password:</label>
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />

                <label>Confirm New Password:</label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <button className="save-button" onClick={handleChangePassword}>Change Password</button>
            </div>
        </>
    );
};

export default ChangePassword;
