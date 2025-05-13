import express from "express";
import { loginUser, registerUser } from "../controller/authFunctions.mjs";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);

export default router;