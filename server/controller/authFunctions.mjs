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

// Update user profile
export const updateUserProfile = async (req, res) => {
    const { email, name, languagePreference, experiencePreference, commitmentPreference } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });
    try {
        const result = await db.collection("users").updateOne(
            { email },
            {
                $set: {
                    name,
                    languagePreference,
                    experiencePreference,
                    commitmentPreference
                }
            }
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "User not found." });
        }
        res.status(200).json({ message: "Profile updated successfully." });
    } catch (err) {
        res.status(500).json({ message: "Failed to update profile." });
    }
};

// Change password
export const changePassword = async (req, res) => {
    const { email, currentPassword, newPassword } = req.body;
    if (!email || !currentPassword || !newPassword) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const user = await db.collection("users").findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.collection("users").updateOne(
            { email },
            { $set: { password: hashedPassword } }
        );
        res.status(200).json({ message: "Password changed successfully." });
    } catch (err) {
        res.status(500).json({ message: "Failed to change password." });
    }
};
