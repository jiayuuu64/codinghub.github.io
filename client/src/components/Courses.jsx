import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import confetti from 'canvas-confetti';
import '../styles/Courses.css';

const API = 'https://codinghub-r3bn.onrender.com/api';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const navigate = useNavigate();

  const email = localStorage.getItem('email')?.toLowerCase();
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const courseRes = await axios.get(`${API}/courses`);
        setCourses(courseRes.data);

        if (!isAdmin && email) {
          const progressRes = await axios.get(`${API}/users/${encodeURIComponent(email)}/progress`);
          setProgressData(progressRes.data || []);
        }

        setLoading(false);
      } catch (err) {
        console.error('❌ Error fetching data:', err);
        setLoading(false);
      }
    };

    fetchAll();
  }, [email, isAdmin]);

  const mergedData = courses.map(course => {
    if (isAdmin) {
      return {
        courseId: course._id,
        courseName: course.title,
        description: course.description,
        sections: course.sections
      };
    }

    const courseProgress = progressData.find(p => String(p.courseId) === String(course._id));
    const completed = courseProgress?.completedLessons?.length || 0;
    const total = course.sections.reduce((sum, section) => sum + section.lessons.length, 0);
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      courseId: course._id,
      courseName: course.title,
      description: course.description,
      percent,
      completed,
      total,
      sections: course.sections
    };
  });

  useEffect(() => {
    if (!isAdmin && progressData.length > 0) {
      const shownConfettiCourses = JSON.parse(localStorage.getItem('confettiShown') || '[]');
      const newlyCompleted = mergedData.find(
        c => c.percent === 100 && !shownConfettiCourses.includes(c.courseId)
      );
      if (newlyCompleted) {
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
        const updated = [...shownConfettiCourses, newlyCompleted.courseId];
        localStorage.setItem('confettiShown', JSON.stringify(updated));
      }
    }
  }, [progressData]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCourseClick = (courseId) => {
    if (!isAdmin && courseId) {
      navigate(`/courses/${courseId}`);
    } else {
      setExpandedCourse(expandedCourse === courseId ? null : courseId);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      try {
        await axios.delete(`${API}/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        alert('✅ Course deleted successfully!');
        setCourses(prev => prev.filter(course => course._id !== courseId));
      } catch (err) {
        alert('❌ Failed to delete course: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  const getCourseLogo = (title = '') => {
    const lower = title.toLowerCase();
    if (lower.includes('python')) return 'https://img.icons8.com/color/48/python.png';
    if (lower.includes('html')) return 'https://img.icons8.com/color/48/html-5.png';
    if (lower.includes('css')) return 'https://img.icons8.com/color/48/css3.png';
    if (lower.includes('javascript')) return 'https://img.icons8.com/color/48/javascript.png';
    if (lower.includes('sql')) return 'https://img.icons8.com/color/48/database.png';
    return 'https://img.icons8.com/color/48/classroom.png';
  };

  return (
    <>
      <Navbar />
      <div className="courses-container">
        <h2 className="courses-heading">All Courses</h2>

        {loading ? (
          <p style={{ color: 'white', textAlign: 'center' }}>Loading courses...</p>
        ) : (
          <div className="course-cards">
            {mergedData.map(course => (
              <div
                className="course-card-catalog"
                key={course.courseId || Math.random()}
                onClick={() => handleCourseClick(course.courseId)}
              >
                {/* Main content */}
                <img
                  src={getCourseLogo(course.courseName)}
                  alt="course logo"
                  className="course-card-logo"
                />

                <div className="course-card-info" style={{ flex: 1, minWidth: 0 }}>
                  <p className="course-card-title">{course.courseName}</p>
                  <p className="course-card-description"><em>{course.description}</em></p>

                  {/* Admin-only preview + delete */}
                  {isAdmin && expandedCourse === course.courseId && (
                    <div className="admin-preview">
                      {course.sections?.map((section, sIdx) => (
                        <div key={sIdx} className="admin-section">
                          <p><strong>Section:</strong> {section.title}</p>
                          <ul>
                            {section.lessons.map((lesson, lIdx) => (
                              <li key={lIdx}>{lesson.title}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {isAdmin && (
                    <>
                      <p className="admin-preview-toggle">
                        {expandedCourse === course.courseId ? '🔼 Collapse Preview' : '🔽 Expand Preview'}
                      </p>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course.courseId); }}
                        className="delete-button"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>

                {/* Footer: full-width bar on top, label below (aligned) */}
                {!isAdmin && (
                  <div className="card-progress-footer">
                    <div className="progress-bar-wrapper">
                      <div className="progress-bar-fill" style={{ width: `${course.percent}%` }} />
                    </div>
                    <span className="progress-percentage">{course.percent}% completed</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Courses;
