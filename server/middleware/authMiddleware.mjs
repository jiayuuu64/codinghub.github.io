import bcrypt from "bcrypt";
import { generateToken } from "../utils/token.mjs";
import db from "../db/conn.mjs";

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await db.collection("users").findOne({ email });
        if (!user) return res.status(401).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const token = generateToken({ id: user._id, email: user.email });
        res.status(200).json({ token, email, message: "Login successful" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};


