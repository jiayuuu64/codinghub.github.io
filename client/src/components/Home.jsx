import React from 'react';
import Navbar from '../components/Navbar';
import '../styles/Home.css';

const Home = () => {
    return (
        <>
            <Navbar />
            <div className="home-container">

                <h1>Welcome back, {localStorage.getItem('name') || "User"}!</h1>

                <section className="progress-section">
                    <h2>Your Progress</h2>
                    <div className="course-cards">
                        {[75, 35, 35, 35].map((progress, idx) => (
                            <div className="course-card" key={idx}>
                                <p className="course-title">Course Name</p>
                                <div className="progress-bar">
                                    <div className="progress" style={{ width: `${progress}%` }}></div>
                                </div>
                                <div className="progress-info">
                                    <span>{progress}% complete</span>
                                    <span>5/14</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="recommended-section">
                    <h2>Recommended For You</h2>
                    <div className="recommended-cards">
                        <div className="recommended-card"></div>
                        <div className="recommended-card"></div>
                        <div className="recommended-card"></div>
                        <div className="recommended-card"></div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default Home;
