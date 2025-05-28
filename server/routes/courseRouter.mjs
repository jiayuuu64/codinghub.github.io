import express from 'express';
import Course from '../db/models/Course.mjs';

const router = express.Router();

// GET /api/courses – Get all courses
router.get('/', async (req, res) => {
  try {
    console.log('🔍 [GET] /api/courses - attempting Course.find()...');

    // Sanity check: is the model loaded?
    if (!Course || typeof Course.find !== 'function') {
      throw new Error('⚠️ Course model is not defined or improperly imported');
    }

    const courses = await Course.find();

    if (!courses || courses.length === 0) {
      console.log('ℹ️ No courses found in the database');
    } else {
      console.log(`✅ Found ${courses.length} course(s)`);
    }

    res.json(courses);
  } catch (err) {
    console.error('❌ Error in GET /api/courses:', err.message);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// GET /api/courses/:id – Get a specific course with populated lessons
router.get('/:id', async (req, res) => {
  try {
    console.log(`🔍 [GET] /api/courses/${req.params.id} - fetching course`);

    const course = await Course.findById(req.params.id).populate({
      path: 'sections.lessons'
    });

    if (!course) {
      console.warn('⚠️ Course not found');
      return res.status(404).json({ error: 'Course not found' });
    }

    console.log(`✅ Course found: ${course.title}`);
    res.json(course);
  } catch (err) {
    console.error('❌ Error in GET /api/courses/:id:', err.message);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

export default router;