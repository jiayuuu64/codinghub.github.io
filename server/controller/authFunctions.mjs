import User from "../db/models/User.mjs";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/token.mjs";
import nodemailer from "nodemailer";
import crypto from "crypto";

// Validate password strength
const validatePasswordStrength = (password) => {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return strongRegex.test(password) ? 'strong' : 'weak';
};

// Email sender
const sendPasswordResetEmail = async (email, token) => {
    const resetLink = `https://jiayuuu64.github.io/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: '"Coding Hub Support" <no-reply@codinghub.com>',
        to: email,
        subject: "Reset Your Password",
        html: `
            <p>Hello,</p>
            <p>Click below to reset your password:</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>This link is valid for 1 hour.</p>
        `
    };

    await transporter.sendMail(mailOptions);
};

// === Password Reset ===
export const initiatePasswordRecovery = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });

    const user = await User.findOne({ email });
    if (user) {
        const token = crypto.randomBytes(20).toString("hex");
        const expires = Date.now() + 3600000;

        await User.updateOne(
            { email },
            { $set: { resetToken: token, resetTokenExpires: expires } }
        );

        await sendPasswordResetEmail(email, token);
    }

    return res.status(200).json({
        message: "If that email exists, a reset link will be sent.",
    });
};

export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword)
        return res.status(400).json({ message: "All fields are required." });

    if (validatePasswordStrength(newPassword) !== "strong") {
        return res.status(400).json({
            message: "Password must be strong (uppercase, lowercase, number, symbol).",
        });
    }

    const user = await User.findOne({
        resetToken: token,
        resetTokenExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token." });

    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) return res.status(400).json({ message: "Use a different password." });

    const hashed = await bcrypt.hash(newPassword, 12);

    await User.updateOne(
        { email: user.email },
        {
            $set: { password: hashed },
            $unset: { resetToken: "", resetTokenExpires: "" },
        }
    );

    return res.status(200).json({ message: "Password reset successful." });
};

// === Login/Register ===
export const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(403).json({ message: "Invalid email or password" });
        }

        const token = generateToken({ id: user._id, email: user.email });

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
        res.status(500).json({ message: "Something went wrong." });
    }
};

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

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

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email is already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({ name, email, password: hashedPassword });

        res.status(201).json({ message: "Registered successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// === Preferences ===
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

export const updateAvatar = async (req, res) => {
    const { email, avatarBase64 } = req.body;
    if (!email || !avatarBase64) {
        return res.status(400).json({ message: "Email and avatar required." });
    }

    try {
        const result = await User.updateOne(
            { email },
            { $set: { avatar: avatarBase64 } }
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "Profile picture updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Failed to update avatar" });
    }
};

export const updateUserProfile = async (req, res) => {
    const { email, name, languagePreference, experiencePreference, commitmentPreference } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email is required." });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        user.name = name || user.name;
        user.languagePreference = languagePreference || user.languagePreference;
        user.experiencePreference = experiencePreference || user.experiencePreference;
        user.commitmentPreference = commitmentPreference || user.commitmentPreference;

        await user.save();
        res.status(200).json({ message: "Profile updated successfully." });
    } catch (err) {
        console.error("Update profile error:", err);
        res.status(500).json({ message: "Failed to update profile." });
    }
};


// Change password
export const changePassword = async (req, res) => {
    const { email, currentPassword, newPassword, confirmPassword } = req.body;

    if (!email || !currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: "All fields are required." });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "New passwords do not match." });
    }

    if (validatePasswordStrength(newPassword) !== "strong") {
        return res.status(400).json({
            message: "Password must be at least 8 characters long, include uppercase, lowercase, number, and special character."
        });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password changed successfully." });
    } catch (err) {
        console.error("Change password error:", err);
        res.status(500).json({ message: "Failed to change password." });
    }
};

export const completeLesson = async (req, res) => {
  const { courseId } = req.params;
  const { email } = req.query;
  const { lessonId } = req.body;

console.log('✅ Email received:', email);
  console.log('✅ Lesson ID received:', lessonId);

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const courseIdStr = courseId.toString(); // Ensure string comparison
    let progress = user.progress.find(p => p.courseId.toString() === courseIdStr);

    if (!progress) {
      progress = {
        courseId: courseId, // Keep as ObjectId
        completedLessons: [],
        completedQuiz: false,
        recommendations: []
      };
      user.progress.push(progress);
    }

    if (!progress.completedLessons.map(id => id.toString()).includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    }

    await user.save();
    res.status(200).json({ message: 'Lesson marked as completed', progress });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update progress', error: err.message });
  }
};




export const completeQuiz = async (req, res) => {
  const { email, courseId } = req.params;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

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
      progress.completedQuiz = true;
    }

    await user.save();
    res.status(200).json({ message: 'Quiz marked as completed', progress });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update quiz completion', error: err.message });
  }
};


export const getProgress = async (req, res) => {
    const { email, courseId } = req.params;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const progress = user.progress.find(p => p.courseId.equals(courseId));
        res.status(200).json({ progress });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch progress', error: err.message });
    }
};

export const getAllUserProgress = async (req, res) => {
  const { email } = req.params;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return all progress
    res.status(200).json(user.progress || []);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch progress', error: err.message });
  }
};


