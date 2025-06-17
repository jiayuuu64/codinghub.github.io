import express from 'express';
import fetch from 'node-fetch';
const router = express.Router();

router.post('/recommend', async (req, res) => {
  try {
    const response = await fetch('https://your-flask-langchain-url.onrender.com/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error('LangChain Proxy Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch LangChain recommendation.' });
  }
});

export default router;
