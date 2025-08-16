import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';                       // ✅ show navbar in loading/empty states
import '../styles/finalquiz.css';
import { speakText, stopSpeaking } from '../utils/textToSpeech';
import { parseQuizText } from '../utils/parseQuizText';

const API = 'https://codinghub-r3bn.onrender.com/api';
const norm = (s) => (s || '').toLowerCase().replace(/\s+/g, ' ').trim();

const SelfEvalQuiz = () => {
  const location = useLocation(); // reads route state
  const navigate = useNavigate();
  const mode = location.state?.mode || 'adaptive';   // (optional) 'adaptive' | 'review'

  // useState: lets you store component data (e.g quiz questions, answers, scores)
  // useEffect: runs side effects (fetching quiz questions, when component loads)
  const [quizData, setQuizData] = useState([]); // parsed quiz questions
  const [currentIndex, setCurrentIndex] = useState(0); // which question is the user on
  const [userAnswers, setUserAnswers] = useState({}); // stores what the user clicked per question
  const [showResults, setShowResults] = useState(false); // whether we're on quiz mode or results mode
  const [score, setScore] = useState(0); // total correct answers
  const [showAll, setShowAll] = useState(false); // show all answers or only wrong ones
  const [readerMode, setReaderMode] = useState(false); // enable text-to-speech
  const [loading, setLoading] = useState(false); // is quiz loading?
  const [error, setError] = useState('');

  // Takes GPT's raw quiz text, parses it, resets the whole quiz state to start fresh
  const resetStateWithText = (text) => {
    const parsed = parseQuizText(text || '');
    setQuizData(parsed);
    setCurrentIndex(0);
    setUserAnswers({});
    setShowResults(false);
    setScore(0);
  };

  // Calls backend route /quiz-generator/personalized with the logged-in user's email 
  // Asks backend to generate a personalized quiz based on weak topics
  const fetchQuiz = async () => {
    try {
      setLoading(true);
      setError('');
      const email = localStorage.getItem('email')?.toLowerCase();
      const url = `${API}/quiz-generator/personalized`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mode })
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`POST ${url} -> ${res.status} ${res.statusText}\n${text.slice(0,200)}`);
      }
      const data = await res.json();
      if (!data.quiz || !data.quiz.trim()) {
        setQuizData([]);
        setError(data.message || 'No questions returned.');
        return;
      }
      resetStateWithText(data.quiz);
    } catch (e) {
      console.error('Failed to fetch quiz', e);
      setError('Failed to fetch a new quiz. Please try again.');
      setQuizData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuiz(); }, []);

  // Picks the question the user is currently on
  const currentQn = quizData[currentIndex];

  // Saves the selected answer for the current question
  const handleOptionClick = (option) => setUserAnswers((prev) => ({ ...prev, [currentIndex]: option }));
  const handleNext = () => { stopSpeaking(); if (currentIndex < quizData.length - 1) setCurrentIndex(currentIndex + 1); };
  const handleBack = () => { stopSpeaking(); if (currentIndex > 0) setCurrentIndex(currentIndex - 1); };
  const handleExit = () => { stopSpeaking(); navigate('/home'); };

  // When the user clicks submit -> warns if some questions unanswered
  const handleSubmit = async () => {
    const unanswered = quizData.length - Object.keys(userAnswers).length;
    if (!window.confirm(`You left ${unanswered} question(s) blank. Submit?`)) return;

    stopSpeaking();
    // Calculates how many answers were correct -> updates score -> show results page
    const correctCount = quizData.filter((q, i) => norm(userAnswers[i]) === norm(q.answer)).length;
    setScore(correctCount);
    setShowResults(true);

    // ✅ Save per-topic so weak topics update immediately
    try {
      const email = localStorage.getItem('email')?.toLowerCase();
      const byTopic = new Map();
      quizData.forEach((q, i) => {
        const t = (q.topic || 'Mixed').trim();
        const wasCorrect = norm(userAnswers[i] || '') === norm(q.answer);
        if (!byTopic.has(t)) byTopic.set(t, { score: 0, total: 0, items: [] });
        const entry = byTopic.get(t);
        entry.total += 1;
        if (wasCorrect) entry.score += 1;
        entry.items.push({
          question: q.question,
          userAnswer: userAnswers[i] || '',
          correctAnswer: q.answer,
          wasCorrect
        });
      });

      // Sends per-topic results to backend (quiz-history/save)
      // This updates weak topics so adaptive quizzes improve over time
      for (const [topic, v] of byTopic.entries()) {
        await fetch(`${API}/quiz-history/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            topic,
            score: v.score,
            total: v.total,
            questionDetails: v.items
          })
        });
      }
    } catch (e) {
      console.warn('Saving per-topic history failed (non-blocking):', e);
    }
  };

  // Resets everything and fetches a new quiz
  const handleTryAgain = () => {
    stopSpeaking();
    setError('');
    setQuizData([]);
    setLoading(true);
    fetchQuiz();
  };

  // ---- LOADING: match Courses page look (navbar + blue bg + centered white text)
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="courses-container">
          <h2 className="courses-heading">Self Evaluation Quiz</h2>
          <p style={{ color: 'white', textAlign: 'center' }}>Loading quiz...</p>
        </div>
      </>
    );
  }

  // ---- EMPTY/ERROR: same look as loading
  if (!loading && !quizData.length) {
    return (
      <>
        <Navbar />
        <div className="courses-container">
          <h2 className="courses-heading">Self Evaluation Quiz</h2>
          <p style={{ color: 'white', textAlign: 'center' }}>
            {error || 'We couldn’t load any questions.'}
          </p>
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <button onClick={handleTryAgain} className="self-eval-button" style={{ marginRight: 8 }}>
              Try Again
            </button>
            <button onClick={handleExit} className="self-eval-button" style={{ background: '#666' }}>
              Back
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="lesson-fullscreen">
      <div className="lesson-top-bar">
        <button className="lesson-exit-button" onClick={handleExit}>✕ Exit</button>
        <div className="lesson-progress-bar-wrapper">
          <div className="lesson-progress-bar">
            {quizData.map((_, idx) => {
              const state = userAnswers[idx] ? 'answered' : showResults ? 'skipped' : 'not-visited';
              return <div key={idx} className={`lesson-progress-step ${state}`}></div>;
            })}
          </div>
        </div>
      </div>

      <div className="f-quiz-container">
        <div className="reader-toggle">
          <button
            onClick={() => { if (readerMode) { stopSpeaking(); setReaderMode(false); } else { setReaderMode(true); } }}
            className={`reader-btn ${readerMode ? 'on' : 'off'}`}
          >
            Reader Mode: {readerMode ? '✓' : '✗'}
          </button>
        </div>

        {!showResults ? (
          <div className="f-quiz-block">
            <h2 className="f-quiz-title">Self Evaluation Quiz</h2>
            <h3 className="f-quiz-question">Q{currentIndex + 1}: {currentQn.question}</h3>
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
              {currentIndex < quizData.length - 1
                ? <button onClick={handleNext}>Next →</button>
                : <button onClick={handleSubmit}>Submit</button>}
            </div>
          </div>
        ) : (
          <div className="f-quiz-results">
            <h3 style={{ textAlign: 'center' }}>Your Score: {score}/{quizData.length}</h3>

            <div className="f-quiz-actions" style={{ marginBottom: '1rem' }}>
              <button onClick={() => setShowAll(false)} className={!showAll ? 'active-toggle' : ''}>Show Only Wrong</button>
              <button onClick={() => setShowAll(true)} className={showAll ? 'active-toggle' : ''}>Show All</button>
              <button onClick={handleTryAgain}>Try Again</button>
              <button onClick={handleExit}>Finish</button>
            </div>

            {quizData.map((q, i) => {
              const ua = userAnswers[i];
              const correctIdx = q.options.findIndex(opt => norm(opt) === norm(q.answer));
              if (!showAll && norm(ua) === norm(q.answer)) return null;

              return (
                <div key={i} className="f-quiz-result-item">
                  <p><strong>Q{i + 1}:</strong> {q.question}</p>
                  {q.options.map((opt, j) => {
                    const isAnswer = j === correctIdx;
                    const isSelected = norm(ua || '') === norm(opt);
                    return (
                      <div
                        key={j}
                        className={`f-quiz-option ${isAnswer ? 'correct' : ''} ${isSelected && !isAnswer ? 'incorrect' : ''} ${isSelected ? 'selected' : ''}`}
                      >
                        {opt}
                        {isAnswer && <span className="tick">✓</span>}
                        {isSelected && !isAnswer && <span className="cross">✗</span>}
                      </div>
                    );
                  })}
                  {correctIdx === -1 && (
                    <div className="f-quiz-explanation"><strong>Correct answer: </strong>{q.answer}</div>
                  )}
                  <div className="f-quiz-explanation"><strong>Explanation:</strong> {q.explanation}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SelfEvalQuiz;