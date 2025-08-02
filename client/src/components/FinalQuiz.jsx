import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/finalquiz.css';
import { speakText, stopSpeaking } from '../utils/textToSpeech';

const FinalQuiz = ({ questions, onFinish, userAnswers, setUserAnswers, courseTitle }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [readerMode, setReaderMode] = useState(false);

  const email = localStorage.getItem('email');
  const currentQn = questions[currentIndex];

  const handleOptionClick = (option) => {
    setUserAnswers((prev) => ({ ...prev, [currentIndex]: option }));
  };

  const handleNext = () => {
    stopSpeaking();
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleBack = () => {
    stopSpeaking();
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleExit = () => {
    stopSpeaking();
    onFinish();
  };

  const handleSubmit = async () => {
    const unanswered = questions.length - Object.keys(userAnswers).length;
    const confirmSubmit = window.confirm(`You left ${unanswered} question(s) blank. Do you want to submit?`);
    if (!confirmSubmit) return;

    stopSpeaking();
    const correctCount = questions.filter((q, i) => userAnswers[i] === q.answer).length;
    setScore(correctCount);
    setShowResults(true);
    setLoadingRecs(true);

    const topicScores = {};
    const questionDetails = [];

    questions.forEach((q, i) => {
      const topic = q.topic || "Unknown";
      const userAns = userAnswers[i] || '';
      const correct = userAns === q.answer;

      if (!topicScores[topic]) topicScores[topic] = { score: 0, total: 0 };
      topicScores[topic].score += correct ? 1 : 0;
      topicScores[topic].total += 1;

      questionDetails.push({
        question: q.question,
        topic,
        userAnswer: userAns,
        correctAnswer: q.answer,
        wasCorrect: correct
      });
    });

    for (const [topic, { score, total }] of Object.entries(topicScores)) {
      try {
        await fetch('https://codinghub-r3bn.onrender.com/api/quiz-history/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            topic,
            score,
            total,
            questionDetails: questionDetails.filter(q => q.topic === topic || topic === "Unknown")
          })
        });
      } catch (err) {
        console.error('❌ Error saving final quiz score:', err);
      }
    }

    if (correctCount / questions.length > 0.8) {
      setLoadingRecs(false);
      return;
    }

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
    } finally {
      setLoadingRecs(false);
    }
  };

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

  useEffect(() => {
    let isCancelled = false;

    const speakCurrent = async () => {
      stopSpeaking();
      if (!readerMode || showResults || !questions.length) return;

      const qn = questions[currentIndex];
      await speakText(`Question ${currentIndex + 1}: ${qn.question}`);
      if (isCancelled) return;

      for (const opt of qn.options) {
        if (isCancelled) return;
        await speakText(opt);
        await new Promise(res => setTimeout(res, 300));
      }
    };

    speakCurrent();

    return () => {
      isCancelled = true;
      stopSpeaking();
    };
  }, [readerMode, currentIndex, showResults]);

  useEffect(() => {
    if (!readerMode || !showResults) return;

    stopSpeaking();

    let isCancelled = false;

    const speakSummary = async () => {
      await speakText(`You scored ${score} out of ${questions.length}`);
      if (isCancelled) return;

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const isCorrect = userAnswers[i] === q.answer;
        if (!showAll && isCorrect) continue;

        if (isCancelled) return;
        await speakText(`Question ${i + 1}: ${q.question}`);
        if (isCancelled) return;
        await speakText(`Your answer: ${userAnswers[i] || 'Not answered'}`);
        if (isCancelled) return;
        await speakText(`Correct answer: ${q.answer}`);
        if (isCancelled) return;
        await speakText(`Explanation: ${q.explanation}`);
      }
    };

    speakSummary();

    return () => {
      isCancelled = true;
      stopSpeaking();
    };
  }, [readerMode, showResults]);

  return (
    <div className="f-quiz-container">
      <div className="reader-toggle">
        <button
          onClick={() => {
            stopSpeaking();
            setReaderMode(prev => !prev);
          }}
          className={`reader-btn ${readerMode ? 'on' : 'off'}`}
        >
          Reader Mode: {readerMode ? '✓' : '✗'}
        </button>
      </div>

      {!showResults ? (
        <div className="f-quiz-block">
          <h2 className="f-quiz-title">Final Quiz</h2>
          <h3 className="f-quiz-question">Q{currentIndex + 1}: {currentQn.question}</h3>
          <ul className="f-quiz-options">
            {currentQn.options.map((option, idx) => (
              <li
                key={idx}
                className={`f-quiz-option ${userAnswers[currentIndex] === option ? 'selected' : ''}`}
                onClick={() => handleOptionClick(option)}
              >
                {option}
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
          <h3 className="score-title">Your Score: {score}/{questions.length}</h3>

          {loadingRecs && (
            <p style={{ color: '#999', fontStyle: 'italic', textAlign: 'center' }}>
              Loading recommendations...
            </p>
          )}

          {!loadingRecs && score / questions.length <= 0.8 && recommendations.length > 0 && (
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

          <div className="f-quiz-actions">
            <button onClick={() => setShowAll(false)} className={!showAll ? 'active-toggle' : ''}>Show Only Wrong</button>
            <button onClick={() => setShowAll(true)} className={showAll ? 'active-toggle' : ''}>Show All</button>
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
                <div className="f-quiz-explanation"><strong>Explanation:</strong> {q.explanation}</div>
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
  );
};

export default FinalQuiz;
