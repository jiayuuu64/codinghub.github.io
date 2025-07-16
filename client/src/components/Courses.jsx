import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import '../styles/Courses.css';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const email = localStorage.getItem('email');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL;

        // Fetch courses
        const courseRes = await axios.get(`${baseUrl.replace('/users', '')}/courses`);
        setCourses(courseRes.data);

        // Fetch user progress
        if (email) {
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
  }, [email]);

  const mergedData = courses.map(course => {
    const courseProgress = progressData.find(p =>
      p.courseId.toString() === course._id.toString()
    );

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

  const handleCourseClick = (courseId) => {
    if (courseId) navigate(`/courses/${courseId}`);
  };

  const getCourseLogo = (title) => {
    const lower = title.toLowerCase();
    if (lower.includes('python')) {
      return 'https://img.icons8.com/color/48/python.png';
    } else if (lower.includes('html')) {
      return 'https://img.icons8.com/color/48/html-5.png';
    } else if (lower.includes('javascript')) {
      return 'https://img.icons8.com/color/48/javascript.png';
    } else {
      return 'https://img.icons8.com/color/48/classroom.png';
    }
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
                  <p className="course-card-description"><em>{courses[idx]?.description}</em></p>

                  {/* Progress Bar */}
                  <div className="progress-container">
                    <div className="progress-bar-wrapper">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${course.percent}%` }}
                      ></div>
                    </div>
                    <p className="progress-percentage">{course.percent}% completed</p>
                  </div>
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
