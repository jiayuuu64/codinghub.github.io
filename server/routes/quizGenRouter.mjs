// import dotenv from 'dotenv';
// import { Configuration, OpenAIApi } from 'openai';

// dotenv.config();
// const router = express.Router();

// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);

// router.post('/custom', async (req, res) => {
//   try {
//     const { email, topic, numQuestions } = req.body;

//     if (!topic || !numQuestions || !email) {
//       return res.status(400).json({ error: 'Missing fields in request body' });
//     }

//     const prompt = `Generate ${numQuestions} beginner-level multiple choice quiz questions with 4 options each. 
// For each question, provide:
// - The exact correct answer as text (not letters).
// - A short explanation (1-2 sentences) explaining why that option is correct.

// Topic: ${topic}.
// Format:
// 1. Question text
// A. Option A
// B. Option B
// C. Option C
// D. Option D
// Answer: exact text of the correct option (example: "Answer: Boolean")
// Explanation: brief explanation why this is correct.

// Important:
// - Do not write "Answer: A" or "Answer: B".
// - Only write the actual text in "Answer:".
// - Always include "Explanation:" after the answer.
// - Do not mention option letters in the answer.
// (Repeat for all questions)`;

//     const completion = await openai.createChatCompletion({
//       model: 'gpt-3.5-turbo',
//       messages: [{ role: 'user', content: prompt }],
//       temperature: 0.7,
//     });

//     const quiz = completion.data.choices[0].message.content;

//     res.json({ quiz });
//   } catch (err) {
//     console.error('Error in quiz generation route:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// export default router;

import express from 'express';
import dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';
import QuizHistory from '../db/models/QuizHistory.mjs';
import User from '../db/models/User.mjs';

dotenv.config();
const router = express.Router();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// ✅ Personalized quiz based on weak topics
router.post('/personalized', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Missing email' });

    const user = await User.findOne({ email });
    const experience = user?.experiencePreference || 'Beginner';

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

    if (weakTopics.length === 0) {
      return res.json({ message: "No weak topics found", quiz: [] });
    }

    // ✅ Smart calculation: number of questions
    const maxQuestions = 7;
    const questionsPerTopic = Math.floor(maxQuestions / weakTopics.length) || 1;
    const numQuestions = Math.min(maxQuestions, questionsPerTopic * weakTopics.length);

    const topicsList = weakTopics.join(", ");
    const prompt = `Generate ${numQuestions} beginner-level multiple choice quiz questions with 4 options each, based on the following weak topics: ${topicsList}.
For each question, provide:
- The exact correct answer as text (not letters).
- A short explanation (1-2 sentences) explaining why that option is correct.

Topics: ${topicsList}
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
    res.json({ quiz, weakTopics });

  } catch (err) {
    console.error('Error in personalized quiz generation:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
