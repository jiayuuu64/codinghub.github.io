import express from 'express';
import dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';

dotenv.config();
const router = express.Router();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

router.post('/custom', async (req, res) => {
  try {
    const { email, topic, numQuestions } = req.body;

    if (!topic || !numQuestions || !email) {
      return res.status(400).json({ error: 'Missing fields in request body' });
    }

    const prompt = `Generate ${numQuestions} beginner-level multiple choice quiz questions with 4 options each. 
For each question, provide:
- The exact correct answer as text (not letters).
- A short explanation (1-2 sentences) explaining why that option is correct.

Topic: ${topic}.
Format:
1. Question text
A. Option A
B. Option B
C. Option C
D. Option D
Answer: exact text of the correct option (example: "Answer: Boolean")
Explanation: brief explanation why this is correct.

Important:
- Do not write "Answer: A" or "Answer: B".
- Only write the actual text in "Answer:".
- Always include "Explanation:" after the answer.
- Do not mention option letters in the answer.
(Repeat for all questions)`;

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const quiz = completion.data.choices[0].message.content;

    res.json({ quiz });
  } catch (err) {
    console.error('Error in quiz generation route:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;