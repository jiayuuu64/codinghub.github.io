import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';
import '../styles/Navbar.css';

const logo = '/assets/images/coding.png';

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
                <NavLink to="/home" className="nav-link" end>Home</NavLink>
                <span className="divider">|</span>
                <NavLink to="/courses" className="nav-link">Courses</NavLink>
                <span className="divider">|</span>
                <NavLink to="/profile" className="nav-link">Profile</NavLink>
            </div>

            <button className="logout-button" onClick={handleLogout}>Logout</button>
        </nav>
    );
};

export default Navbar;
