import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from './Navbar';
import '../styles/Sections.css';

const Sections = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState([]);
  const email = localStorage.getItem('email');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await axios.get(`https://codinghub-r3bn.onrender.com/api/courses/${courseId}`);
        setCourse(res.data);
      } catch (err) {
        console.error('Failed to fetch course:', err);
      }
    };

    const fetchProgress = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/${email}/progress/${courseId}`);
        setProgress(res.data.progress?.completedLessons || []);
      } catch (err) {
        console.error('Failed to fetch progress:', err);
      }
    };

    fetchCourse();
    fetchProgress();
  }, [courseId, email]);

  const calculateProgress = () => {
    if (!course) return 0;
    let totalLessons = 0;
    course.sections.forEach(section => {
      totalLessons += section.lessons.length;
    });
    if (totalLessons === 0) return 0;
    return Math.round((progress.length / totalLessons) * 100);
  };

  const handleLessonClick = (lessonId) => {
    navigate(`/lesson/${lessonId}?courseId=${courseId}`);
  };

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

        {/* Progress Tracker */}
        <div className="progress-container">
          <div className="progress-bar-wrapper">
            <div
              className="progress-bar-fill"
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
          <p className="progress-percentage">{calculateProgress()}% completed</p>
        </div>

        {course.sections.map((section, i) => (
          <div key={section._id} className="section">
            <h2 className="section-title">{i + 1}. {section.title}</h2>
            {section.description && (
              <p className="section-description">{section.description}</p>
            )}
            {section.lessons.map((lesson, j) => {
              const isCompleted = progress.includes(lesson._id);
              return (
                <div
                  key={lesson._id}
                  className={`lesson-card ${isCompleted ? 'completed' : ''}`}
                  onClick={() => handleLessonClick(lesson._id)}
                >
                  <span className="lesson-index">{(j + 1).toString().padStart(2, '0')}</span>
                  <span className="lesson-title">{lesson.title}</span>
                  {isCompleted ? (
                    <span className="lesson-completed-icon">✅ Completed</span>
                  ) : (
                    <button className="lesson-button">LEARN</button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
};

export default Sections;
