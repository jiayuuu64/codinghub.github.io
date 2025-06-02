// src/components/Sections.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import '../styles/Sections.css'; // ✅ Make sure this path is correct

const Sections = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await axios.get(`https://codinghub-r3bn.onrender.com/api/courses/${courseId}`);
                setCourse(res.data);
            } catch (err) {
                console.error('Failed to fetch course:', err);
            }
        };

        fetchCourse();
    }, [courseId]);

    if (!course) {
        return (
            <>
                <Navbar />
                <div className="home-container">
                    <h1 className="course-title">Loading course...</h1>
                    <div className="spinner"></div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="home-container">
                <h1 className="course-title">{course.title}</h1>
                {course.sections.map((section, i) => (
                    <div key={section._id} className="section">
                        <h2 className="section-title">{i + 1}. {section.title}</h2>
                        {section.description && (
                            <p className="section-description">{section.description}</p>
                        )}
                        {section.lessons.map((lesson, j) => (
                            <div key={lesson._id} className="lesson-card" onClick={() => navigate(`/lesson/${lesson._id}`)}>
                                <span className="lesson-index">{(j + 1).toString().padStart(2, '0')}</span>
                                <span className="lesson-title">{lesson.title}</span>
                                <button className="lesson-button">LEARN</button>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </>
    );
};

export default Sections;