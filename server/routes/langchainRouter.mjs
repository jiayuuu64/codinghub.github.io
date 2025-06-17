import express from 'express';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import dotenv from 'dotenv';
dotenv.config();
import { Headers } from 'node-fetch'; 
globalThis.Headers = Headers;

const router = express.Router();

router.post('/recommend', async (req, res) => {
  const { score, courseTitle, email } = req.body;

  if (!score || !courseTitle || !email) {
    return res.status(400).json({ error: 'Missing score, courseTitle, or email.' });
  }

  try {
    // ✅ Define the prompt template
    const template = PromptTemplate.fromTemplate(`
      A student completed a {course} quiz and scored {score}/15.
      Recommend 3 helpful follow-up videos, articles, or tips for this student.
      Format nicely using emojis and bullet points.
    `);

    // ✅ Fill in the prompt
    const prompt = await template.format({ course: courseTitle, score });

    // ✅ Initialize OpenAI model
    const model = new ChatOpenAI({
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY
    });

    // ✅ Get recommendations
    const response = await model.invoke(prompt);

    return res.status(200).json({ recommendations: response });
  } catch (err) {
    console.error("🔥 LangChain error:", err);
    return res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

export default router;
