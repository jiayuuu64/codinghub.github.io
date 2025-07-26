import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import '../styles/Courses.css';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const navigate = useNavigate();

  const email = localStorage.getItem('email');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL;

        // Fetch courses
        const courseRes = await axios.get(`${baseUrl.replace('/users', '')}/courses`);
        setCourses(courseRes.data);

        // Only fetch progress if student
        if (!isAdmin && email) {
          const progressRes = await axios.get(`${baseUrl}/${email}/progress`);
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

    const courseProgress = progressData.find(p =>
      p.courseId.toString() === course._id.toString()
    );
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

  const handleCourseClick = (courseId) => {
    if (!isAdmin && courseId) {
      navigate(`/courses/${courseId}`);
    } else {
      setExpandedCourse(expandedCourse === courseId ? null : courseId);
    }
  };

  const getCourseLogo = (title) => {
    const lower = title.toLowerCase();
    if (lower.includes('python')) return 'https://img.icons8.com/color/48/python.png';
    if (lower.includes('html')) return 'https://img.icons8.com/color/48/html-5.png';
    if (lower.includes('javascript')) return 'https://img.icons8.com/color/48/javascript.png';
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
            {mergedData.map((course, idx) => (
              <div
                className="course-card-catalog"
                key={course.courseId}
                onClick={() => handleCourseClick(course.courseId)}
              >
                <img
                  src={getCourseLogo(course.courseName)}
                  alt="course logo"
                  className="course-card-logo"
                />
                <div className="course-card-info">
                  <p className="course-card-title">{course.courseName}</p>
                  <p className="course-card-description"><em>{course.description}</em></p>

                  {/* Student Progress Bar */}
                  {!isAdmin && (
                    <div className="progress-container">
                      <div className="progress-bar-wrapper">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${course.percent}%` }}
                        ></div>
                      </div>
                      <p className="progress-percentage">{course.percent}% completed</p>
                    </div>
                  )}

                  {/* Admin Section Preview */}
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

                  {/* Toggle Preview for Admin */}
                  {isAdmin && (
                    <p className="admin-preview-toggle">
                      {expandedCourse === course.courseId ? '🔼 Collapse Preview' : '🔽 Expand Preview'}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Courses;