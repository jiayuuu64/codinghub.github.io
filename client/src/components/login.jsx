import React, { useState } from 'react';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError('Email and password are required!');
            return;
        }

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
                // ✅ Login successful
                console.log('Login successful:', data);
                localStorage.setItem('token', data.token); // Store JWT
                localStorage.setItem('email', data.email); // Optional
                setError('');
                // window.location.href = '/dashboard'; // Redirect after login
            } else {
                setError(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('An error occurred. Please try again later.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h1>Coding Hub</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="email"
                            placeholder="Your e-mail"
                            value={email}
                            onChange={handleEmailChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Your password"
                            value={password}
                            onChange={handlePasswordChange}
                            required
                        />
                    </div>
                    {error && <p className="error">{error}</p>}
                    <button type="submit">Login</button>
                </form>
                <p>Don't have an account? <a href="/signup">Sign up</a></p>
            </div>
        </div>
    );
};

export default Login;