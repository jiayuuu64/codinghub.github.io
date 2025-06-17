import express from 'express';
import { OpenAI } from 'openai';
import User from '../db/models/User.mjs';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/recommend', async (req, res) => {
  const { email, courseTitle, score } = req.body;

  if (!email || !courseTitle || score === undefined) {
    return res.status(400).json({ error: 'Missing email, courseTitle, or score.' });
  }

  try {
    const prompt = `
A student just completed a course titled "${courseTitle}" and scored ${score}/15 on the final quiz.
Based on their score, recommend 3 specific next steps to improve their skills or learn more. 
Be encouraging and suggest relevant videos or articles, ideally for a ${score < 10 ? 'beginner' : 'intermediate'} level.
Respond clearly in plain bullet points.
    `;

    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      messages: [
        { role: 'system', content: 'You are a helpful coding tutor.' },
        { role: 'user', content: prompt }
      ]
    });

    const recommendations = chatResponse.choices[0].message.content.trim();

    // Update user's progress in MongoDB
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Try to match courseId from progress array
    const progressItem = user.progress.find(p => {
      const course = p.courseId?.toString().toLowerCase() || '';
      return course.includes(courseTitle.toLowerCase()); // you can refine this logic
    });

    if (progressItem) {
      progressItem.finalQuizScore = score;
      progressItem.recommendations = recommendations.split('\n').filter(line => line.trim() !== '');
    }

    await user.save();

    res.status(200).json({ recommendations });
  } catch (err) {
    console.error('LangChain error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
