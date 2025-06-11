import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import '../styles/Courses.css';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [progressData, setProgressData] = useState({});
  const navigate = useNavigate();
  const email = localStorage.getItem('email');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get('https://codinghub-r3bn.onrender.com/api/courses');
        setCourses(res.data);
      } catch (err) {
        console.error('❌ Error fetching courses:', err);
      }
    };

    const fetchProgressData = async () => {
      try {
        if (!email) return;
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/${email}/progress`);
        const progressMap = {};
        res.data.forEach(item => {
          progressMap[item.courseId] = item.completedLessons;
        });
        setProgressData(progressMap);
      } catch (err) {
        console.error('❌ Error fetching progress:', err);
      }
    };

    fetchCourses();
    fetchProgressData();
  }, [email]);

  const calculateCourseProgress = (course) => {
    let totalLessons = 0;
    course.sections.forEach(section => {
      totalLessons += section.lessons.length;
    });
    const completedLessons = progressData[course._id]?.length || 0;
    if (totalLessons === 0) return 0;
    return Math.round((completedLessons / totalLessons) * 100);
  };

  return (
    <>
      <Navbar />
      <div className="courses-container">
        <h2 className="courses-heading">All Courses</h2>
        <div className="course-cards">
          {courses.map((course) => {
            const progressPercentage = calculateCourseProgress(course);
            return (
              <div
                className="course-card-catalog"
                key={course._id}
                onClick={() => navigate(`/courses/${course._id}`)}
              >
                <img
                  src="https://img.icons8.com/color/48/python.png"
                  alt="course logo"
                  className="course-card-logo"
                />
                <div className="course-card-info">
                  <p className="course-card-title">{course.title}</p>
                  <p className="course-card-description"><em>{course.description}</em></p>

                  {/* Progress Bar */}
                  <div className="progress-container">
                    <div className="progress-bar-wrapper">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                    <p className="progress-percentage">{progressPercentage}% completed</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Courses;
