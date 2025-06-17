import express from 'express';
import fetch from 'node-fetch';
const router = express.Router();

// 🟢 Replace with your actual deployed Flask URL:
const FLASK_URL = 'https://langchain-server.onrender.com/recommend';

router.post('/recommend', async (req, res) => {
  try {
    const response = await fetch(FLASK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error('LangChain Proxy Error:', err.message);
    res.status(500).json({ error: 'LangChain fetch failed.' });
  }
});

export default router;
