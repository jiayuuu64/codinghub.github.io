import mongoose from 'mongoose';
import Lesson from './Lesson.mjs';  // <--- Add this line

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }]
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  sections: [sectionSchema]
});

const Course = mongoose.model('Course', courseSchema);
export default Course;