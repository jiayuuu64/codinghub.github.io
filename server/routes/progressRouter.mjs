import express from 'express';
import {
  completeLesson,
  completeQuiz,
  getProgress,
  getAllUserProgress
} from '../controllers/authFunctions.mjs';

const router = express.Router();

// POST /api/progress/:courseId/complete-lesson
router.post('/:courseId/complete-lesson', completeLesson);

// POST /api/progress/:courseId/:email/complete-quiz
router.post('/:courseId/:email/complete-quiz', completeQuiz);

// GET /api/progress/:courseId?email=...
router.get('/:courseId', getProgress);

// GET /api/progress/user/:email
router.get('/user/:email', getAllUserProgress);

export default router;
