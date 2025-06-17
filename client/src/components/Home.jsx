import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/Home.css';

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const email = localStorage.getItem('email');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCoursesAndProgress = async () => {
      try {
        // Fetch courses
        const coursesRes = await axios.get('https://codinghub-r3bn.onrender.com/api/courses');
        setCourses(coursesRes.data);


        // Fetch user progress
        if (email) {
          const progressRes = await axios.get(`${import.meta.env.VITE_API_URL}/${email}/progress`);
          setProgressData(progressRes.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch courses or progress:', err);
      }
    };

    fetchCoursesAndProgress();
  }, [email]);

  // Map progress data to course information
  const mergedData = courses.map(course => {
    const courseProgress = progressData.find(p => p.courseId === course._id);
    const completed = courseProgress?.completedLessons?.length || 0;
    const total = course.sections.reduce((sum, section) => sum + section.lessons.length, 0);
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      courseId: course._id,
      courseName: course.title,
      percent,
      completed,
      total
    };
  });

  // Sort by completion percentage and pick top 4
  const topCourses = mergedData
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 4);

  // Fill empty slots if needed
  while (topCourses.length < 4) {
    topCourses.push({
      courseId: '',
      courseName: '',
      logo: '',
      percent: 0,
      completed: 0,
      total: 0
    });
  }

  const handleCourseClick = (courseId) => {
    if (courseId) {
      navigate(`/courses/${courseId}`);
    }
  };

  return (
    <>
      <Navbar />
      <div className="home-container">

        <section className="progress-section">
          <h2>Your Progress</h2>
          <div className="progress-cards">
            {topCourses.map((course, idx) => (
              <div
                className={`progress-card ${course.courseId ? '' : 'disabled'}`}
                key={idx}
                onClick={() => handleCourseClick(course.courseId)}
                style={{ cursor: course.courseId ? 'pointer' : 'not-allowed' }}
              >
                <p className="course-title">
                  {course.logo && (
                    <img
                      src={course.logo}
                      alt={`${course.courseName} logo`}
                      className="course-logo"
                    />
                  )}
                  {course.courseName || '—'}
                </p>
                <div className="progress-bar">
                  <div
                    className="progress"
                    style={{ width: `${course.percent}%` }}
                  ></div>
                </div>
                <div className="progress-info">
                  <span>{course.percent}% complete</span>
                  <span>{course.completed}/{course.total}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="self-eval-section">
          <h2>Challenge Yourself</h2>
          <button
            className="self-eval-button"
            onClick={() => navigate('/self-evaluation')}
          >
            Take Self Evaluation Quiz
          </button>
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