import User from "../db/models/User.mjs";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/token.mjs";
import nodemailer from "nodemailer";
import crypto from "crypto";

// === Utility: Password Strength Validation ===
const validatePasswordStrength = (password) => {
    // Regular expression to check for uppercase, lowercase, digit, special character, and min length 8
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return strongRegex.test(password) ? 'strong' : 'weak'; // Return 'strong' or 'weak'
};

// === Utility: Send Reset Password Email ===
const sendPasswordResetEmail = async (email, token) => {
    // Construct the reset link to be sent via email
    const resetLink = `https://jiayuuu64.github.io/reset-password?token=${token}`;

    // Set up Nodemailer transporter with Gmail and environment credentials
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Email content and settings
    const mailOptions = {
        from: '"Coding Hub Support" <no-reply@codinghub.com>', // Display name and sender
        to: email, // Recipient
        subject: "Reset Your Password", // Subject line
        html: `
            <p>Hello,</p>
            <p>Click below to reset your password:</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>This link is valid for 1 hour.</p>
        `
    };

    // Send the email
    await transporter.sendMail(mailOptions);
};

// === Password Reset Flow ===

// Step 1: Send reset token to email
export const initiatePasswordRecovery = async (req, res) => {
    const { email } = req.body; // Extract email from request body
    if (!email) return res.status(400).json({ message: "Email is required." }); // Validate input

    const user = await User.findOne({ email }); // Look up user in DB
    if (user) {
        const token = crypto.randomBytes(20).toString("hex"); // Generate secure token
        const expires = Date.now() + 3600000; // 1 hour expiry

        // Save token and expiration to user record
        await User.updateOne(
            { email },
            { $set: { resetToken: token, resetTokenExpires: expires } }
        );

        // Send email with reset link
        await sendPasswordResetEmail(email, token);
    }

    // Respond with success regardless to avoid user enumeration
    return res.status(200).json({
        message: "If that email exists, a reset link will be sent.",
    });
};

// Step 2: Reset password using token
export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body; // Extract token and new password

    // Ensure all fields are present
    if (!token || !newPassword)
        return res.status(400).json({ message: "All fields are required." });

    // Check password strength
    if (validatePasswordStrength(newPassword) !== "strong") {
        return res.status(400).json({
            message: "Password must be strong (uppercase, lowercase, number, symbol).",
        });
    }

    // Find user with matching token and valid expiration
    const user = await User.findOne({
        resetToken: token,
        resetTokenExpires: { $gt: Date.now() }, // Ensure not expired
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token." });

    const isSame = await bcrypt.compare(newPassword, user.password); // Prevent reusing old password
    if (isSame) return res.status(400).json({ message: "Use a different password." });

    const hashed = await bcrypt.hash(newPassword, 12); // Hash new password

    // Update user with new password and clear reset token
    await User.updateOne(
        { email: user.email },
        {
            $set: { password: hashed },
            $unset: { resetToken: "", resetTokenExpires: "" }, // Remove token
        }
    );

    return res.status(200).json({ message: "Password reset successful." });
};

// === Login ===
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body; // Extract credentials
        const user = await User.findOne({ email }); // Lookup user

        // Validate password
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(403).json({ message: "Invalid email or password" });
        }

        const token = generateToken({ id: user._id, email: user.email }); // Generate JWT

        // Return user info + token
        res.status(200).json({
            token,
            email: user.email,
            isAdmin: user.isAdmin || false,
            languagePreference: user.languagePreference || null,
            experiencePreference: user.experiencePreference || null,
            commitmentPreference: user.commitmentPreference || null,
            message: "Login successful",
        });
    } catch (err) {
        res.status(500).json({ message: "Something went wrong." }); // Catch-all error
    }
};

// === Register ===
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body; // Extract inputs

        // Validate inputs
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (!/^[A-Za-z\s]+$/.test(name)) {
            return res.status(400).json({ message: "Name must contain letters only." });
        }

        if (validatePasswordStrength(password) !== "strong") {
            return res.status(400).json({
                message: "Password must be strong (uppercase, lowercase, number, symbol).",
            });
        }

        // Check for duplicate email
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email is already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10); // Hash password

        await User.create({ name, email, password: hashedPassword }); // Save new user

        res.status(201).json({ message: "Registered successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// === Preferences ===

// Save language preference
export const languagePreference = async (req, res) => {
    const { email, preference } = req.body;
    try {
        const result = await User.updateOne(
            { email },
            { $set: { languagePreference: preference } }
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "Language preference saved" });
    } catch (err) {
        res.status(500).json({ message: "Failed to save preference" });
    }
};

// Save experience preference
export const experiencePreference = async (req, res) => {
    const { email, preference } = req.body;
    try {
        const result = await User.updateOne(
            { email },
            { $set: { experiencePreference: preference } }
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "Experience preference saved" });
    } catch (err) {
        res.status(500).json({ message: "Failed to save preference" });
    }
};

// Save commitment preference
export const commitmentPreference = async (req, res) => {
    const { email, preference } = req.body;
    try {
        const result = await User.updateOne(
            { email },
            { $set: { commitmentPreference: preference } }
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "Commitment preference saved" });
    } catch (err) {
        res.status(500).json({ message: "Failed to save preference" });
    }
};

// Fetch all user preferences
export const getUserPreferences = async (req, res) => {
    const { email } = req.query;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            name: user.name || '',
            languagePreference: user.languagePreference || '',
            experiencePreference: user.experiencePreference || '',
            commitmentPreference: user.commitmentPreference || '',
            avatar: user.avatar || ''
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to retrieve preferences" });
    }
};

// === Profile Management ===

// Update the user's avatar (base64 string)
export const updateAvatar = async (req, res) => {
    const { email, avatarBase64 } = req.body;

    // Check required fields
    if (!email || !avatarBase64) {
        return res.status(400).json({ message: "Email and avatar required." });
    }

    try {
        // Update avatar in DB
        const result = await User.updateOne(
            { email },
            { $set: { avatar: avatarBase64 } }
        );

        // Handle user not found
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Profile picture updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Failed to update avatar" });
    }
};

// Update user profile details
export const updateUserProfile = async (req, res) => {
    const { email, name, languagePreference, experiencePreference, commitmentPreference } = req.body;

    // Email is required
    if (!email) {
        return res.status(400).json({ message: "Email is required." });
    }

    try {
        const user = await User.findOne({ email });

        // Check if user exists
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Update values only if provided
        user.name = name || user.name;
        user.languagePreference = languagePreference || user.languagePreference;
        user.experiencePreference = experiencePreference || user.experiencePreference;
        user.commitmentPreference = commitmentPreference || user.commitmentPreference;

        await user.save(); // Save changes
        res.status(200).json({ message: "Profile updated successfully." });
    } catch (err) {
        console.error("Update profile error:", err);
        res.status(500).json({ message: "Failed to update profile." });
    }
};

// === Change Password ===
export const changePassword = async (req, res) => {
    const { email, currentPassword, newPassword, confirmPassword } = req.body;

    // Validate input fields
    if (!email || !currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: "All fields are required." });
    }

    // Check if new password matches confirmation
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "New passwords do not match." });
    }

    // Check strength of new password
    if (validatePasswordStrength(newPassword) !== "strong") {
        return res.status(400).json({
            message: "Password must be at least 8 characters long, include uppercase, lowercase, number, and special character."
        });
    }

    try {
        const user = await User.findOne({ email });

        // Ensure user exists
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Validate current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect." });
        }

        // Hash and save new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password changed successfully." });
    } catch (err) {
        console.error("Change password error:", err);
        res.status(500).json({ message: "Failed to change password." });
    }
};

// === Learning Progress Tracking ===

// Mark a specific lesson as completed by user
export const completeLesson = async (req, res) => {
    const { courseId } = req.params;
    const { email } = req.query;
    const { lessonId } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }

    try {
        const user = await User.findOne({ email: email.toLowerCase() });

        // If user not found
        if (!user) return res.status(404).json({ message: 'User not found' });

        const courseIdStr = courseId.toString(); // Ensure courseId is treated as string

        // Try to find existing progress for the course
        let progress = user.progress.find(p => p.courseId.toString() === courseIdStr);

        // If not found, create a new progress entry
        if (!progress) {
            progress = {
                courseId: courseId,
                completedLessons: [],
                completedQuiz: false,
                recommendations: []
            };
            user.progress.push(progress);
        }

        // Add lessonId if not already in completedLessons
        if (!progress.completedLessons.map(id => id.toString()).includes(lessonId)) {
            progress.completedLessons.push(lessonId);
        }

        await user.save(); // Save progress
        res.status(200).json({ message: 'Lesson marked as completed', progress });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update progress', error: err.message });
    }
};

// Mark the quiz as completed for a course
export const completeQuiz = async (req, res) => {
    const { email, courseId } = req.params;

    try {
        const user = await User.findOne({ email });

        // Check if user exists
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Try to find or create progress for this course
        let progress = user.progress.find(p => p.courseId.toString() === courseId.toString());
        if (!progress) {
            progress = {
                courseId: courseId,
                completedLessons: [],
                completedQuiz: true,
                recommendations: []
            };
            user.progress.push(progress);
        } else {
            progress.completedQuiz = true; // Update quiz status
        }

        await user.save();
        res.status(200).json({ message: 'Quiz marked as completed', progress });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update quiz completion', error: err.message });
    }
};

// Fetch the progress for a specific course
export const getProgress = async (req, res) => {
    const { email, courseId } = req.params;
    try {
        const user = await User.findOne({ email });

        // Check for valid user
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Find progress entry by courseId
        const progress = user.progress.find(p => p.courseId.equals(courseId));
        res.status(200).json({ progress });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch progress', error: err.message });
    }
};

// Fetch all course progress for the user
export const getAllUserProgress = async (req, res) => {
    const { email } = req.params;

    try {
        const user = await User.findOne({ email });

        // Ensure user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user.progress || []); // Return all progress data
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch progress', error: err.message });
    }
};
