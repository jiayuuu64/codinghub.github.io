import mongoose from 'mongoose';

const stepSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'video', 'quiz', 'code', 'text-video'], // added 'text-video'
    required: true
  },
  content: {
    type: String,  // for video URL or text content (for text-only)
  },
  text: {
    type: String   // for text content when type is 'text-video'
  },
  language: String,
  quiz: {
    question: String,
    options: [String],
    answer: String
  }
});

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  steps: [stepSchema]
});

const Lesson = mongoose.model('Lesson', lessonSchema);
export default Lesson;