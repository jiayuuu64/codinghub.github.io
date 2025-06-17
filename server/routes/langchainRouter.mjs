import express from "express";
import axios from "axios";
const router = express.Router();

router.post("/generate-recommendation", async (req, res) => {
  const { score, courseTitle } = req.body;

  try {
    const response = await axios.post("http://localhost:5005/recommend", {
      score,
      courseTitle
    });

    res.json({ recommendations: response.data.recommendations });
  } catch (err) {
    console.error("LangChain error:", err.message);
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
});

export default router;
