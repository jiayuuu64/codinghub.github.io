import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/Home.css';

const API = 'https://codinghub-r3bn.onrender.com/api'; // keep consistent with SelfEvalQuiz.jsx

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const [aiQuiz, setAiQuiz] = useState(null);
  const [weakTopics, setWeakTopics] = useState([]);
  const [loadingQuiz, setLoadingQuiz] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  const email = localStorage.getItem('email')?.toLowerCase();
  const navigate = useNavigate();

  const fetchAll = async () => {
    try {
      const baseUrl = API;

      // Courses
      const coursesRes = await axios.get(`${baseUrl}/courses`);
      setCourses(coursesRes.data || []);

      // Progress
      if (email) {
        const progressRes = await axios.get(`${baseUrl}/users/${email}/progress`);
        setProgressData(progressRes.data || []);
      } else {
        setProgressData([]);
      }

      // (kept like your last setup) get weakTopics + a quiz preview
      if (email) {
        setLoadingQuiz(true);
        const quizRes = await axios.post(`${baseUrl}/quiz-generator/personalized`, { email });
        setAiQuiz(quizRes.data.quiz || '');
        setWeakTopics(quizRes.data.weakTopics || []);
        setLoadingQuiz(false);
      } else {
        setWeakTopics([]);
        setAiQuiz(null);
        setLoadingQuiz(false);
      }

      // Recommendations
      if (email) {
        setLoadingRecommendations(true);
        const recRes = await axios.get(`${baseUrl}/recommendations`, { params: { email } });
        setRecommendations(recRes.data || []);
        setLoadingRecommendations(false);
      } else {
        setRecommendations([]);
        setLoadingRecommendations(false);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setLoadingQuiz(false);
      setLoadingRecommendations(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // refresh when returning from the quiz
    const onFocus = () => fetchAll();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [email]);

  // Merge course + progress
  const mergedData = courses.map(course => {
    const courseProgress = progressData.find(p => p.courseId?.toString() === course._id?.toString());
    const completed = courseProgress?.completedLessons?.length || 0;
    const total = (course.sections || []).reduce((sum, s) => sum + (s.lessons?.length || 0), 0);
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { courseId: course._id, courseName: course.title, percent, completed, total };
  });

  // Top 4
  const topCourses = mergedData.sort((a, b) => b.percent - a.percent).slice(0, 4);
  while (topCourses.length < 4) topCourses.push({ courseId: '', courseName: '', percent: 0, completed: 0, total: 0 });

  // Icons
  const getCourseLogo = (title = '') => {
    const lower = title.toLowerCase();
    if (lower.includes('python')) return 'https://img.icons8.com/color/48/python.png';
    if (lower.includes('html')) return 'https://img.icons8.com/color/48/html-5.png';
    if (lower.includes('css')) return 'https://img.icons8.com/color/48/css3.png';
    if (lower.includes('javascript')) return 'https://img.icons8.com/color/48/javascript.png';
    if (lower.includes('sql')) return 'https://img.icons8.com/color/48/database.png';
    return 'https://img.icons8.com/color/48/classroom.png';
  };

  const handleCourseClick = (courseId) => { if (courseId) navigate(`/courses/${courseId}`); };

  const handleStartQuiz = () => {
    // SelfEvalQuiz fetches a fresh quiz; passing preview is harmless
    navigate('/self-eval-quiz', { state: { quiz: aiQuiz, weakTopics } });
  };

  // ----- clean, compact weak-topics text -----
  const cleanedTopics = Array.from(
    new Set(
      (weakTopics || [])
        .map(t => (t || '').trim())
        .filter(Boolean)
        .filter(t => !/^(selfeval\s*\(mixed\)|mixed)$/i.test(t)) // drop junk labels
    )
  );

  const MAX_SHOWN = 8; // show up to 8, then “+N more”
  const shown = cleanedTopics.slice(0, MAX_SHOWN);
  const moreCount = Math.max(0, cleanedTopics.length - shown.length);
  const topicsLine = shown.join(', ') + (moreCount ? `, +${moreCount} more` : '');

  return (
    <>
      <Navbar />
      <div className="home-container">
        {/* === Progress === */}
        <section className="progress-section">
          <h2>Your Progress</h2>
          <div className="progress-cards">
            {topCourses.map((course, idx) => (
              <div
                className={`home-card ${course.courseId ? '' : 'disabled'}`}
                key={idx}
                onClick={() => handleCourseClick(course.courseId)}
                style={{ cursor: course.courseId ? 'pointer' : 'not-allowed' }}
              >
                <img
                  src={course.courseId ? getCourseLogo(course.courseName) : 'https://img.icons8.com/color/48/classroom.png'}
                  alt={`${course.courseName || 'Course'} icon`}
                  className="home-card-logo"
                />
                <div className="home-card-info">
                  <p className="home-card-title">{course.courseName || '—'}</p>
                </div>
                <div className="home-card-progress-footer">
                  <div className="home-progress-bar-wrapper">
                    <div className="home-progress-bar-fill" style={{ width: `${course.percent}%` }} />
                  </div>
                  <span className="home-progress-percentage">{course.percent}% completed</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* === Personalized Quiz === */}
        <section className="self-eval-section">
          <h2>Challenge Yourself</h2>

          {loadingQuiz ? (
            <p style={{ color: '#ccc', textAlign: 'center' }}>Loading personalized quiz…</p>
          ) : cleanedTopics.length > 0 ? (
            <>
              <p style={{ color: '#ccc', marginBottom: 10, textAlign: 'center' }}>
                Based on the quizzes you have taken in past lessons, you’re currently weaker in: <strong>{topicsLine}</strong>.
              </p>
              <button className="self-eval-button" onClick={handleStartQuiz}>
                Start Personalized Quiz
              </button>
            </>
          ) : (
            <p style={{ color: '#ccc', textAlign: 'center', marginTop: '1rem' }}>
              Complete some quizzes first to unlock personalized challenges!
            </p>
          )}
        </section>

        {/* === Recommendations === */}
        <section className="recommended-section">
          <h2>Recommended For You</h2>
          {loadingRecommendations ? (
            <p style={{ color: '#ccc', textAlign: 'center' }}>Loading recommendations...</p>
          ) : (
            <>
              {recommendations.length > 0 && cleanedTopics.length > 0 && (
                <p style={{ color: '#ccc', marginBottom: 10, textAlign: 'center' }}>
                  Based on recent quizzes, we’ve added helpful videos and articles below.
                </p>
              )}

              <div className="recommendation-grid">
                {recommendations.map((rec, idx) => (
                  <div
                    className="recommendation-card"
                    key={idx}
                    onClick={() => rec.link && window.open(rec.link, '_blank')}
                    style={{ cursor: rec.link ? 'pointer' : 'not-allowed' }}
                  >
                    <img src={rec.thumbnail} alt={rec.title} className="recommendation-thumb" />
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
            </>
          )}
        </section>
      </div>
    </>
  );
};

export default Home;
