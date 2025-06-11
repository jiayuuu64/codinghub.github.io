import express from "express";
import { loginUser, registerUser, experiencePreference, commitmentPreference, languagePreference, initiatePasswordRecovery, resetPassword, getUserPreferences, updateAvatar, updateUserProfile, changePassword, completeLesson, completeQuiz, getProgress, getAllUserProgress } from "../controller/authFunctions.mjs";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/language-preference", languagePreference);
router.post("/experience-preference", experiencePreference);
router.post("/commitment-preference", commitmentPreference);
router.post("/recover-password", initiatePasswordRecovery);
router.post("/reset-password", resetPassword);
router.get('/user-preferences', getUserPreferences);
router.post('/update-avatar', updateAvatar);
router.post('/update-profile', updateUserProfile);
router.post('/change-password', changePassword);
router.post('/progress/:courseId/complete-lesson', completeLesson);
router.post('/:email/progress/:courseId/complete-quiz', completeQuiz);
router.get('/:email/progress/:courseId', getProgress);
router.get('/:email/progress', getAllUserProgress);

export default router;
