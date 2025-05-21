import db from "../db/conn.mjs";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { generateToken } from "../utils/token.mjs";
import nodemailer from "nodemailer";
import crypto from "crypto";

// Password strength checker
const validatePasswordStrength = (password) => {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return strongRegex.test(password) ? 'strong' : 'weak';
};

// Send password reset email
const sendPasswordResetEmail = async (email, token) => {
    const resetLink = `https://jiayuuu64.github.io/#/reset-password?token=${token}`;
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

export const initiatePasswordRecovery = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });

    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ email });

    if (user) {
        const token = crypto.randomBytes(20).toString("hex");
        const expires = Date.now() + 3600000;

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

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (validatePasswordStrength(password) !== "strong") {
            return res.status(400).json({
                message: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
            });
        }

        const nameRegex = /^[A-Za-z\s]+$/;
        if (!nameRegex.test(name)) {
            return res.status(400).json({ message: "Name must contain letters only." });
        }

        const usersCollection = db.collection("users");

        const existingUser = await usersCollection.findOne({ email });
        if (existingUser && existingUser.isRegistered) {
            return res.status(400).json({ message: "Email is already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = { name, email, password: hashedPassword };

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
