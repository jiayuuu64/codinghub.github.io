import React from 'react';
import Navbar from '../components/Navbar';
import '../styles/Home.css';

const Home = () => {
    const courses = [
        { name: "Python", logo: "https://img.icons8.com/color/48/000000/python.png" },
        { name: "JavaScript", logo: "https://img.icons8.com/color/48/000000/javascript.png" },
        { name: "HTML", logo: "https://img.icons8.com/color/48/000000/html-5--v1.png" },
        { name: "SQL", logo: "https://img.icons8.com/ios-filled/50/ffffff/sql.png" },
        { name: "CSS", logo: "https://img.icons8.com/color/48/000000/css3.png" },
        { name: "Java", logo: "https://img.icons8.com/color/48/000000/java-coffee-cup-logo.png" },
        { name: "C++", logo: "https://img.icons8.com/color/48/000000/c-plus-plus-logo.png" },
        { name: "PHP", logo: "https://img.icons8.com/officel/48/000000/php-logo.png" },
        { name: "Dart", logo: "https://img.icons8.com/color/48/000000/dart.png" }
    ];

    return (
        <>
            <Navbar />
            <div className="home-container">

                <section className="progress-section">
                    <h2>Your Progress</h2>
                    <div className="progress-cards">
                        {[75, 35, 35, 35].map((progress, idx) => (
                            <div className="progress-card" key={idx}>
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

                {/* <section className="courses-section">
                    <h2>Courses</h2>
                    <div className="course-cards">
                        {courses.map((course, idx) => (
                            <div className="course-card" key={idx}>
                                <div className="course-logo-title">
                                    <img src={course.logo} alt={`${course.name} logo`} className="course-logo" />
                                    <p className="course-title">{course.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section> */}
            </div>
        </>
    );
};

export default Home;
