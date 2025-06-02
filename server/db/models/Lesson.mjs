import mongoose from 'mongoose';

const stepSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'video', 'quiz', 'code', 'text-video'], // supported step types
    required: true
  },
  content: String,     // For text, video, code, or text-video
  text: String,        // For text-video
  language: String,    // For code steps
  question: String,    // For quiz steps
  options: [String],   // For quiz steps
  answer: String       // For quiz steps
});

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  steps: [stepSchema]
});

const Lesson = mongoose.model('Lesson', lessonSchema);
export default Lesson;
