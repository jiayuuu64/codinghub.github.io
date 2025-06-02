import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Login.css';
import API_URL from '../utils/config';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Start loading

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                Promise.all([
                    localStorage.setItem('token', data.token),
                    localStorage.setItem('email', data.email),
                ]);

                if (data.languagePreference && data.experiencePreference && data.commitmentPreference) {
                    navigate('/home');
                } else {
                    navigate('/language-preference');
                }

                setLoading(false);
                setError('');
            } else {
                setLoading(false);
                setError(data.message || 'Login failed.');
            }
        } catch (err) {
            setLoading(false);
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <div className="full-screen-bg" style={{ backgroundImage: `url('./assets/images/codingbg.jpg')` }}>
            <div className="login-container">
                <div className="logo">Coding Hub</div>
                <h1 className="welcome-text">Welcome back!</h1>
                <form onSubmit={handleSubmit}>
                    <div className="input-container">
                        <label className="label-left">Email</label>
                        <input
                            type="email"
                            placeholder="Your e-mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-container">
                        <label className="label-left">Password</label>
                        <input
                            type="password"
                            placeholder="Your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {loading && <p className="loading">Logging in, please wait...</p>}
                    {error && <p className="error">{error}</p>}
                    <div className="button-container">
                        <button type="submit" disabled={loading}>
                            {loading ? 'Logging in...' : 'Log in'}
                        </button>
                    </div>
                </form>
                <p className="link">
                    Don't have an account? <Link to="/signup">Create an account</Link>
                </p>
                <p className="link">
                    <Link to="/forgot-password">Forgot your password?</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
