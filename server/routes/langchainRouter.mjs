import express from 'express';
import dotenv from 'dotenv';
import pkg from 'openai';
import User from '../db/models/User.mjs';
import Course from '../db/models/Course.mjs';

dotenv.config();

const { Configuration, OpenAIApi } = pkg;

const router = express.Router();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

router.post('/recommend', async (req, res) => {
  const { score, courseTitle, email } = req.body;

  if (!score || !courseTitle || !email) {
    return res.status(400).json({ error: 'Missing score, courseTitle, or email' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Server misconfiguration: Missing OpenAI API key' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const course = await Course.findOne({ title: courseTitle });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const prompt = `
A student just completed a ${courseTitle} quiz and scored ${score}/15.
Based on this, recommend 3 helpful videos, articles, or exercises to improve.
Reply clearly using emojis and bullet points.
`;

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      messages: [
        { role: 'system', content: 'You are a smart AI tutor helping students improve.' },
        { role: 'user', content: prompt }
      ]
    });

    const reply = response.data.choices[0].message.content;

    // Save score and recommendation to user progress
    const progress = user.progress.find(p => p.courseId?.toString() === course._id.toString());
    if (progress) {
      progress.finalQuizScore = score;
      progress.recommendations = reply.split('\n').filter(line => line.trim() !== '');
    }

    await user.save();

    res.status(200).json({ recommendations: reply });

  } catch (err) {
    console.error('LangChain Error:', err);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

export default router;
