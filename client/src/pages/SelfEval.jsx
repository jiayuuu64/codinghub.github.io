import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SelfEvalForm from '../components/SelfEvalForm';
import '../styles/Lesson.css'; // You can replace this if you'd like to use SelfEval.css only

const SelfEval = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = (quizData) => {
    // Navigate to SelfEvalQuiz and pass quiz data as state
    navigate('/self-eval/quiz', { state: { quiz: quizData } });
  };

  return (
    <>
      <Navbar />
      <div className="lesson-fullscreen">
        <SelfEvalForm onGenerate={handleGenerate} loading={loading} />
      </div>
    </>
  );
};

export default SelfEval;