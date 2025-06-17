import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import SelfEvalForm from '../components/SelfEvalForm';
import '../styles/Lesson.css'; // Reuse your lesson styles

const SelfEval = () => {
  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const handleGenerate = (quizData) => {
    setQuiz(quizData);
    setStepIndex(0);
  };

  const current = quiz[stepIndex];

  return (
    <>
      <Navbar />
      <div className="lesson-fullscreen">
        {!quiz.length ? (
          <SelfEvalForm onGenerate={handleGenerate} loading={loading} />
        ) : (
          <>
            <div className="lesson-step-container">
              <div className="lesson-step-quiz">
                <h3 className="quiz-question">{current.question}</h3>
                <ul className="quiz-options">
                  {current.options.map((option, i) => (
                    <li
                      key={i}
                      className="quiz-option"
                      onClick={() =>
                        alert(option === current.answer
                          ? '✅ Correct!'
                          : `❌ Nope. Answer: ${current.answer}`)
                      }
                    >
                      {option}
                    </li>
                  ))}
                </ul>
                <p className="lesson-step-text" style={{ marginTop: '1rem', fontSize: '1rem' }}>
                  Explanation: {current.explanation}
                </p>
              </div>
            </div>

            <div className="lesson-bottom-bar">
              <button
                className="lesson-nav-button"
                onClick={() => setStepIndex(stepIndex - 1)}
                disabled={stepIndex === 0}
              >
                ← Back
              </button>
              {stepIndex < quiz.length - 1 ? (
                <button className="lesson-nav-button" onClick={() => setStepIndex(stepIndex + 1)}>
                  Next →
                </button>
              ) : (
                <button className="lesson-nav-button" onClick={() => setQuiz([])}>
                  Finish
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default SelfEval;
