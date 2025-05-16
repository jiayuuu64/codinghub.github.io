import express from "express";
import cors from "cors";
import userRouter from "./routes/userRouter.mjs";

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());

// Mount user routes at /api/users
app.use("/api/users", userRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port: http://localhost:${PORT}`);
});
