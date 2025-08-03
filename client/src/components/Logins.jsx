import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Login.css';
import API_URL from '../utils/config';

const Login = () => {
    // === State Hooks ===
    const [email, setEmail] = useState('');             // User email input
    const [password, setPassword] = useState('');       // User password input
    const [error, setError] = useState('');             // Error message to display
    const [loading, setLoading] = useState(false);      // Loading spinner state

    const navigate = useNavigate();                     // React Router navigation hook

    // === Submit login form ===
    const handleSubmit = async (e) => {
        e.preventDefault();                             // Prevent default form reload
        setLoading(true);                               // Show loading spinner

        try {
            // Send login credentials to backend
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // ✅ Save login info to localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('email', data.email);
                localStorage.setItem('isAdmin', data.isAdmin);

                // ✅ Route users based on role and onboarding status
                if (data.isAdmin) {
                    navigate('/admin');
                } else if (data.languagePreference && data.experiencePreference && data.commitmentPreference) {
                    navigate('/home'); // All preferences set → go to dashboard
                } else {
                    navigate('/language-preference'); // Incomplete onboarding
                }

                setLoading(false);
                setError('');
            } else {
                // ❌ Login failed
                setLoading(false);
                setError(data.message || 'Login failed.');
            }
        } catch (err) {
            // ❌ Network or server error
            setLoading(false);
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <div className="full-screen-bg" style={{ backgroundImage: `url('./assets/images/codingbg.jpg')` }}>
            <div className="login-container">
                {/* === App logo and greeting === */}
                <div className="logo">Coding Hub</div>
                <h1 className="welcome-text">Welcome back!</h1>

                {/* === Login form === */}
                <form onSubmit={handleSubmit}>
                    {/* Email input */}
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

                    {/* Password input */}
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

                    {/* Show status messages */}
                    {loading && <p className="loading">Logging in, please wait...</p>}
                    {error && <p className="error">{error}</p>}

                    {/* Submit button */}
                    <div className="button-container">
                        <button type="submit" disabled={loading}>
                            {loading ? 'Logging in...' : 'Log in'}
                        </button>
                    </div>
                </form>

                {/* Additional links */}
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
