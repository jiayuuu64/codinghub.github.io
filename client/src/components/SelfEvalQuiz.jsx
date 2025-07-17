import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/finalquiz.css';
import { speakText } from '../utils/textToSpeech';

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
    if (!quizData) navigate('/self-evaluation');
  }, [quizData, navigate]);

  const currentQn = quizData?.[currentIndex];

  useEffect(() => {
    if (!showResults && quizData) {
      speakText(currentQn.question);
    }
  }, [currentIndex, showResults, quizData]);

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

  const downloadResults = () => {
    const lines = [`Self Evaluation Score: ${score}/${quizData.length}\n`];
    quizData.forEach((q, i) => {
      const userAns = userAnswers[i] || "Not answered";
      lines.push(`Q${i + 1}: ${q.question}`);
      lines.push(`Your Answer: ${userAns}`);
      lines.push(`Correct Answer: ${q.answer}`);
      lines.push(`Explanation: ${q.explanation}\n`);
    });

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'self-eval-results.txt';
    link.click();
  };

  if (!quizData) return null;

  return (
    <div className="lesson-fullscreen">
      <div className="lesson-top-bar">
        <button className="lesson-exit-button" onClick={handleExit}>✕ Exit</button>
        <div className="lesson-progress-bar-wrapper">
          <div className="lesson-progress-bar">
            {quizData.map((_, index) => {
              let stepClass = '';
              if (userAnswers[index]) {
                stepClass = 'answered';
              } else if (showResults) {
                stepClass = 'skipped';
              } else {
                stepClass = 'not-visited';
              }
              return (
                <div key={index} className={`lesson-progress-step ${stepClass}`}></div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="f-quiz-container">
        {!showResults ? (
          <div className="f-quiz-block">
            <h2 className="f-quiz-title">Self Evaluation Quiz</h2>
            <h3 className="f-quiz-question">{currentQn.question}</h3>

            <ul className="f-quiz-options">
              {currentQn.options.map((opt, i) => (
                <li
                  key={i}
                  className={`f-quiz-option ${userAnswers[currentIndex] === opt ? 'selected' : ''}`}
                  onClick={() => handleOptionClick(opt)}
                >
                  {opt}
                </li>
              ))}
            </ul>

            <div className="f-quiz-nav">
              <button onClick={handleBack} disabled={currentIndex === 0}>← Back</button>
              {currentIndex < quizData.length - 1 ? (
                <button onClick={handleNext}>Next →</button>
              ) : (
                <button onClick={handleSubmit}>Submit</button>
              )}
            </div>
          </div>
        ) : (
          <div className="f-quiz-results">
            <h3 style={{ textAlign: 'center' }}>Your Score: {score}/{quizData.length}</h3>

            <div className="f-quiz-actions" style={{ marginBottom: '1rem' }}>
              <button onClick={() => setShowAll(false)} className={!showAll ? 'active-toggle' : ''}>
                Show Only Wrong
              </button>
              <button onClick={() => setShowAll(true)} className={showAll ? 'active-toggle' : ''}>
                Show All
              </button>
              <button onClick={downloadResults}>Download Results</button>
            </div>

            {quizData.map((q, i) => {
              const userAnswer = userAnswers[i];
              const isCorrect = userAnswer === q.answer;
              if (!showAll && isCorrect) return null;

              return (
                <div key={i} className="f-quiz-result-item">
                  <p><strong>Q{i + 1}:</strong> {q.question}</p>
                  {q.options.map((opt, j) => {
                    const isAnswer = opt === q.answer;
                    const isSelected = userAnswer === opt;
                    const shouldColor = true;

                    return (
                      <div
                        key={j}
                        className={`f-quiz-option ${shouldColor
                          ? isAnswer
                            ? 'correct'
                            : isSelected
                              ? 'incorrect'
                              : ''
                          : ''
                          } ${isSelected ? 'selected' : ''}`}
                      >
                        {opt}
                        {shouldColor && isAnswer && <span className="tick">✓</span>}
                        {shouldColor && isSelected && !isAnswer && <span className="cross">✗</span>}
                      </div>
                    );
                  })}
                  <div className="f-quiz-explanation">
                    <strong>Explanation:</strong> {q.explanation}
                    <button onClick={() => speakText(q.explanation)} style={{ marginLeft: '10px' }}>🔊</button>
                  </div>
                </div>
              );
            })}

            <div className="f-quiz-actions">
              <button onClick={() => window.location.reload()}>Try Again</button>
              <button onClick={handleExit}>Finish</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelfEvalQuiz;
