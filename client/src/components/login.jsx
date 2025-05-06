import React, { useState } from 'react';
import './Login.css'; // Add custom styles
 
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
 
    // Handle email change
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };
 
    // Handle password change
    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };
 
    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
 
        if (!email || !password) {
            setError('Email and password are required!');
            return;
        }
 
        try {
            const response = await fetch('http://localhost:5050/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
 
            const data = await response.json();
 
            // If the login was successful
            if (response.ok) {
                console.log('Login successful:', data);
                // Handle the response, e.g., storing JWT token or redirecting
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            console.error(err);
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