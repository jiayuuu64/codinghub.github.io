import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';

const Home = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div>
            <h1>Welcome back, {localStorage.getItem('email') || "User"}!</h1>
            <p>This is the home page.</p>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default Home;
