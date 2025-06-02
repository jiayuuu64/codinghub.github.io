// src/components/Lesson.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/Lesson.css';

const Lesson = () => {
  const { lessonId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const queryParams = new URLSearchParams(location.search);
  const courseId = queryParams.get('courseId');

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await axios.get(`https://codinghub-r3bn.onrender.com/api/lessons/${lessonId}`);
        setLesson(res.data);
      } catch (err) {
        console.error('Failed to fetch lesson:', err);
      }
    };
    fetchLesson();
  }, [lessonId]);

  if (!lesson) {
    return <div className="lesson-fullscreen"><p>Loading lesson...</p></div>;
  }

  const currentStep = lesson.steps[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < lesson.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const renderStepContent = (step) => {
    switch (step.type) {
      case 'text':
        return <p className="lesson-step-text">{step.content}</p>;
      case 'code':
        return <pre className="lesson-step-code"><code>{step.content}</code></pre>;
      case 'video':
        return step.content.includes('youtube.com') ? (
          <iframe
            className="lesson-step-video"
            src={step.content}
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <video controls className="lesson-step-video">
            <source src={step.content} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        );
      case 'quiz':
        return <div className="lesson-step-quiz">[Quiz goes here]</div>;
      case 'text-video':
        return (
          <div className="lesson-step-text-video">
            {step.content.includes('youtube.com') ? (
              <iframe
                className="lesson-step-video"
                src={step.content}
                title="YouTube video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <video controls className="lesson-step-video">
                <source src={step.content} type="video/mp4" />
              </video>
            )}
            <p className="lesson-step-text" style={{ marginTop: '1rem' }}>{step.text}</p>
          </div>
        );
      default:
        return <p>Unknown step type: {step.type}</p>;
    }
  };

  return (
    <div className="lesson-fullscreen">
      <div className="lesson-top-bar">
        <button
          className="lesson-exit-button"
          onClick={() => navigate(`/courses/${courseId}`)}
        >
          ✕ Exit
        </button>
        <div className="lesson-progress-bar-wrapper">
          <div className="lesson-progress-bar">
            {lesson.steps.map((_, index) => (
              <div
                key={index}
                className={`lesson-progress-step ${index <= currentStepIndex ? 'active' : ''}`}
              ></div>
            ))}
          </div>
        </div>
      </div>

      <div className="lesson-step-container">
        {renderStepContent(currentStep)}
      </div>

      <div className="lesson-bottom-bar">
        <button
          className="lesson-nav-button"
          onClick={handleBack}
          disabled={currentStepIndex === 0}
        >
          ← Back
        </button>
        <button
          className="lesson-nav-button"
          onClick={handleNext}
          disabled={currentStepIndex === lesson.steps.length - 1}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default Lesson;