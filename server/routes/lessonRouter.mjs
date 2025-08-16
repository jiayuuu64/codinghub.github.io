// routes/lessonRouter.mjs
import express from 'express';
import Lesson from '../db/models/Lesson.mjs';
import Course from '../db/models/Course.mjs';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.mjs';

const router = express.Router();

// GET /api/lessons/:id — get lesson by ID with full steps
router.get('/:id', async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    console.log(`✅ Lesson found: ${lesson.title}`);
    res.json(lesson);
  } catch (err) {
    console.error('Error fetching lesson:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { courseId, sectionIndex, title, steps } = req.body;

    if (!courseId || sectionIndex === undefined || !title || !steps) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const formattedSteps = steps.map(step => { // Loops through each step in the lesson and normalises its structure before saving
      if (step.type === 'quiz') {
        return {
          type: 'quiz',
          question: step.question || '',
          options: step.options || [],
          answer: step.answer || '',
          explanation: step.explanation || ''
        };

      } else {
        return {
          type: step.type,
          text: step.text || '',
          content: step.content || ''
        };
      }
    });
    // Creates a new lesson document
    const lesson = new Lesson({ title, steps: formattedSteps });
    // Saves the lesson in the Lesson collection
    await lesson.save();

    // Finds the parent course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (!course.sections[sectionIndex]) {
      return res.status(404).json({ error: 'Section not found' });
    }

    // Adds the new lesson's ID into the right section of the course
    course.sections[sectionIndex].lessons.push(lesson._id);
    await course.save();

    res.status(201).json({ message: 'Lesson created and added to section', lesson });
  } catch (err) {
    console.error('Error creating lesson:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});


export default router;
