import express from 'express';
import bcrypt from 'bcrypt';
import db from '../db/conn.mjs'; 

const router = express.Router();

// Login Route
router.post("/", async (req, res) => {
    const { email, password } = req.body; // Get email and password from request body
    
    // Check if email and password were provided
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        // Find the student by email in the database
        const student = await db.collection("students").findOne({ email });

        // If no student is found with the given email
        if (!student) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        // Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, student.password);

        // If the passwords don't match
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        // If login is successful, send a success response
        res.status(200).json({
            message: "Login successful",
            student: {
                email: student.email,
                name: student.name
            }
        });

    } catch (error) {
        console.error("Error during login", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
