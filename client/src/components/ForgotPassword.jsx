import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Login.css';
import API_URL from '../utils/config';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/recover-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                setError('');
            } else {
                setMessage('');
                setError(data.message || 'Failed to send reset link.');
            }
        } catch (err) {
            setError('Something went wrong.');
            setMessage('');
        }

        setLoading(false);
    };

    return (
        <div className="full-screen-bg" style={{ backgroundImage: `url('./assets/images/codingbg.jpg')` }}>
            <div className="login-container">
                <div className="logo">Coding Hub</div>
                <h1 className="welcome-text">Forgot Your Password?</h1>
                <form onSubmit={handleSubmit}>
                    <div className="input-container">
                        <label className="label-left">Email</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    {loading && <p className="loading">Sending reset email...</p>}
                    {message && <p className="success">{message}</p>}
                    {error && <p className="error">{error}</p>}
                    <div className="button-container">
                        <button type="submit" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </div>
                </form>
                <p className="link">
                    Back to <Link to="/">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
