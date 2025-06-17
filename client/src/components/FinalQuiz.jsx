import React, { useState } from 'react';
import '../styles/finalquiz.css';

const FinalQuiz = ({ questions, onFinish, userAnswers, setUserAnswers }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const handleOptionClick = (option) => {
    setUserAnswers((prev) => ({ ...prev, [currentIndex]: option }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = () => {
    const unanswered = questions.length - Object.keys(userAnswers).length;
    const confirmSubmit = window.confirm(
      `You left ${unanswered} question(s) blank. Do you want to submit?`
    );
    if (confirmSubmit) {
      const correctCount = questions.filter((q, i) => userAnswers[i] === q.answer).length;
      setScore(correctCount);
      setShowResults(true);
    }
  };

  const downloadResults = () => {
    const lines = [`Final Quiz Score: ${score}/${questions.length}\n`];

    questions.forEach((q, i) => {
      const userAns = userAnswers[i] || "Not answered";
      lines.push(`Q${i + 1}: ${q.question}`);
      lines.push(`Your Answer: ${userAns}`);
      lines.push(`Correct Answer: ${q.answer}`);
      lines.push(`Explanation: ${q.explanation}\n`);
    });

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'final-quiz-results.txt';
    link.click();
  };

  const currentQn = questions[currentIndex];

  return (
    <div className="final-quiz-container">
      {!showResults ? (
        <div className="final-quiz-question-block">
          <h2 className="final-quiz-title">Final Quiz</h2>
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
            {currentIndex < questions.length - 1 ? (
              <button onClick={handleNext}>Next →</button>
            ) : (
              <button onClick={handleSubmit}>Submit</button>
            )}
          </div>
        </div>
      ) : (
        <div className="final-quiz-results">
          <h3>Your Score: {score}/{questions.length}</h3>

          <div className="final-quiz-actions" style={{ marginBottom: '1rem' }}>
            <button onClick={() => setShowAll(false)} className={!showAll ? 'active-toggle' : ''}>
              Show Only Wrong
            </button>
            <button onClick={() => setShowAll(true)} className={showAll ? 'active-toggle' : ''}>
              Show All
            </button>
            <button onClick={downloadResults}>Download Results</button>
          </div>

          {questions.map((q, i) => {
            const userAnswer = userAnswers[i];
            const isCorrect = userAnswer === q.answer;
            if (!showAll && isCorrect) return null;

            return (
              <div key={i} className="final-quiz-result-item">
                <p><strong>Q{i + 1}:</strong> {q.question}</p>
                {q.options.map((opt, j) => {
                  const isAnswer = opt === q.answer;
                  const isSelected = userAnswer === opt;
                  return (
                    <div
                      key={j}
                      className={`final-quiz-option ${
                        isAnswer ? 'correct' : ''
                      } ${isSelected && !isAnswer ? 'incorrect' : ''} ${
                        isSelected ? 'selected' : ''
                      }`}
                    >
                      {opt}
                      {isAnswer && <span className="tick">✓</span>}
                      {isSelected && !isAnswer && <span className="cross">✗</span>}
                    </div>
                  );
                })}
                <div className="final-quiz-explanation">
                  <strong>Explanation:</strong> {q.explanation}
                </div>
              </div>
            );
          })}

          <div className="final-quiz-actions">
            <button onClick={() => window.location.reload()}>Try Again</button>
            <button onClick={onFinish}>Finish</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalQuiz;
