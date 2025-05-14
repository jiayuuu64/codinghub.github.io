import React from 'react';
import Navbar from '../components/Navbar'; // Import the Navbar


const Home = () => {
    return (
        <>
            <Navbar />
            <div className="home-container">
                <h1>Welcome back, {localStorage.getItem('email') || "User"}!</h1>
                <p>This is the home page.</p>
            </div>
        </>
    );
};

export default Home;