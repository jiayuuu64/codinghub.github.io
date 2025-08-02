import mongoose from 'mongoose';

// This defines the structure for a saved quiz attempt
const quizHistorySchema = new mongoose.Schema({
  email: { type: String, required: true },     // Who took the quiz
  topic: { type: String, required: true },     // Topic of the quiz
  score: { type: Number, required: true },     // Number of correct answers
  total: { type: Number, required: true },     // Total number of questions
  timestamp: { type: Date, default: Date.now },// When the quiz was taken

  // ✅ NEW: Store full question-level results
  questionDetails: [
    {
      question: { type: String, required: true },
      userAnswer: { type: String },
      correctAnswer: { type: String },
      wasCorrect: { type: Boolean }
    }
  ]
});

const QuizHistory = mongoose.model('QuizHistory', quizHistorySchema);

export default QuizHistory;