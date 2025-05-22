import express from "express";
import { loginUser, registerUser, experiencePreference, commitmentPreference, languagePreference, getUserPreferences} from "../controller/authFunctions.mjs";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/language-preference", languagePreference);
router.post("/experience-preference", experiencePreference);
router.post("/commitment-preference", commitmentPreference);
router.get('/user-preferences', getUserPreferences);

export default router;
