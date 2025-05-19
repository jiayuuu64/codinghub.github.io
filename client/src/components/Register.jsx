import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Register.css';
import API_URL from '../utils/config';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Start loading

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Registration successful! Redirecting...');
                setError('');
                setIsRegistered(true); 
                setLoading(false);
                setTimeout(() => navigate('/'), 1000);
            } else {
                setLoading(false);
                setError(data.message || 'Registration failed.');
            }
        } catch (err) {
            setLoading(false);
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <div className="full-screen-bg" style={{ backgroundImage: `url('./assets/images/codingbg.jpg')` }}>
            <div className="register-container">
                <div className="logo">Coding Hub</div>
                <h1 className="welcome-text">Start learning to code today!</h1>
                <form onSubmit={handleSubmit}>
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
                    {loading && <p className="loading">Signing up, please wait...</p>}
                    {success && <p className="success">{success}</p>}
                    {error && <p className="error">{error}</p>}
                    <div className="button-container">
                        <button type="submit" disabled={loading || isRegistered}>
                            {isRegistered ? 'Registered!' : (loading ? 'Signing Up...' : 'Sign Up')}
                        </button>
                    </div>
                </form>
                <p className="link">
                    Already have an account? <Link to="/">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
