import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';
import logo from '../assets/images/coding.png';
import '../styles/Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <img src={logo} alt="Coding Hub Logo" className="logo-img" />
                <span className="brand">Coding Hub</span>
            </div>

            <div className="navbar-center">
                <Link to="/" className="nav-link active">Home</Link>
                <span className="divider">|</span>
                <Link to="/courses" className="nav-link">Courses</Link>
                <span className="divider">|</span>
                <Link to="/profile" className="nav-link">Profile</Link>
            </div>

            <button className="logout-button" onClick={handleLogout}>Logout</button>
        </nav>
    );
};

export default Navbar;
