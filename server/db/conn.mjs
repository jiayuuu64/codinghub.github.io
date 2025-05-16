import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const client = new MongoClient(process.env.MONGO_URI);

let conn;
try {
    console.log("Connecting to MongoDB Atlas...");
    conn = await client.connect();
    console.log("Connected successfully to MongoDB Atlas");
} catch (e) {
    console.error("Failed to connect to MongoDB Atlas", e);
    process.exit(1);
}

const db = conn.db("codehub");

export default db;
