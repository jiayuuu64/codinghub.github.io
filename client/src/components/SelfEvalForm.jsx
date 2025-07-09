import React, { useState } from 'react';
import '../styles/SelfEval.css';

const predefinedTopics = [
  "Creating Variables",
  "Data Types",
  "Basic Operations",
  "If Statements",
  "Loops",
  "Defining Functions"
];

const SelfEvalForm = ({ onGenerate, loading }) => {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [message, setMessage] = useState('');
  const email = localStorage.getItem('email');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic || !numQuestions) {
      setMessage("Please select a topic and number of questions.");
      return;
    }
    setMessage('');
    try {
      const response = await fetch(`https://codinghub-r3bn.onrender.com/api/quiz-generator/custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, topic, numQuestions }),
      });
      const data = await response.json();
      if (response.ok) {
        // Parse quiz string into objects
        const raw = data.quiz.split(/\d+\./).filter(Boolean);
        const parsedQuiz = raw.map(q => {
          const [questionPart, ...optionsAndAnswer] = q.trim().split(/A\.|B\.|C\.|D\.|Answer:/).filter(Boolean);
          const options = optionsAndAnswer.slice(0, 4).map(opt => opt.trim());
          const answerLine = optionsAndAnswer[4]?.trim().replace(/Answer:\s*/, '');
          return { question: questionPart.trim(), options, answer: answerLine, explanation: "Auto-generated explanation." };
        });
        onGenerate(parsedQuiz);
      } else {
        setMessage(data.error || "Failed to generate quiz.");
      }
    } catch (err) {
      setMessage("Error generating quiz.");
    }
  };

  return (
    <div className="selfeval-container">
      <div className="selfeval-card">
        <h2>Generate Your Self-Evaluation Quiz</h2>
        <form onSubmit={handleSubmit}>
          <select
            className="selfeval-select"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          >
            <option value="">Select Topic</option>
            {predefinedTopics.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <input
            className="selfeval-input"
            type="number"
            min="1"
            max="10"
            value={numQuestions}
            onChange={(e) => setNumQuestions(e.target.value)}
            placeholder="Number of questions (1-10)"
          />

          <button type="submit" className="selfeval-button" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Quiz'}
          </button>

          {message && <p className="selfeval-message">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default SelfEvalForm;