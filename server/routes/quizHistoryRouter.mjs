import express from 'express';
import QuizHistory from '../db/models/QuizHistory.mjs';

const router = express.Router();

// ✅ Save a quiz result (from frontend to DB)
router.post('/save', async (req, res) => {
  try {
    const { email, topic, score, total } = req.body;

    // Check if any field is missing
    if (!email || !topic || score === undefined || total === undefined) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    // Save the result in the DB
    const history = new QuizHistory({ email, topic, score, total });
    await history.save();

    res.json({ message: 'Saved successfully' });
  } catch (err) {
    console.error('Error saving quiz history:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/weak-topics', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Missing email' });

    const history = await QuizHistory.find({ email });

    const topicScores = {};
    for (const { topic, score, total } of history) {
      if (!topicScores[topic]) topicScores[topic] = { score: 0, total: 0 };
      topicScores[topic].score += score;
      topicScores[topic].total += total;
    }

    const weakTopics = Object.entries(topicScores)
      .filter(([_, { score, total }]) => score / total < 0.7)
      .map(([topic]) => topic);

    res.json({ weakTopics });
  } catch (err) {
    console.error('Error getting weak topics:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


export default router;