import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Register.css';
import API_URL from '../utils/config';

const Register = () => {
    // === State Hooks for form fields and status flags ===
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');         // For error messages
    const [success, setSuccess] = useState('');     // For success messages
    const [loading, setLoading] = useState(false);  // Shows loading while API call happens
    const [isRegistered, setIsRegistered] = useState(false); // Prevents further edits after success
    const navigate = useNavigate();

    // === Form Submit Handler ===
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if passwords match
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true); // Start loading animation

        try {
            // Send POST request to backend
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Registration success: show message and redirect shortly
                setSuccess('Registration successful! Redirecting...');
                setError('');
                setIsRegistered(true); // Disable input fields
                setLoading(false);

                // Redirect to login after 1 second
                setTimeout(() => navigate('/'), 1000);
            } else {
                // Show backend error message
                setLoading(false);
                setError(data.message || 'Registration failed.');
            }
        } catch (err) {
            // Catch network or unexpected errors
            setLoading(false);
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <div
            className="full-screen-bg"
            style={{ backgroundImage: `url('./assets/images/codingbg.jpg')` }}
        >
            <div className="register-container">
                <div className="logo">Coding Hub</div>
                <h1 className="welcome-text">Start learning to code today!</h1>

                {/* === Registration Form === */}
                <form onSubmit={handleSubmit}>
                    {/* Name Input */}
                    <div className="input-container">
                        <label className="label-left">Name</label>
                        <input
                            type="text"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            disabled={isRegistered}
                        />
                    </div>

                    {/* Email Input */}
                    <div className="input-container">
                        <label className="label-left">Email</label>
                        <input
                            type="email"
                            placeholder="Your e-mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isRegistered}
                        />
                    </div>

                    {/* Password Input */}
                    <div className="input-container">
                        <label className="label-left">Password</label>
                        <input
                            type="password"
                            placeholder="Your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isRegistered}
                        />
                    </div>

                    {/* Confirm Password Input */}
                    <div className="input-container">
                        <label className="label-left">Confirm Password</label>
                        <input
                            type="password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={isRegistered}
                        />
                    </div>

                    {/* Status messages */}
                    {loading && <p className="loading">Signing up, please wait...</p>}
                    {success && <p className="success">{success}</p>}
                    {error && <p className="error">{error}</p>}

                    {/* Submit Button */}
                    <div className="button-container">
                        <button type="submit" disabled={loading || isRegistered}>
                            {isRegistered ? 'Registered!' : (loading ? 'Signing Up...' : 'Sign Up')}
                        </button>
                    </div>
                </form>

                {/* Link to login */}
                <p className="link">
                    Already have an account? <Link to="/">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
