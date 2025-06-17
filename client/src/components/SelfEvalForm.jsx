import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Lesson.css'; // Reuse your theme

// ✅ Predefined topics from courseContent.json
const predefinedTopics = [
  "Creating Variables",
  "Data Types",
  "Basic Operations",
  "If Statements",
  "Loops",
  "Defining Functions"
];

const SelfEvalForm = () => {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const email = localStorage.getItem('email');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic || !numQuestions) return setError("All fields are required");

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/quiz-generator/custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, topic, numQuestions })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Quiz generation failed");

      navigate('/self-eval/quiz', { state: { quiz: data.quiz } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lesson-fullscreen">
      <div className="lesson-step-container" style={{ flexDirection: 'column' }}>
        <h2>🧠 Self-Evaluation Quiz</h2>

        <form onSubmit={handleSubmit} className="self-eval-form">
          <label>Select Topic:</label>
          <select value={topic} onChange={(e) => setTopic(e.target.value)}>
            <option value="">-- Choose a topic --</option>
            {predefinedTopics.map((t, idx) => (
              <option key={idx} value={t}>{t}</option>
            ))}
          </select>

          <label>Number of Questions:</label>
          <input
            type="number"
            min="1"
            max="10"
            value={numQuestions}
            onChange={(e) => setNumQuestions(Number(e.target.value))}
          />

          <button className="lesson-nav-button" type="submit" disabled={loading}>
            {loading ? "Generating..." : "Start Quiz"}
          </button>

          {error && <p style={{ color: '#f87171' }}>{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default SelfEvalForm;