import express from 'express';
import { OpenAI } from 'openai';
import User from '../db/models/User.mjs';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/custom', async (req, res) => {
  const { email, topic, numQuestions } = req.body;

  if (!email || !topic || !numQuestions) {
    return res.status(400).json({ error: 'Missing email, topic, or numQuestions.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const experience = user.experiencePreference || 'Complete Beginner';

    const prompt = `
You are an expert Python tutor.
Generate ${numQuestions} multiple-choice quiz questions on the topic of "${topic}" for a ${experience} Python learner.
Each question should include:
- "question" (short and clear)
- "options" (array of 3–4 choices)
- "answer" (correct option)
- "explanation" (1 sentence why it's correct)

Respond ONLY with JSON in this format:
[
  {
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "answer": "A",
    "explanation": "..."
  }
]
`;

    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      messages: [
        { role: 'system', content: 'You are a helpful Python tutor.' },
        { role: 'user', content: prompt }
      ]
    });

    const raw = chatResponse.choices[0].message.content.trim();

    // Extract the JSON block even if there is extra explanation
    const match = raw.match(/\[\s*{[\s\S]*?}\s*\]/);
    if (!match) {
      console.error('No valid JSON array found in OpenAI response');
      return res.status(500).json({ error: 'OpenAI did not return valid JSON.' });
    }

    let quizData;
    try {
      quizData = JSON.parse(match[0]);
    } catch (e) {
      console.error('Failed to parse OpenAI JSON:', e);
      return res.status(500).json({ error: 'Failed to parse OpenAI response. Try again.' });
    }

    res.status(200).json({ quiz: quizData });

  } catch (err) {
    console.error('Error in quiz generation route:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;