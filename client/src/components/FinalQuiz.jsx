import React, { useState } from 'react';
import axios from 'axios';
import '../styles/finalquiz.css';
import { speakText } from '../utils/textToSpeech';

const FinalQuiz = ({ questions, onFinish, userAnswers, setUserAnswers, courseTitle }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const email = localStorage.getItem('email');
  const currentQn = questions[currentIndex];

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

  const handleSubmit = async () => {
    const unanswered = questions.length - Object.keys(userAnswers).length;
    const confirmSubmit = window.confirm(`You left ${unanswered} question(s) blank. Do you want to submit?`);
    if (!confirmSubmit) return;

    const correctCount = questions.filter((q, i) => userAnswers[i] === q.answer).length;
    setScore(correctCount);
    setShowResults(true);

    const topicScores = {};
    questions.forEach((q, i) => {
      const topic = q.topic || "Unknown";
      const correct = userAnswers[i] === q.answer;
      if (!topicScores[topic]) topicScores[topic] = { score: 0, total: 0 };
      topicScores[topic].score += correct ? 1 : 0;
      topicScores[topic].total += 1;
    });

    for (const [topic, { score, total }] of Object.entries(topicScores)) {
      try {
        await fetch('https://codinghub-r3bn.onrender.com/api/quiz-history/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, topic, score, total }),
        });
      } catch (err) {
        console.error('❌ Error saving final quiz score:', err);
      }
    }

    if (correctCount / questions.length > 0.8) return;

    try {
      const response = await axios.post('https://codinghub-r3bn.onrender.com/api/ai/recommend', {
        score: correctCount,
        courseTitle,
        email,
      });

      const lines = response.data.recommendations.split('\n').filter(line => line.trim() !== '');
      const parsed = lines.map((line) => {
        const titleMatch = line.match(/"(.+?)"/);
        const linkMatch = line.match(/https?:\/\/[^\s]+/);
        const title = titleMatch ? titleMatch[1] : 'Untitled';
        const link = linkMatch ? linkMatch[0] : null;
        const isVideo = line.includes('📺') || (link && link.includes('youtube.com/watch?v='));
        const isArticle = line.includes('📰') || (!isVideo && line.includes('Article'));
        const videoId = isVideo && link?.includes('v=') ? link.split('v=')[1].split('&')[0] : null;

        return {
          type: isVideo ? 'video' : 'article',
          title,
          link,
          hostname: link ? new URL(link).hostname.replace('www.', '') : '',
          thumbnail: isVideo && videoId
            ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
            : isArticle && link
              ? `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(link)}`
              : 'https://via.placeholder.com/160x90?text=Resource'
        };
      });

      setRecommendations(parsed);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    }
  };

  const passedWell = score / questions.length > 0.8;

  const downloadResults = () => {
    const content = questions.map((q, i) => {
      return `Q${i + 1}: ${q.question}\nYour Answer: ${userAnswers[i] || 'Not Answered'}\nCorrect Answer: ${q.answer}\nExplanation: ${q.explanation}\n\n`;
    }).join('');

    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'quiz_results.txt';
    link.click();
  };

  return (
    <div className="f-quiz-container">
      {!showResults ? (
        <div className="f-quiz-block">
          <h2 className="f-quiz-title">Final Quiz</h2>
          <h3 className="f-quiz-question">
            Q{currentIndex + 1}: {currentQn.question}
            <button className="speaker-btn" onClick={() => speakText(currentQn.question)} title="Listen">🔊</button>
          </h3>
          <ul className="f-quiz-options">
            {questions[currentIndex]?.options.map((option, idx) => (
              <li
                key={idx}
                className={`f-quiz-option ${userAnswers[currentIndex] === option ? 'selected' : ''}`}
                onClick={() => handleOptionClick(option)}
                role="button"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: '#ffed91'
                }}
              >
                <span className="option-text">{option}</span>
                <div
                  className="option-right"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakText(option);
                  }}
                  title="Listen to option"
                >
                  🔊
                </div>
              </li>
            ))}
          </ul>

          <div className="f-quiz-nav">
            <button onClick={handleBack} disabled={currentIndex === 0}>← Back</button>
            {currentIndex < questions.length - 1 ? (
              <button onClick={handleNext}>Next →</button>
            ) : (
              <button onClick={handleSubmit}>Submit</button>
            )}
          </div>
        </div>
      ) : (
        <div className="f-quiz-results">
          <h3>Your Score: {score}/{questions.length}</h3>

          {passedWell ? (
            <div className="recom-section">
              <h4>Great Job!</h4>
              <p style={{ textAlign: 'center', color: '#ccc' }}>
                You scored above 80%! Keep up the good work and challenge yourself further!
              </p>
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button className="submit-btn" onClick={() => window.location.reload()}>
                  Retry a Harder Quiz
                </button>
              </div>
            </div>
          ) : recommendations.length > 0 && (
            <div className="recom-section">
              <h4>✨ Personalized Recommendations:</h4>
              <div className="recom-grid">
                {recommendations.map((rec, i) => (
                  <div className="recom-card" key={i}>
                    <img src={rec.thumbnail} alt={rec.title} className="recom-thumb" />
                    <div className="recom-info">
                      <p className="recom-type">{rec.type.toUpperCase()}</p>
                      <p className="recom-title">{rec.title}</p>
                      {rec.hostname && <p className="recom-site">{rec.hostname}</p>}
                      {rec.link ? (
                        <a href={rec.link} target="_blank" rel="noopener noreferrer">View</a>
                      ) : (
                        <p className="disabled-link">Link not available</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="f-quiz-actions" style={{ marginBottom: '1rem' }}>
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
              <div key={i} className="f-quiz-result-item">
                <p><strong>Q{i + 1}:</strong> {q.question}</p>
                {q.options.map((opt, j) => {
                  const isAnswer = opt === q.answer;
                  const isSelected = userAnswer === opt;
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
                <div className="f-quiz-explanation">
                  <strong>Explanation:</strong> {q.explanation}
                </div>
              </div>
            );
          })}

          <div className="f-quiz-actions">
            <button onClick={() => window.location.reload()}>Try Again</button>
            <button onClick={onFinish}>Finish</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalQuiz;
