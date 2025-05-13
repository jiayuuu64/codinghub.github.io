import jwt from "jsonwebtoken";

// Use a fallback secret key if APP_SECRET is not defined
const APP_SECRET = process.env.APP_SECRET || "fallback_secret_for_dev";

// if (!process.env.APP_SECRET) {
//     console.info(
//         "INFO: APP_SECRET is not defined. Using fallback secret for development/testing."
//     );
// }

// Optional: Log the secret only if in a development environment
if (process.env.NODE_ENV === "development") {
    console.log("APP_SECRET being used:", APP_SECRET);
}

export const generateToken = (payload, expiresIn = "3d") => {
    return jwt.sign(payload, APP_SECRET, { expiresIn });
};

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, APP_SECRET);
    } catch (err) {
        return null; // Return null or handle verification failure appropriately
    }
};
