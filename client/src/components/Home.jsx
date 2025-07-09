import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/Home.css';

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const email = localStorage.getItem('email');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL;

        // Fetch courses
        const coursesRes = await axios.get(`${baseUrl.replace('/users', '')}/courses`);
        setCourses(coursesRes.data);

        // Fetch user progress
        if (email) {
          const progressRes = await axios.get(`${baseUrl}/${email}/progress`);
          setProgressData(progressRes.data || []);
        }

        // Fetch recommendations
        if (email) {
          const recRes = await axios.get(`${baseUrl.replace('/users', '')}/recommendations?email=${email}`);
          setRecommendations(recRes.data || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchAll();
  }, [email]);

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

  const topCourses = mergedData.sort((a, b) => b.percent - a.percent).slice(0, 4);
  while (topCourses.length < 4) {
    topCourses.push({ courseId: '', courseName: '', percent: 0, completed: 0, total: 0 });
  }

  const handleCourseClick = (courseId) => {
    if (courseId) navigate(`/courses/${courseId}`);
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
                <p className="course-title">{course.courseName || '—'}</p>
                <div className="progress-bar">
                  <div className="progress" style={{ width: `${course.percent}%` }}></div>
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
          <div className="recommendation-grid">
            {recommendations.map((rec, idx) => (
              <div
                className="recommendation-card"
                key={idx}
                onClick={() => rec.link && window.open(rec.link, '_blank')}
                style={{ cursor: rec.link ? 'pointer' : 'not-allowed' }}
              >
                <img
                  src={rec.thumbnail}
                  alt={rec.title}
                  className="recommendation-thumb"
                />
                <div>
                  <p className="recommendation-type">{rec.type?.toUpperCase()}</p>
                  <p className="recommendation-title">{rec.title}</p>
                  {rec.hostname && <p className="recommendation-site">{rec.hostname}</p>}
                </div>
                {rec.link ? (
                  <a href={rec.link} target="_blank" rel="noopener noreferrer">View</a>
                ) : (
                  <p className="disabled-link">Link not available</p>
                )}
              </div>
            ))}

            {recommendations.length === 0 && (
              <p style={{ color: '#ccc', textAlign: 'center', marginTop: '1rem' }}>
                No recommendations yet — complete a quiz to see personalized suggestions!
              </p>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
