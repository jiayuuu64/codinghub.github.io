import mongoose from 'mongoose';

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