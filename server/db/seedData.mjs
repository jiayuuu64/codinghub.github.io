import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './models/Course.mjs';
import Lesson from './models/Lesson.mjs';
import courseContent from './seed/courseContent.json' assert { type: "json" };

dotenv.config({ path: '../.env' });
await mongoose.connect(process.env.MONGO_URI);
console.log("✅ Connected to MongoDB");

await Course.deleteMany();
await Lesson.deleteMany();

const lessonDocs = [];

for (const section of courseContent.sections) {
  for (const lesson of section.lessons) {
    const newLesson = await Lesson.create(lesson);
    lessonDocs.push(newLesson);
    lesson._id = newLesson._id;
  }
}

const updatedSections = courseContent.sections.map(section => ({
  ...section,
  lessons: section.lessons.map(lesson => lesson._id)
}));

await Course.create({
  title: courseContent.title,
  description: courseContent.description,
  sections: updatedSections
});

console.log("✅ Course and lessons seeded!");
process.exit(0);
