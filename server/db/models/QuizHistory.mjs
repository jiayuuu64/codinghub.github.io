import mongoose from 'mongoose';

// This defines the structure for a saved quiz attempt
const quizHistorySchema = new mongoose.Schema({
  email: { type: String, required: true },     // Who took the quiz
  topic: { type: String, required: true },     // What topic it was about (e.g., Loops)
  score: { type: Number, required: true },     // How many correct
  total: { type: Number, required: true },     // Out of how many questions
  timestamp: { type: Date, default: Date.now } // When the quiz was taken
});

// This makes the model usable across the app
const QuizHistory = mongoose.model('QuizHistory', quizHistorySchema);

export default QuizHistory;