import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5050/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('email', data.email);
                setError('');

                // Check for preferences and navigate accordingly
                if (data.languagePreference && data.experiencePreference && data.commitmentPreference) {
                    navigate('/home');
                } else {
                    if (!data.languagePreference) {
                        navigate('/language-preference');
                    } else if (!data.experiencePreference) {
                        navigate('/experience-preference');
                    } else {
                        navigate('/commitment-preference');
                    }
                }
            } else {
                setError(data.message || 'Login failed.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <div className="login-container">
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                {error && <p className="error">{error}</p>}
                <button type="submit">Login</button>
            </form>
            <p className="link">
                Don't have an account? <Link to="/signup">Sign Up</Link>
            </p>
        </div>
    );
};

export default Login;
