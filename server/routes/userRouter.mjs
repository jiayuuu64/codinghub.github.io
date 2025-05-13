import express from "express";
import { loginUser, registerUser, experiencePreference, commitmentPreference, languagePreference } from "../controller/authFunctions.mjs";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/language-preference", languagePreference);
router.post("/experience-preference", experiencePreference);
router.post("/commitment-preference", commitmentPreference);

export default router;
