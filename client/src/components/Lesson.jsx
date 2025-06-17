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
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnsweredCorrectly, setIsAnsweredCorrectly] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const courseId = queryParams.get('courseId');
  const email = localStorage.getItem('email');

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await axios.get(`https://codinghub-r3bn.onrender.com/api/lessons/${lessonId}`);
        setLesson(res.data);
        setCurrentStepIndex(0);
        setSelectedOption(null);
        setIsAnsweredCorrectly(false);
      } catch (err) {
        console.error('Failed to fetch lesson:', err);
      }
    };
    fetchLesson();
  }, [lessonId]);

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnsweredCorrectly(false);
    if (currentStepIndex < lesson.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleBack = () => {
    setSelectedOption(null);
    setIsAnsweredCorrectly(false);
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setIsAnsweredCorrectly(option === lesson.steps[currentStepIndex].answer);
  };

  const handleFinishLesson = async () => {
    if (!email) {
      console.error("Email not found in localStorage.");
      alert("Please log in again.");
      navigate('/login');
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/progress/${courseId}/complete-lesson?email=${encodeURIComponent(email)}`,
        { lessonId }
      );
      navigate(`/courses/${courseId}`);
    } catch (err) {
      console.error('Failed to mark lesson as complete:', err);
      alert('Error: Could not mark lesson as complete. Please try again.');
    }
  };

  if (!lesson) {
    return <div className="lesson-fullscreen"><p>Loading lesson...</p></div>;
  }

  const currentStep = lesson.steps[currentStepIndex];

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
        {(() => {
          switch (currentStep.type) {
            case 'text':
              return <p className="lesson-step-text">{currentStep.text}</p>; // ✅ FIXED LINE
            case 'code':
              return <pre className="lesson-step-code"><code>{currentStep.content}</code></pre>;
            case 'video':
              return currentStep.content.includes('youtube.com') ? (
                <iframe
                  className="lesson-step-video"
                  src={currentStep.content}
                  title="YouTube video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <video controls className="lesson-step-video">
                  <source src={currentStep.content} type="video/mp4" />
                </video>
              );
            case 'text-video':
              return (
                <div className="lesson-step-text-video">
                  {currentStep.content.includes('youtube.com') ? (
                    <iframe
                      className="lesson-step-video"
                      src={currentStep.content}
                      title="YouTube video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <video controls className="lesson-step-video">
                      <source src={currentStep.content} type="video/mp4" />
                    </video>
                  )}
                  <p className="lesson-step-text" style={{ marginTop: '1rem' }}>{currentStep.text}</p>
                </div>
              );
            case 'text-code':
              return (
                <div className="lesson-step-text-code">
                  <p className="lesson-step-text">{currentStep.text}</p>
                  <pre className="lesson-step-code"><code>{currentStep.content}</code></pre>
                </div>
              );
            case 'quiz':
              return (
                <div className="lesson-step-quiz">
                  <h3 className="quiz-question">{currentStep.question}</h3>
                  <ul className="quiz-options">
                    {currentStep.options.map((option, idx) => (
                      <li
                        key={idx}
                        className={`quiz-option ${selectedOption === option ? (isAnsweredCorrectly ? 'correct' : 'incorrect') : ''}`}
                        onClick={() => !isAnsweredCorrectly && handleOptionSelect(option)}
                        tabIndex={0}
                        role="button"
                      >
                        <span className="option-text">{option}</span>
                        {selectedOption === option && isAnsweredCorrectly && <span className="option-feedback">✓</span>}
                        {selectedOption === option && !isAnsweredCorrectly && <span className="option-feedback">✗</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            default:
              return <p>Unknown step type: {currentStep.type}</p>;
          }
        })()}
      </div>

      <div className="lesson-bottom-bar">
        <button
          className="lesson-nav-button"
          onClick={handleBack}
          disabled={currentStepIndex === 0}
        >
          ← Back
        </button>
        {currentStepIndex < lesson.steps.length - 1 ? (
          <button
            className="lesson-nav-button"
            onClick={handleNext}
            disabled={currentStep.type === 'quiz' && !isAnsweredCorrectly}
          >
            Next →
          </button>
        ) : (
          <button
            className="lesson-nav-button finish-button"
            onClick={handleFinishLesson}
            disabled={currentStep.type === 'quiz' && !isAnsweredCorrectly}
          >
            Finish
          </button>
        )}
      </div>
    </div>
  );
};

export default Lesson;