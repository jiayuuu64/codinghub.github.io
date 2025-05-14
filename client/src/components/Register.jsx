import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Register.css';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5050/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Registration successful! Redirecting to login...');
                setError('');
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            } else {
                setError(data.message || 'Registration failed.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <div className="register-container">
            <div className="logo">Coding Hub</div>
            <h1 className="start-learning">Start learning to code today!</h1>
            <form onSubmit={handleSubmit}>
                <div className="input-container">
                    <label htmlFor="name" className="label-left">Name</label>
                    <input
                        id="name"
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="input-container">
                    <label htmlFor="email" className="label-left">Email</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="Your e-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="input-container">
                    <label htmlFor="password" className="label-left">Password</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {success && <p className="success">{success}</p>}
                {error && <p className="error">{error}</p>}
                <div className="button-container">
                    <button type="submit">Register</button>
                </div>
            </form>
            <p className="link">
                Already have an account? <Link to="/">Login</Link>
            </p>
        </div>
    );
};

export default Register;
