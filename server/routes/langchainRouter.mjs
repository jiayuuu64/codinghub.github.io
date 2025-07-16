import express from 'express';
import dotenv from 'dotenv';
import User from '../db/models/User.mjs';
import Course from '../db/models/Course.mjs';

dotenv.config();

const router = express.Router();

const articles = [
  { title: "Python Programming Guide for Beginners", link: "https://realpython.com/python-basics/" },
  { title: "W3Schools Python Tutorial", link: "https://www.w3schools.com/python/" },
  { title: "GeeksforGeeks Python Tutorial", link: "https://www.geeksforgeeks.org/python-programming-language/" },
  { title: "Python Official Docs", link: "https://docs.python.org/3/tutorial/" },
  { title: "FreeCodeCamp Python Article", link: "https://www.freecodecamp.org/news/learn-python-basics/" },
  { title: "Programiz Python Basics", link: "https://www.programiz.com/python-programming" },
  { title: "RealPython Advanced Guide", link: "https://realpython.com/tutorials/python/" },
  { title: "Hackr.io Python Resources", link: "https://hackr.io/tutorials/learn-python" },
  { title: "Python Cheatsheet", link: "https://www.pythoncheatsheet.org/" },
  { title: "Codecademy Python", link: "https://www.codecademy.com/learn/learn-python-3" },
  { title: "Coursera Python Course", link: "https://www.coursera.org/learn/python" },
  { title: "LearnPython.org", link: "https://www.learnpython.org/" },
  { title: "Python Spot Tutorial", link: "https://pythonspot.com/en/" },
  { title: "Python Tutor Visualizer", link: "https://pythontutor.com/" }
];

const videos = [
  { title: "Python Tutorial for Beginners", link: "https://www.youtube.com/watch?v=_uQrJ0TkZlc" },
  { title: "Learn Python - Full Course", link: "https://www.youtube.com/watch?v=rfscVS0vtbw" },
  { title: "Python Crash Course", link: "https://www.youtube.com/watch?v=JJmcL1N2KQs" },
  { title: "Python for Absolute Beginners", link: "https://www.youtube.com/watch?v=kqtD5dpn9C8" },
  { title: "Python Basics - Corey Schafer", link: "https://www.youtube.com/watch?v=YYXdXT2l-Gg" },
  { title: "Automate with Python", link: "https://www.youtube.com/watch?v=1F_OgqRuSdI" },
  { title: "Python OOP Tutorial", link: "https://www.youtube.com/watch?v=JeznW_7DlB0" },
  { title: "Python in 100 Seconds", link: "https://www.youtube.com/watch?v=x7X9w_GIm1s" },
  { title: "Python for Data Science", link: "https://www.youtube.com/watch?v=LHBE6Q9XlzI" },
  { title: "Python Practice Project", link: "https://www.youtube.com/watch?v=DLn3jOsNRVE" },
];

// Random utility
function getRandomItems(arr, n) {
  const shuffled = arr.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

// Main route
router.post('/recommend', async (req, res) => {
  const { score, courseTitle, email } = req.body;

  if (score === undefined || !courseTitle || !email) {
    return res.status(400).json({ error: 'Missing score, courseTitle, or email' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const course = await Course.findOne({ title: courseTitle });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const selectedArticles = getRandomItems(articles, 2);
    const selectedVideos = getRandomItems(videos, 1);

    const recommendationLines = [
      ...selectedVideos.map(v => `📺 Video: "${v.title}" - ${v.link}`),
      ...selectedArticles.map(a => `📰 Article: "${a.title}" - ${a.link}`)
    ];

    const progress = user.progress.find(p => p.courseId?.toString() === course._id.toString());
    if (progress) {
      progress.finalQuizScore = score;
      progress.recommendations = recommendationLines;
    }

    await user.save();

    res.status(200).json({ recommendations: recommendationLines.join('\n') });
  } catch (err) {
    console.error('Recommendation Error:', err);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

export default router;
