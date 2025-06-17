import React, { useState } from 'react';
import '../styles/Lesson.css';

const SelfEvalQuiz = ({ quizData, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = quizData[currentIndex];

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setIsCorrect(option === currentQuestion.answer);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentIndex < quizData.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsCorrect(null);
      setShowExplanation(false);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedOption(null);
      setIsCorrect(null);
      setShowExplanation(false);
    }
  };

  return (
    <div className="lesson-fullscreen">
      <div className="lesson-top-bar">
        <button className="lesson-exit-button" onClick={onBack}>
          ✕ Exit
        </button>
        <div className="lesson-progress-bar-wrapper">
          <div className="lesson-progress-bar">
            {quizData.map((_, index) => (
              <div
                key={index}
                className={`lesson-progress-step ${index <= currentIndex ? 'active' : ''}`}
              ></div>
            ))}
          </div>
        </div>
      </div>

      <div className="lesson-step-container">
        <div className="lesson-step-quiz">
          <h3 className="quiz-question">{currentQuestion.question}</h3>
          <ul className="quiz-options">
            {currentQuestion.options.map((option, idx) => (
              <li
                key={idx}
                className={`quiz-option ${
                  selectedOption === option
                    ? isCorrect
                      ? 'correct'
                      : 'incorrect'
                    : ''
                }`}
                onClick={() => selectedOption === null && handleOptionClick(option)}
              >
                <span className="option-text">{option}</span>
                {selectedOption === option && (
                  <span className="option-feedback">
                    {isCorrect ? '✓' : '✗'}
                  </span>
                )}
              </li>
            ))}
          </ul>
          {showExplanation && (
            <p className="lesson-step-text">Explanation: {currentQuestion.explanation}</p>
          )}
        </div>
      </div>

      <div className="lesson-bottom-bar">
        <button
          className="lesson-nav-button"
          onClick={handleBack}
          disabled={currentIndex === 0}
        >
          ← Back
        </button>
        {currentIndex < quizData.length - 1 ? (
          <button
            className="lesson-nav-button"
            onClick={handleNext}
            disabled={selectedOption === null}
          >
            Next →
          </button>
        ) : (
          <button
            className="lesson-nav-button finish-button"
            onClick={onBack}
          >
            Finish
          </button>
        )}
      </div>
    </div>
  );
};

export default SelfEvalQuiz;