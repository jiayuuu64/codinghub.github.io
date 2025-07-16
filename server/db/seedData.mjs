import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './models/Course.mjs';
import Lesson from './models/Lesson.mjs';
import courseContent from './seed/courseContent.json' assert { type: "json" };

dotenv.config({ path: '../.env' });

await mongoose.connect(process.env.MONGO_URI);
console.log("✅ Connected to MongoDB");

// Clear old data
await Course.deleteMany();
await Lesson.deleteMany();
console.log("🗑️ Old courses and lessons cleared");

// Loop through each course in the JSON array
for (const course of courseContent) {
  // Loop through sections and lessons to create Lesson docs
  for (const section of course.sections) {
    for (const lesson of section.lessons) {
      const newLesson = await Lesson.create(lesson);
      // Replace lesson object with its ID for references
      lesson._id = newLesson._id;
    }
  }

  // Prepare updated sections with lesson IDs
  const updatedSections = course.sections.map(section => ({
    ...section,
    lessons: section.lessons.map(lesson => lesson._id)
  }));

  // Create Course document
  await Course.create({
    title: course.title,
    description: course.description,
    sections: updatedSections
  });

  console.log(`✅ Seeded course: ${course.title}`);
}

console.log("🎉 All courses and lessons seeded successfully!");
process.exit(0);