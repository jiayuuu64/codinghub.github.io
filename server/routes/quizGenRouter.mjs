// server/routes/quizGenRouter.mjs
import express from 'express';
import dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';
import QuizHistory from '../db/models/QuizHistory.mjs';
import User from '../db/models/User.mjs';

dotenv.config();
const router = express.Router();

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

// simple normalizer (lowercase + collapse spaces)
// norm() is a helper that cleans up strings (lowercase + remove extra spaces)
const norm = (s = '') => s.toLowerCase().replace(/\s+/g, ' ').trim();

/**
 * POST /api/quiz-generator/personalized
 * body: { email }
 * returns: { quiz: string, weakTopics: string[], experience: string }
 */
router.post('/personalized', async (req, res) => {
  try {
    // Reads the email from the request body, converts to lowercase
    const email = (req.body?.email || '').toLowerCase();
    if (!email) return res.status(400).json({ error: 'Missing email' });

    // get user for experience preference (optional)
    const user = await User.findOne({ email });
    const experience = user?.experiencePreference || 'Beginner';

    // --- compute weak topics from history ---
    // Finds up to 500 recent quiz attempts for this user, newest first
    const history = await QuizHistory.find({ email }).sort({ timestamp: -1 }).limit(500);

    const topicScores = {};
    // Empty object to tally performance by topic
    // Lopps through each quiz attempt
    for (const { topic, score, total } of history) {
      if (!topic) continue; // Skip if no topic recorded
      if (!topicScores[topic]) topicScores[topic] = { score: 0, total: 0 }; // If this is the first time seeing this topic, initialise counters
      topicScores[topic].score += Number(score) || 0;
      topicScores[topic].total += Number(total) || 0; // Add scores and totals for that topic
    }

    // Creates an array of topcis where accuracy < 70%
    const weakTopics = Object.entries(topicScores)
      .filter(([, v]) => v.total > 0 && v.score / v.total < 0.7)
      .map(([topic]) => topic);

    if (weakTopics.length === 0) {
      return res.json({ message: 'No weak topics found', quiz: '', weakTopics: [], experience });
    }

    // --- collect recently seen exact stems (block list) + recently missed stems (for variants) ---
    const seenAgg = await QuizHistory.aggregate([
      { $match: { email, topic: { $in: weakTopics } } }, // Only match this user's weak-topic questions
      { $unwind: '$questionDetails' }, // Breaks apart array fields into separate documents (so each question is separate)
      {
        $project: {
          _id: 0,
          question: '$questionDetails.question',
          wasCorrect: '$questionDetails.wasCorrect',
          timestamp: 1
        } // Keeps only the fields you need: question, text, correctness, timestamp
      },
      { $sort: { timestamp: -1 } },
      { $limit: 400 }
      // Sort newest first, and limit to 400 recent questions
    ]);

    const seenExactStems = [];
    const recentlyMissedStems = [];
    const stemSet = new Set();
    // Array/Set to store past questions (for blocking repeats and missed ones (for variants))

    // For each question: normalise it, skip duplicates, keep only unique ones
    for (const r of seenAgg) {
      const q = norm(r.question || '');
      if (!q || stemSet.has(q)) continue;
      stemSet.add(q);

      // keep stems short for token economy
      if (seenExactStems.length < 140) seenExactStems.push(q.slice(0, 140));
      // Add to seen list (max 140 items, each capped at 140 characters)
      // If the question was answered wrong, also add it to missed list (max 80 items)
      if (r.wasCorrect === false && recentlyMissedStems.length < 80) {
        recentlyMissedStems.push(q.slice(0, 140));
      }
    }

    // Decide how many quiz questions to generate (max 7, divided evenly across weak topics)
    const MAX_Q = 7;
    const perTopic = Math.floor(MAX_Q / weakTopics.length) || 1;
    const numQuestions = Math.min(MAX_Q, perTopic * weakTopics.length);
    const topicsList = weakTopics.join(', ');

    // --- build the prompt (Topic line + strict Answer rule + avoid list) ---
    // Creates extra instructions for the AI to avoid repeating seen questions
    const avoidBlock = seenExactStems.length
      ? `Do NOT repeat or paraphrase any of these recently seen question stems:\n${seenExactStems.map((s,i)=>`${i+1}. ${s}`).join('\n')}\n`
      : '';

      // Creates extra instructions for the AI to make new versions of missed questions
    const variantsBlock = recentlyMissedStems.length
      ? `Where possible, include items that assess the same subskills as these commonly missed stems, but reword with different numbers/names/context:\n${recentlyMissedStems.map((s,i)=>`${i+1}. ${s}`).join('\n')}\n`
      : '';

      // Builds the full prompt to send to GPT, including rules, format, avoidBlock and variantsBlock
    const prompt = `You are generating a ${experience}-level multiple-choice quiz.
Create ${numQuestions} questions across these weaker topics: ${topicsList}.

Rules for EACH question:
- Add a line "Topic: <one of: ${topicsList}>" immediately BEFORE the question.
- Provide exactly 4 options (A–D).
- In "Answer:", output the exact TEXT of the correct option (not the letter).
- The 'Answer:' must EXACTLY match one of the option texts A–D. Do NOT invent a new answer not present in the options. Do not output letters.
- Do not wrap the answer in quotes.
- Provide a 1–2 sentence explanation.
- Vary contexts, variable names, and numbers so questions feel new.
${avoidBlock}${variantsBlock}
Format for each question:
Topic: <topic>
1. Question text
A. Option A
B. Option B
C. Option C
D. Option D
Answer: exact text of the correct option
Explanation: 1–2 sentences.`;

    // Sends the prompt to OpenAI and asks it to generate quiz questions
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.85,
      top_p: 0.9
    });

    // Extracts the generated quiz from the API response
    const quiz = completion.data.choices?.[0]?.message?.content || '';
    return res.json({ quiz, weakTopics, experience });
  } catch (err) {
    console.error('Error in personalized quiz generation:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;