import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/finalquiz.css'; // Use same styling as FinalQuiz

const SelfEvalQuiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const quizData = location.state?.quiz;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!quizData) {
      navigate('/self-evaluation');
    }
  }, [quizData, navigate]);

  if (!quizData) return null;

  const currentQn = quizData[currentIndex];

  const handleOptionClick = (option) => {
    setUserAnswers((prev) => ({ ...prev, [currentIndex]: option }));
  };

  const handleNext = () => {
    if (currentIndex < quizData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = () => {
    const unanswered = quizData.length - Object.keys(userAnswers).length;
    const confirmSubmit = window.confirm(`You left ${unanswered} question(s) blank. Do you want to submit?`);
    if (!confirmSubmit) return;

    const correctCount = quizData.filter((q, i) => userAnswers[i] === q.answer).length;
    setScore(correctCount);
    setShowResults(true);
  };

  const handleExit = () => navigate('/self-evaluation');

  return (
    <div className="final-quiz-container">
      {!showResults ? (
        <>
          <div className="lesson-top-bar">
            <button className="lesson-exit-button" onClick={handleExit}>
              ✕ Exit
            </button>
            <div className="lesson-progress-bar-wrapper">
              <div className="lesson-progress-bar">
                {quizData.map((_, index) => (
                  <div
                    key={index}
                    className={`lesson-progress-step ${userAnswers[index] ? 'active' : ''}`}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          <div className="final-quiz-question-block">
            <h3 className="quiz-question">{currentQn.question}</h3>

            <ul className="final-quiz-options">
              {currentQn.options.map((opt, i) => (
                <li
                  key={i}
                  className={`final-quiz-option ${userAnswers[currentIndex] === opt ? 'selected' : ''}`}
                  onClick={() => handleOptionClick(opt)}
                >
                  {opt}
                </li>
              ))}
            </ul>

            <div className="final-quiz-nav">
              <button onClick={handleBack} disabled={currentIndex === 0}>← Back</button>
              {currentIndex < quizData.length - 1 ? (
                <button onClick={handleNext}>Next →</button>
              ) : (
                <button onClick={handleSubmit}>Submit</button>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="lesson-step-container">
          <div className="lesson-step-quiz">
            <h3>Your Score: {score}/{quizData.length}</h3>

            <div className="final-quiz-actions" style={{ marginBottom: '1rem' }}>
              <button onClick={() => setShowAll(false)} className={!showAll ? 'active-toggle' : ''}>
                Show Only Wrong
              </button>
              <button onClick={() => setShowAll(true)} className={showAll ? 'active-toggle' : ''}>
                Show All
              </button>
            </div>

            {quizData.map((q, i) => {
              const userAnswer = userAnswers[i];
              const isCorrect = userAnswer === q.answer;
              if (!showAll && isCorrect) return null;

              return (
                <div key={i} className="final-quiz-result-item" style={{ marginBottom: '1rem' }}>
                  <p><strong>Q{i + 1}:</strong> {q.question}</p>
                  <p>Your Answer: {userAnswer || "Not answered"}</p>
                  <p>Correct Answer: {q.answer}</p>
                  <p>Explanation: {q.explanation}</p>
                  <hr style={{ margin: '1rem 0' }} />
                </div>
              );
            })}

            <div className="lesson-bottom-bar" style={{ marginTop: '1rem' }}>
              <button className="lesson-nav-button" onClick={() => window.location.reload()}>
                Try Again
              </button>
              <button className="lesson-nav-button finish-button" onClick={handleExit}>
                Finish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelfEvalQuiz;