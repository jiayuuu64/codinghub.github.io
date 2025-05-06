import express from "express";
import cors from "cors";
import loginRoutes from "./routes/login.mjs";

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());

app.use("/login", loginRoutes);


// start the Express server
app.listen(PORT, ()=> {
    console.log(`Server is running on port: http://localhost:${PORT}`);
});