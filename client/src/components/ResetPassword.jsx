import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/Login.css';
import API_URL from '../utils/config';

const ResetPassword = () => {
    // === Get token from URL query string ===
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");  // Token used to verify identity

    // === State hooks for password inputs and feedback ===
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState(''); // For success message
    const [error, setError] = useState('');     // For error message
    const [loading, setLoading] = useState(false); // Show spinner/loading text
    const navigate = useNavigate();

    // === Handle password reset form submission ===
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Check if passwords match
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            // Make POST request to reset password
            const response = await fetch(`${API_URL}/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                // Password reset successful
                setMessage(data.message);
                setError('');
                // Redirect back to login after short delay
                setTimeout(() => navigate('/'), 2000);
            } else {
                // Backend returned error (e.g., expired token)
                setError(data.message);
            }
        } catch (err) {
            // Catch network or unexpected errors
            setError("Something went wrong.");
        }

        setLoading(false);
    };

    return (
        <div
            className="full-screen-bg"
            style={{ backgroundImage: `url('./assets/images/codingbg.jpg')` }}
        >
            <div className="login-container">
                <div className="logo">Coding Hub</div>
                <h1 className="welcome-text">Reset Your Password</h1>

                {/* === Password Reset Form === */}
                <form onSubmit={handleSubmit}>
                    {/* New Password Field */}
                    <div className="input-container">
                        <label className="label-left">New Password</label>
                        <input
                            type="password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Confirm Password Field */}
                    <div className="input-container">
                        <label className="label-left">Confirm Password</label>
                        <input
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Status Messages */}
                    {loading && <p className="loading">Resetting password...</p>}
                    {message && <p className="success">{message}</p>}
                    {error && <p className="error">{error}</p>}

                    {/* Submit Button */}
                    <div className="button-container">
                        <button type="submit" disabled={loading}>
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
