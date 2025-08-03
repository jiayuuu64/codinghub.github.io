import express from 'express';
import dotenv from 'dotenv';
import User from '../db/models/User.mjs';
import Course from '../db/models/Course.mjs';

dotenv.config();

const router = express.Router();

const pythonArticles = [
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

const pythonVideos = [
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

const htmlcssArticles = [
  { title: "W3Schools HTML Tutorial", link: "https://www.w3schools.com/html/" },
  { title: "W3Schools CSS Tutorial", link: "https://www.w3schools.com/css/" },
  { title: "MDN Web Docs: HTML", link: "https://developer.mozilla.org/en-US/docs/Web/HTML" },
  { title: "MDN Web Docs: CSS", link: "https://developer.mozilla.org/en-US/docs/Web/CSS" },
  { title: "HTML.com Beginner Guide", link: "https://html.com/" },
  { title: "CSS-Tricks Guides", link: "https://css-tricks.com/guides/" },
  { title: "FreeCodeCamp HTML/CSS Certification", link: "https://www.freecodecamp.org/learn/responsive-web-design/" },
  { title: "GeeksforGeeks HTML Tutorial", link: "https://www.geeksforgeeks.org/html/" },
  { title: "GeeksforGeeks CSS Tutorial", link: "https://www.geeksforgeeks.org/css/" },
];

const htmlcssVideos = [
  { title: "HTML Full Course - freeCodeCamp", link: "https://www.youtube.com/watch?v=pQN-pnXPaVg" },
  { title: "CSS Crash Course for Beginners", link: "https://www.youtube.com/watch?v=1Rs2ND1ryYc" },
  { title: "HTML & CSS in 100 Seconds", link: "https://www.youtube.com/watch?v=OEV8gMkCHXQ" },
  { title: "Responsive Web Design - Codevolution", link: "https://www.youtube.com/watch?v=HcOc7P5BMi4" },
  { title: "HTML & CSS Crash Course - Traversy Media", link: "https://www.youtube.com/watch?v=UB1O30fR-EE" },
  { title: "HTML Tutorial for Beginners - Mosh", link: "https://www.youtube.com/watch?v=qz0aGYrrlhU" },
  { title: "CSS Tutorial for Beginners - Mosh", link: "https://www.youtube.com/watch?v=1PnVor36_40" },
  { title: "HTML/CSS Flexbox Tutorial", link: "https://www.youtube.com/watch?v=fYq5PXgSsbE" },
  { title: "HTML/CSS Grid Layout Crash Course", link: "https://www.youtube.com/watch?v=rg7Fvvl3taU" }
];

const jsArticles = [
  { title: "W3Schools JavaScript Tutorial", link: "https://www.w3schools.com/js/" },
  { title: "MDN Web Docs: JavaScript Guide", link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide" },
  { title: "JavaScript.info - Modern JS Tutorial", link: "https://javascript.info/" },
  { title: "FreeCodeCamp JS Certification", link: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/" },
  { title: "GeeksforGeeks JavaScript Guide", link: "https://www.geeksforgeeks.org/javascript/" },
  { title: "TutorialsPoint JavaScript", link: "https://www.tutorialspoint.com/javascript/index.htm" },
  { title: "Programiz JavaScript Guide", link: "https://www.programiz.com/javascript" }
];

const jsVideos = [
  { title: "JavaScript Tutorial for Beginners - Mosh", link: "https://www.youtube.com/watch?v=W6NZfCO5SIk" },
  { title: "JavaScript Crash Course - Traversy Media", link: "https://www.youtube.com/watch?v=hdI2bqOjy3c" },
  { title: "JavaScript Full Course - FreeCodeCamp", link: "https://www.youtube.com/watch?v=jS4aFq5-91M" },
  { title: "Learn JavaScript in 12 Minutes", link: "https://www.youtube.com/watch?v=Ukg_U3CnJWI" },
  { title: "JS in 100 Seconds", link: "https://www.youtube.com/watch?v=DHjqpvDnNGE" }
];

const sqlArticles = [
  { title: "W3Schools SQL Tutorial", link: "https://www.w3schools.com/sql/" },
  { title: "Mode SQL Tutorial for Beginners", link: "https://mode.com/sql-tutorial/" },
  { title: "FreeCodeCamp SQL Certification", link: "https://www.freecodecamp.org/learn/relational-database/" },
  { title: "SQLBolt Interactive Tutorial", link: "https://sqlbolt.com/" },
  { title: "GeeksforGeeks SQL Guide", link: "https://www.geeksforgeeks.org/sql-tutorial/" },
  { title: "TutorialsPoint SQL", link: "https://www.tutorialspoint.com/sql/" }
];

const sqlVideos = [
  { title: "SQL Tutorial - Full Database Course for Beginners", link: "https://www.youtube.com/watch?v=HXV3zeQKqGY" },
  { title: "SQL in 100 Seconds", link: "https://www.youtube.com/watch?v=zsjvFFKOm3c" },
  { title: "Learn SQL in 1 Hour", link: "https://www.youtube.com/watch?v=9Pzj7Aj25lw" },
  { title: "MySQL Full Course - Programming with Mosh", link: "https://www.youtube.com/watch?v=7S_tz1z_5bA" }
];

// Randomly select `n` items from an array
function getRandomItems(arr, n) {
  const shuffled = arr.sort(() => 0.5 - Math.random()); // Shuffle array
  return shuffled.slice(0, n); // Return first `n` elements
}

// === Main Recommendation Route ===
router.post('/recommend', async (req, res) => {
  const { score, courseTitle, email } = req.body;

  // Validate inputs
  if (score === undefined || !courseTitle || !email) {
    return res.status(400).json({ error: 'Missing score, courseTitle, or email' });
  }

  try {
    // Find user in the database
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Find course in the database
    const course = await Course.findOne({ title: courseTitle });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    let selectedArticles = [];
    let selectedVideos = [];

    // Match course title to content category
    const lower = courseTitle.toLowerCase();
    if (lower.includes('html') || lower.includes('css')) {
      selectedArticles = getRandomItems(htmlcssArticles, 2); // 2 articles
      selectedVideos = getRandomItems(htmlcssVideos, 1);     // 1 video
    } else if (lower.includes('javascript')) {
      selectedArticles = getRandomItems(jsArticles, 2);
      selectedVideos = getRandomItems(jsVideos, 1);
    } else if (lower.includes('sql')) {
      selectedArticles = getRandomItems(sqlArticles, 2);
      selectedVideos = getRandomItems(sqlVideos, 1);
    } else {
      // Default to Python
      selectedArticles = getRandomItems(pythonArticles, 2);
      selectedVideos = getRandomItems(pythonVideos, 1);
    }

    // Format recommendations as strings with emojis
    const recommendationLines = [
      ...selectedVideos.map(v => `📺 Video: "${v.title}" - ${v.link}`),
      ...selectedArticles.map(a => `📰 Article: "${a.title}" - ${a.link}`)
    ];

    // Update user's progress for this course
    const progress = user.progress.find(p => p.courseId?.toString() === course._id.toString());
    if (progress) {
      progress.finalQuizScore = score;                    // Save score
      progress.recommendations = recommendationLines;     // Save recommendations
    }

    // Save changes to user
    await user.save();

    // Return recommendations as response (joined with newline)
    res.status(200).json({ recommendations: recommendationLines.join('\n') });
  } catch (err) {
    console.error('Recommendation Error:', err);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

export default router;