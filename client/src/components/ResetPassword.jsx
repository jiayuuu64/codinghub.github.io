import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/Login.css'; // reuse styles
import API_URL from '../utils/config';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword }),
            });

            const data = await response.json();
            if (response.ok) {
                setMessage(data.message);
                setTimeout(() => navigate('/'), 2000);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Something went wrong.");
        }
        setLoading(false);
    };

    return (
        <div className="full-screen-bg" style={{ backgroundImage: `url('./assets/images/codingbg.jpg')` }}>
            <div className="login-container">
                <div className="logo">Coding Hub</div>
                <h1 className="welcome-text">Reset Your Password</h1>
                <form onSubmit={handleSubmit}>
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
                    {loading && <p className="loading">Resetting password...</p>}
                    {message && <p className="success">{message}</p>}
                    {error && <p className="error">{error}</p>}
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
