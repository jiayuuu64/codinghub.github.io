import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import '../styles/Courses.css'; // Make sure this path is correct

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('https://codinghub-r3bn.onrender.com/api/courses')
      .then(res => setCourses(res.data))
      .catch(err => console.error('❌ Error fetching courses:', err));
  }, []);

  return (
    <>
      <Navbar />
      <div className="courses-container">
        <h2 className="courses-heading">All Courses</h2>
        <div className="course-cards">
          {courses.map((course) => (
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Courses;