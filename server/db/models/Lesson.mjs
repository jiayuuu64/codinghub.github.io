import mongoose from 'mongoose';

const stepSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'video', 'quiz', 'code', 'text-video', 'text-code'],
    required: true,
  },
  content: String,       // Code snippet, video URL, or text content
  text: String,          // Explanatory text (used for text-video and text-code)
  language: String,      // For code snippets
  question: String,      // For quizzes
  options: [String],     // For quizzes
  answer: String,        // For quizzes
  explanation: String,    // 2-try quiz feedback
  topic: String
});

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  steps: [stepSchema],
});

const Lesson = mongoose.model('Lesson', lessonSchema);
export default Lesson;