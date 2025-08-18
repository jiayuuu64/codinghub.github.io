import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/finalquiz.css';
import { speakText, stopSpeaking } from '../utils/textToSpeech';

// FinalQuiz component receives props from parent
const FinalQuiz = ({ questions, onFinish, userAnswers, setUserAnswers, courseTitle }) => {
  // === State Setup ===
  const [currentIndex, setCurrentIndex] = useState(0); // Current question index
  const [showResults, setShowResults] = useState(false); // Whether results screen is visible
  const [score, setScore] = useState(0); // Final score after submission
  const [showAll, setShowAll] = useState(false); // Toggle to show all answers vs only incorrect ones
  const [recommendations, setRecommendations] = useState([]); // Array of AI recommendations
  const [loadingRecs, setLoadingRecs] = useState(false); // Show loading state while waiting for recs
  const [readerMode, setReaderMode] = useState(false); // Whether Reader Mode is enabled

  const email = localStorage.getItem('email'); // Retrieve email from local storage
  const currentQn = questions[currentIndex]; // Get the current question object

  // === User selects an answer option ===
  const handleOptionClick = (option) => {
    setUserAnswers((prev) => ({ ...prev, [currentIndex]: option })); // Save answer in userAnswers
  };

  // === Navigate to next question ===
  const handleNext = () => {
    stopSpeaking(); // Stop TTS if active
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  // === Navigate to previous question ===
  const handleBack = () => {
    stopSpeaking();
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  // === Exit quiz (parent handler) ===
  const handleExit = () => {
    stopSpeaking();
    onFinish();
  };

  // === Submit quiz ===
  const handleSubmit = async () => {
    const unanswered = questions.length - Object.keys(userAnswers).length; // Count unanswered
    const confirmSubmit = window.confirm(`You left ${unanswered} question(s) blank. Do you want to submit?`);
    if (!confirmSubmit) return;

    stopSpeaking();

    const correctCount = questions.filter((q, i) => userAnswers[i] === q.answer).length;
    setScore(correctCount); // Set score
    setShowResults(true); // Toggle to result view
    setLoadingRecs(true); // Show loading for recommendations

    const topicScores = {}; // Object to track per-topic performance
    const questionDetails = []; // Array of detailed result per question

    // Loop through each question to calculate score and breakdown
    questions.forEach((q, i) => {
      const topic = q.topic || "Unknown"; // Default topic
      const userAns = userAnswers[i] || '';
      const correct = userAns === q.answer;

      // Init topic score object
      if (!topicScores[topic]) topicScores[topic] = { score: 0, total: 0 };
      topicScores[topic].score += correct ? 1 : 0;
      topicScores[topic].total += 1;

      // Push question details
      questionDetails.push({
        question: q.question,
        topic,
        userAnswer: userAns,
        correctAnswer: q.answer,
        wasCorrect: correct
      });
    });

    // Save each topic result to backend
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

    // Skip fetching AI recommendations if user passes (score > 80%)
    if (correctCount / questions.length > 0.8) {
      setLoadingRecs(false); // No need to load recommendations
      return;
    }

    // Fetch personalized AI learning resources using LangChain backend
    // After a learner finishes the final quiz, we calculate their score
    // If they score below 80% we trigger an API call to our LangChain backend
    try {
      const response = await axios.post('https://codinghub-r3bn.onrender.com/api/ai/recommend', {
        score: correctCount,       // User's score
        courseTitle,               // Course name/title
        email,                     // User's email
      });

      // LangChain is used to select and format relevant articles and videos
      // Extract recommendation string and convert it into an array of suggestions
      const lines = response.data.recommendations.split('\n').filter(line => line.trim() !== '');

      // Parse each line into structured info: title, link, type, and thumbnail
      const parsed = lines.map((line) => {
        const titleMatch = line.match(/"(.+?)"/); // Match title in quotes
        const linkMatch = line.match(/https?:\/\/[^\s]+/); // Match URL
        const title = titleMatch ? titleMatch[1] : 'Untitled';
        const link = linkMatch ? linkMatch[0] : null;

        // Determine type of recommendation
        const isVideo = line.includes('📺') || (link && link.includes('youtube.com/watch?v='));
        const isArticle = line.includes('📰') || (!isVideo && line.includes('Article'));

        // Extract YouTube video ID if available
        const videoId = isVideo && link?.includes('v=') ? link.split('v=')[1].split('&')[0] : null;

        return {
          type: isVideo ? 'video' : 'article',
          title,
          link,
          hostname: link ? new URL(link).hostname.replace('www.', '') : '',
          thumbnail: isVideo && videoId
            ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` // YouTube preview
            : isArticle && link
              ? `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(link)}` // Article icon
              : 'https://via.placeholder.com/160x90?text=Resource' // Fallback image
        };
      });

      setRecommendations(parsed); // Save to state for rendering
    } catch (err) {
      console.error('Failed to fetch recommendations:', err); // Error logging
    } finally {
      setLoadingRecs(false); // Hide loading indicator
    }

  };

  // === Download quiz result as .txt ===
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

  // Auto reads current question and options aloud if readerMode is on
  useEffect(() => {
    let isCancelled = false; // Used to stop speech if user navigates early

    const speakCurrent = async () => {
      stopSpeaking(); // Always stop previous TTS before starting new

      // Skip if not in Reader Mode or quiz is already submitted
      if (!readerMode || showResults || !questions.length) return;

      const qn = questions[currentIndex];
      await speakText(`Question ${currentIndex + 1}: ${qn.question}`);
      if (isCancelled) return;

      // Read each option aloud one by one with delay
      for (const opt of qn.options) {
        if (isCancelled) return;
        await speakText(opt);
        await new Promise(res => setTimeout(res, 300)); // Add slight pause
      }
    };

    speakCurrent();

    return () => {
      isCancelled = true; // Prevent leftover speech on unmount/change
      stopSpeaking();     // Stop all ongoing speech immediately
    };
  }, [readerMode, currentIndex, showResults]); // Re-run when index or mode changes


  // After submission, read score and breakdown aloud if Reader Mode is on
  useEffect(() => {
    if (!readerMode || !showResults) return;

    stopSpeaking(); // Stop any leftover TTS
    let isCancelled = false;

    const speakSummary = async () => {
      await speakText(`You scored ${score} out of ${questions.length}`);
      if (isCancelled) return;

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const isCorrect = userAnswers[i] === q.answer;
        if (!showAll && isCorrect) continue; // Skip if showing only wrong

        await speakText(`Question ${i + 1}: ${q.question}`);
        await speakText(`Your answer: ${userAnswers[i] || 'Not answered'}`);
        await speakText(`Correct answer: ${q.answer}`);
        await speakText(`Explanation: ${q.explanation}`);
      }
    };

    speakSummary();

    return () => {
      isCancelled = true; // Cancel if component unmounts
      stopSpeaking();
    };
  }, [readerMode, showResults]);


  return (
    <div className="f-quiz-container">
      {/* === Reader Mode Toggle === */}
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

      {/* === QUIZ SCREEN === */}
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

          {/* Navigation buttons */}
          <div className="f-quiz-nav">
            <button onClick={handleBack} disabled={currentIndex === 0}>← Back</button>
            {currentIndex < questions.length - 1 ? (
              <button onClick={handleNext}>Next →</button>
            ) : (
              <button onClick={handleSubmit}>Submit</button>
            )}
          </div>
        </div>

        // === RESULT SCREEN ===
      ) : (
        <div className="f-quiz-results">
          <h3 className="score-title">Your Score: {score}/{questions.length}</h3>

          {loadingRecs && (
            <p style={{ color: '#999', fontStyle: 'italic', textAlign: 'center' }}>
              Loading recommendations...
            </p>
          )}

          {/* Show recs if failed */}
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

          {/* Result actions and toggles */}
          <div className="f-quiz-actions">
            <button onClick={() => setShowAll(false)} className={!showAll ? 'active-toggle' : ''}>Show Only Wrong</button>
            <button onClick={() => setShowAll(true)} className={showAll ? 'active-toggle' : ''}>Show All</button>
            <button onClick={downloadResults}>Download Results</button>
          </div>

          {/* List of all (or incorrect) questions with answers and explanations */}
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

          {/* Final action buttons */}
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
