import { verifyToken } from "../utils/token.mjs";

export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded) {
        return res.status(403).json({ message: "Invalid token" });
    }

    req.user = decoded;
    next();
};
