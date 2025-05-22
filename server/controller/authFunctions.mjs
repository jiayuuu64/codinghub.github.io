import db from "../db/conn.mjs";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { generateToken } from "../utils/token.mjs";
import nodemailer from "nodemailer";
import crypto from "crypto";

// OPTIONAL: Basic password strength checker
const validatePasswordStrength = (password) => {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return strongRegex.test(password) ? 'strong' : 'weak';
};

// Email sender inline function
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
            <p>We received a request to reset your password. Click below to reset it:</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>This link is valid for 1 hour. If you didn’t request this, you can ignore this email.</p>
        `
    };

    await transporter.sendMail(mailOptions);
};

// === Password Reset Functions ===
export const initiatePasswordRecovery = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });

    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ email });

    if (user) {
        const token = crypto.randomBytes(20).toString("hex");
        const expires = Date.now() + 3600000; // 1 hour

        await usersCollection.updateOne(
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
            message: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
        });
    }

    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({
        resetToken: token,
        resetTokenExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token." });

    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) return res.status(400).json({ message: "Use a different password." });

    const hashed = await bcrypt.hash(newPassword, 12);

    await usersCollection.updateOne(
        { email: user.email },
        {
            $set: { password: hashed },
            $unset: { resetToken: "", resetTokenExpires: "" },
        }
    );

    return res.status(200).json({ message: "Password reset successful." });
};

// === User Authentication ===
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const usersCollection = db.collection("users");
        const user = await usersCollection.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(403).json({ message: "Invalid email or password" });
        }

        const token = generateToken({ id: user._id, email: user.email });

        const languagePreference = user.languagePreference || null;
        const experiencePreference = user.experiencePreference || null;
        const commitmentPreference = user.commitmentPreference || null;

        res.status(200).json({
            token,
            email: user.email,
            languagePreference,
            experiencePreference,
            commitmentPreference,
            message: "Login successful",
        });
    } catch (err) {
        res.status(500).json({ message: "Something went wrong. Please try again." });
    }
};

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const nameRegex = /^[A-Za-z\s]+$/;
        if (!nameRegex.test(name)) {
            return res.status(400).json({ message: "Name must contain letters only." });
        }

        // ✅ Password strength validation
        if (validatePasswordStrength(password) !== "strong") {
            return res.status(400).json({
                message: "Password must be at least 8 characters and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
            });
        }

        const usersCollection = db.collection("users");

        const existingUser = await usersCollection.findOne({ email });
        if (existingUser && existingUser.isRegistered) {
            return res.status(400).json({ message: "Email is already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            name,
            email,
            password: hashedPassword,
        };

        const result = await usersCollection.insertOne(newUser);
        const insertedId = result.insertedId;

        res.status(201).json({
            message: "Registered successfully",
            userId: insertedId.toString()
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// === User Preferences ===
export const languagePreference = async (req, res) => {
    const { email, preference } = req.body;
    try {
        const result = await db.collection("users").updateOne(
            { email },
            { $set: { languagePreference: preference } }
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "Language preference saved" });
    } catch (err) {
        res.status(500).json({ message: "Failed to save language preference" });
    }
};

export const experiencePreference = async (req, res) => {
    const { email, preference } = req.body;
    try {
        const result = await db.collection("users").updateOne(
            { email },
            { $set: { experiencePreference: preference } }
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "Experience preference saved" });
    } catch (err) {
        res.status(500).json({ message: "Failed to save experience preference" });
    }
};

export const commitmentPreference = async (req, res) => {
    const { email, preference } = req.body;
    try {
        const result = await db.collection("users").updateOne(
            { email },
            { $set: { commitmentPreference: preference } }
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "Commitment preference saved" });
    } catch (err) {
        res.status(500).json({ message: "Failed to save commitment preference" });
    }
};

// Get user preferences and name
export const getUserPreferences = async (req, res) => {
    const { email } = req.query;
    try {
        const user = await db.collection("users").findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            name: user.name || '',
            languagePreference: user.languagePreference || '',
            experiencePreference: user.experiencePreference || '',
            commitmentPreference: user.commitmentPreference || ''
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to retrieve preferences" });
    }
};

// Save user profile picture (Base64)
export const updateAvatar = async (req, res) => {
    const { email, avatarBase64 } = req.body;
    if (!email || !avatarBase64) {
        return res.status(400).json({ message: "Email and avatar required." });
    }

    try {
        const result = await db.collection("users").updateOne(
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
