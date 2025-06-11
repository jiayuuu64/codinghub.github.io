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
  const [attemptCount, setAttemptCount] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const courseId = queryParams.get('courseId');

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await axios.get(`https://codinghub-r3bn.onrender.com/api/lessons/${lessonId}`);
        setLesson(res.data);
        setCurrentStepIndex(0);
        resetQuizState();
      } catch (err) {
        console.error('Failed to fetch lesson:', err);
      }
    };
    fetchLesson();
  }, [lessonId]);

  const resetQuizState = () => {
    setSelectedOption(null);
    setIsAnsweredCorrectly(false);
    setAttemptCount(0);
    setShowExplanation(false);
  };

  if (!lesson) {
    return <div className="lesson-fullscreen"><p>Loading lesson...</p></div>;
  }

  const currentStep = lesson.steps[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < lesson.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      resetQuizState();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      resetQuizState();
    }
  };

  const handleOptionSelect = (option) => {
    if (isAnsweredCorrectly || showExplanation) return;

    setSelectedOption(option);
    if (option === currentStep.answer) {
      setIsAnsweredCorrectly(true);
    } else {
      const newAttempts = attemptCount + 1;
      setAttemptCount(newAttempts);
      if (newAttempts >= 2) {
        setShowExplanation(true);
      }
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

      case 'text-code':
        return (
          <div className="lesson-step-text-code">
            <p className="lesson-step-text">{step.text}</p>
            <pre className="lesson-step-code"><code>{step.content}</code></pre>
          </div>
        );

      case 'quiz':
        if (!step.options || !Array.isArray(step.options)) {
          return (
            <div className="lesson-step-quiz">
              <h3>{step.question || "⚠️ Missing question"}</h3>
              <p style={{ color: 'red' }}>⚠️ This quiz is missing its options array.</p>
            </div>
          );
        }

        return (
          <div className="lesson-step-quiz">
            <h3 className="quiz-question">{step.question}</h3>
            <ul className="quiz-options">
              {step.options.map((option, idx) => (
                <li
                  key={idx}
                  className={`quiz-option ${
                    selectedOption === option
                      ? isAnsweredCorrectly
                        ? 'correct'
                        : 'incorrect'
                      : ''
                  }`}
                  onClick={() => handleOptionSelect(option)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !isAnsweredCorrectly && !showExplanation) {
                      handleOptionSelect(option);
                    }
                  }}
                >
                  <span className="option-text">{option}</span>
                  {selectedOption === option && isAnsweredCorrectly && (
                    <span className="option-feedback">✓</span>
                  )}
                  {selectedOption === option && !isAnsweredCorrectly && (
                    <span className="option-feedback">✗</span>
                  )}
                </li>
              ))}
            </ul>
            {isAnsweredCorrectly && <p className="quiz-feedback-correct">✅ Correct!</p>}
            {showExplanation && (
              <div className="quiz-feedback-explanation">
                <p>❌ You've used all attempts.</p>
                <p><strong>Correct answer:</strong> {step.answer}</p>
                {step.explanation && <p>{step.explanation}</p>}
              </div>
            )}
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
          disabled={
            (currentStep.type === 'quiz' && !isAnsweredCorrectly && !showExplanation) ||
            currentStepIndex === lesson.steps.length - 1
          }
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default Lesson;