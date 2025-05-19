import express from "express";
import cors from "cors";
import userRouter from "./routes/userRouter.mjs";

const PORT = process.env.PORT || 10000;
const app = express();

app.use(cors({
    origin: ['https://jiayuuu64.github.io', 'https://codinghub-r3bn.onrender.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());

// Mount user routes at /api/users
app.use("/api/users", userRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port: http://localhost:${PORT}`);
});
