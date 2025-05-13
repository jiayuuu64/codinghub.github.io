// Users Login
import db from "../db/conn.mjs";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { generateToken } from "../utils/token.mjs";

// Users Login
export const loginUser = async (req, res) => {
    console.log("Login endpoint hit"); // ✅ Debugging step

    try {
        const { email, password } = req.body;
        console.log("Request body:", req.body); // ✅ Debugging step

        if (!email || !password) {
            console.log("Missing email or password"); // ✅ Debugging step
            return res.status(400).json({ message: "Email and password are required" });
        }

        const usersCollection = db.collection("users");
        console.log("Searching for user with email:", email); // ✅ Debugging step

        // Check if user exists
        const user = await usersCollection.findOne({ email });
        console.log("User found in DB:", user); // ✅ Debugging step

        if (!user || !user.password) {
            console.log("Invalid email or password"); // ✅ Debugging step
            return res.status(404).json({ message: "Invalid email or password" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Password match result:", isMatch); // ✅ Debugging step

        if (!isMatch) {
            console.log("Password does not match"); // ✅ Debugging step
            return res.status(403).json({ message: "Invalid email or password" });
        }

        // Generate token
        const token = generateToken({ id: user._id, email: user.email });
        console.log("Token generated:", token); // ✅ Debugging step

        res.status(200).json({
            token,
            email: user.email, // Include email here
            message: "Login successful",
        });
    } catch (err) {
        console.log("Error occurred in loginUser:", err); // ✅ Debugging step
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
