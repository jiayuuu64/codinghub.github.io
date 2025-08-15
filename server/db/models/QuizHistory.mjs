import mongoose from 'mongoose';

const questionDetailSchema = new mongoose.Schema({
  question: { type: String, required: true },
  userAnswer: { type: String },
  correctAnswer: { type: String },
  wasCorrect: { type: Boolean },
  // NEW
  questionHash: { type: String },
  templateHash: { type: String },
}, { _id: false });

const quizHistorySchema = new mongoose.Schema({
  email: { type: String, required: true },
  topic: { type: String, required: true },
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  questionDetails: [questionDetailSchema]
});

// fast lookups for “have we asked this exact/template before?”
quizHistorySchema.index({ email: 1, 'questionDetails.questionHash': 1 });
quizHistorySchema.index({ email: 1, 'questionDetails.templateHash': 1 });

const QuizHistory = mongoose.model('QuizHistory', quizHistorySchema);
export default QuizHistory;