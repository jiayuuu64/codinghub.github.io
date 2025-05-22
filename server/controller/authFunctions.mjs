// Users Login
import db from "../db/conn.mjs";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { generateToken } from "../utils/token.mjs";

// Users Login
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const usersCollection = db.collection("users");
        const user = await usersCollection.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(403).json({ message: "Invalid email or password" });
        }

        // Generate token
        const token = generateToken({ id: user._id, email: user.email });

        // Check preferences from database
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

        const result = await usersCollection.insertOne(newUser); // 👈 get result
        const insertedId = result.insertedId; // 👈 this is the ObjectId

        res.status(201).json({
            message: "Registered successfully",
            userId: insertedId.toString() // Optional: send as string
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Save Language Preference
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

// Save Experience Preference
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

// Save Commitment Preference
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

