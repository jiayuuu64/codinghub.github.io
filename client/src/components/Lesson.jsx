import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; 
import axios from 'axios'; 
import FinalQuiz from './FinalQuiz'; 
import '../styles/Lesson.css'; 
import { toYouTubeEmbed } from '../utils/media';


const Lesson = () => {
  const { lessonId } = useParams(); // Extract lesson ID from URL
  const location = useLocation(); // Get current location to extract query parameters
  const navigate = useNavigate(); // Hook for navigating between routes
  const [lesson, setLesson] = useState(null); // State to store lesson content
  const [currentStepIndex, setCurrentStepIndex] = useState(0); // Current lesson step index
  const [selectedOption, setSelectedOption] = useState(null); // Selected answer option for quizzes
  const [isAnsweredCorrectly, setIsAnsweredCorrectly] = useState(false); // Whether selected answer is correct
  const [userAnswers, setUserAnswers] = useState({}); // Stores all user answers for quizzes
  const [courseTitle, setCourseTitle] = useState(''); // Title of the course for FinalQuiz

  const queryParams = new URLSearchParams(location.search); // Parse query string
  const courseId = queryParams.get('courseId'); // Extract courseId from query params
  const email = localStorage.getItem('email'); // Get user email from localStorage

  useEffect(() => {
    // Fetch lesson data from backend
    const fetchLesson = async () => {
      try {
        const res = await axios.get(`https://codinghub-r3bn.onrender.com/api/lessons/${lessonId}`);
        setLesson(res.data); // Set the fetched lesson
        setCurrentStepIndex(0); // Reset to first step
        setSelectedOption(null);
        setIsAnsweredCorrectly(false);
      } catch (err) {
        console.error('Failed to fetch lesson:', err);
      }
    };

    // Fetch course title for FinalQuiz component
    const fetchCourse = async () => {
      try {
        const res = await axios.get(`https://codinghub-r3bn.onrender.com/api/courses/${courseId}`);
        setCourseTitle(res.data.title);
      } catch (err) {
        console.error('Failed to fetch course title:', err);
      }
    };

    fetchLesson(); // Trigger on mount
    fetchCourse(); // Trigger on mount
  }, [lessonId, courseId]);

  // Go to next step
  const handleNext = () => {
    setSelectedOption(null);
    setIsAnsweredCorrectly(false);
    if (currentStepIndex < lesson.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  // Go to previous step
  const handleBack = () => {
    setSelectedOption(null);
    setIsAnsweredCorrectly(false);
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  // When user selects a quiz option
  const handleOptionSelect = async (option) => {
    setSelectedOption(option);
    const isCorrect = option === currentStep.answer;
    setIsAnsweredCorrectly(isCorrect);

    const topic = currentStep.topic || "Unknown";
    const email = localStorage.getItem('email');

    try {
      await fetch('https://codinghub-r3bn.onrender.com/api/quiz-history/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          topic,
          score: isCorrect ? 1 : 0,
          total: 1
        }),
      });
    } catch (err) {
      console.error('❌ Failed to save quiz history:', err);
    }
  };

  // When user finishes a lesson
  const handleFinishLesson = async () => {
    if (!email) {
      alert("Please log in again.");
      navigate('/login');
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/progress/${courseId}/complete-lesson?email=${encodeURIComponent(email)}`,
        { lessonId }
      );
      navigate(`/courses/${courseId}`); // Go back to course overview
    } catch (err) {
      alert('Could not mark lesson as complete. Try again.');
    }
  };

  // If lesson hasn't loaded yet
  if (!lesson) return <div className="lesson-fullscreen"><p>Loading lesson...</p></div>;

  const currentStep = lesson.steps[currentStepIndex]; // Get current step
  const isSummaryQuiz = lesson.title === 'Final Quiz' || lesson.title === 'Summary Quiz'; // Check if it's a quiz

  return (
    <div className="lesson-fullscreen">
      {/* Top bar with exit and progress bar */}
      <div className="lesson-top-bar">
        <button className="lesson-exit-button" onClick={() => navigate(`/courses/${courseId}`)}>✕ Exit</button>
        <div className="lesson-progress-bar-wrapper">
          <div className="lesson-progress-bar">
            {lesson.steps.map((_, index) => {
              const isActive = isSummaryQuiz ? !!userAnswers[index] : index <= currentStepIndex;
              return (
                <div key={index} className={`lesson-progress-step ${isActive ? 'active' : ''}`}></div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step content area */}
      <div className="lesson-step-container">
        {(() => {
          if (isSummaryQuiz) {
            return (
              <FinalQuiz
                questions={lesson.steps}
                onFinish={handleFinishLesson}
                userAnswers={userAnswers}
                setUserAnswers={setUserAnswers}
                courseTitle={courseTitle}
              />
            );
          }

          // Render different types of content based on step type
          switch (currentStep.type) {
            case 'text':
              return (
                <div>
                  <p className="lesson-step-text">{currentStep.text}</p>
                </div>
              );
            case 'code':
              return (
                <pre className="lesson-step-code">
                  <code>{currentStep.content}</code>
                </pre>
              );
            case 'video': {
              const embed = toYouTubeEmbed(currentStep.content);
              return embed ? (
                  <iframe
                    className="lesson-step-video"
                    src={embed}
                    title="YouTube video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                ) : (
                  <video controls className="lesson-step-video">
                    <source src={currentStep.content} type="video/mp4" />
                  </video>
                );
              }
            case 'text-video': {
              const embed = toYouTubeEmbed(currentStep.content);
              return (
                <div className="lesson-step-text-video">
                  {embed ? (
                    <iframe
                      className="lesson-step-video"
                      src={embed}
                      title="YouTube video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  ) : (
                    <video controls className="lesson-step-video">
                      <source src={currentStep.content} type="video/mp4" />
                    </video>
                  )}
                  <p className="lesson-step-text" style={{ marginTop: '1rem' }}>{currentStep.text}</p>
                </div>
              ); }
            case 'text-code':
              return (
                <div className="lesson-step-text-code">
                  <p className="lesson-step-text">{currentStep.text}</p>
                  <div className="code-preview-wrapper">
                    <pre className="lesson-step-code">
                      <code>{currentStep.content}</code>
                    </pre>
                    {currentStep.language === 'html' && (
                      <iframe
                        srcDoc={`<body style="color:white; background-color:#1b1f3a; margin:0; padding:1rem;">${currentStep.content}</body>`}
                        title="Live HTML Preview"
                      />
                    )}
                  </div>
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
                        className={`quiz-option ${selectedOption === option
                          ? isAnsweredCorrectly
                            ? 'correct'
                            : 'incorrect'
                          : ''
                          }`}
                        onClick={() => !isAnsweredCorrectly && handleOptionSelect(option)}
                        tabIndex={0}
                        role="button"
                      >
                        <span className="option-text">{option}</span>
                        <div className="option-right">
                          {selectedOption === option && isAnsweredCorrectly && <span className="option-feedback">✓</span>}
                          {selectedOption === option && !isAnsweredCorrectly && <span className="option-feedback">✗</span>}
                        </div>
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

      {/* Bottom nav bar */}
      {!isSummaryQuiz && (
        <div className="lesson-bottom-bar">
          <button className="lesson-nav-button" onClick={handleBack} disabled={currentStepIndex === 0}>← Back</button>
          {currentStepIndex < lesson.steps.length - 1 ? (
            <button className="lesson-nav-button" onClick={handleNext} disabled={currentStep.type === 'quiz' && !isAnsweredCorrectly}>Next →</button>
          ) : (
            <button className="lesson-nav-button finish-button" onClick={handleFinishLesson} disabled={currentStep.type === 'quiz' && !isAnsweredCorrectly}>Finish</button>
          )}
        </div>
      )}
    </div>
  );
};

export default Lesson;