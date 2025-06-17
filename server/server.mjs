import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRouter from "./routes/userRouter.mjs";
import courseRouter from './routes/courseRouter.mjs';
import lessonRouter from './routes/lessonRouter.mjs';
import quizGenRouter from './routes/quizGenRouter.mjs';

dotenv.config();

const PORT = process.env.PORT || 10000;
const app = express();

// ✅ Connect to MongoDB via Mongoose
console.log("🧠 Connecting to MongoDB with Mongoose...");
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB via Mongoose"))
  .catch(err => {
    console.error("❌ Mongoose connection failed:", err.message);
    process.exit(1);
  });

app.use(cors({
    origin: [
        'http://localhost:5173',          // Local frontend dev URL
        'https://jiayuuu64.github.io',   // GitHub Pages frontend URL
        'https://codinghub-r3bn.onrender.com' // Render backend URL
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use(express.json({ limit: '5mb' }));

app.use("/api/users", userRouter);
app.use("/api/courses", courseRouter);
app.use('/api/lessons', lessonRouter);
app.use('/api/quiz-generator', quizGenRouter);


app.listen(PORT, () => {
    console.log(`🚀 Server is running on port: http://localhost:${PORT}`);
});
