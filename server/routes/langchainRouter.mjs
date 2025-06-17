import express from 'express';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/recommend', async (req, res) => {
  const { score, courseTitle, email } = req.body;

  if (!score || !courseTitle || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const prompt = `
A student just completed a final quiz for the course "${courseTitle}" and scored ${score}/15.
Recommend 3 follow-up resources — videos, topics, or articles — to help them improve.
Respond in bullet points and use simple, motivating language.
`;

  try {
    const chat = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      messages: [
        { role: 'system', content: 'You are an educational coach that gives follow-up study tips.' },
        { role: 'user', content: prompt }
      ]
    });

    const recommendations = chat.choices[0].message.content;
    res.json({ recommendations });

  } catch (err) {
    console.error('LangChain error:', err);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

export default router;
