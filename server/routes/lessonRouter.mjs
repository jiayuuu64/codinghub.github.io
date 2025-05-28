// routes/lessonRouter.mjs
import express from 'express';
import Lesson from '../db/models/Lesson.mjs';

const router = express.Router();

// GET /api/lessons/:id — get lesson by ID with full steps
router.get('/:id', async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    res.json(lesson);
  } catch (err) {
    console.error('Error fetching lesson:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
