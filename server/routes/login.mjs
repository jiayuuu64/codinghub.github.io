import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db/conn.mjs'; // Adjust the path if needed

const router = express.Router();

// Secret key for JWT signing and encryption
const JWT_SECRET = process.env.JWT_SECRET || "SECRET_KEY"; 

// Login Route
router.post("/login", async (req, res) => {
    const { email, password } = req.body; // Get email and password from request body
    
    // Check if email and password were provided
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required!" });
    }

    try {
        // Find the student by email in the database
        const student = await db.collection("users").findOne({ email });

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

        // If login is successful, create a JWT token
        const token = jwt.sign(
            { id: student._id, email: student.email },
            JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        // Send the token and user details back in the response
        res.status(200).json({
            message: "Login successful",
            token, // Send the token
            student: {
                email: student.email,
                name: student.name,
            },
        });

    } catch (error) {
        console.error("Error during login", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
