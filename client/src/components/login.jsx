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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Store only the token and email
                localStorage.setItem('token', data.token);
                localStorage.setItem('email', data.email);

                // Check preferences from the response directly
                if (data.languagePreference && data.experiencePreference && data.commitmentPreference) {
                    navigate('/home');
                } else {
                    navigate('/language-preference');
                }

                setError('');
            } else {
                setError(data.message || 'Login failed.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <div className="full-screen-bg" style={{ backgroundImage: `url('/src/assets/images/codingbg.jpg')` }}>
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
                    {error && <p className="error">{error}</p>}
                    <div className="button-container">
                        <button type="submit">Log in</button>
                    </div>
                </form>
                <p className="link">
                    Don't have an account? <Link to="/signup">Create an account</Link>
                </p>
                <p className="link">
                    <a href="#">Reset your password</a>
                </p>
            </div>
        </div>
    );
};

export default Login;
