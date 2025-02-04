import { MongoClient } from 'mongodb';

let client = null;
let db = null;

// Connect to MongoDB
export async function connect() {
    try {
        if (!client) {
            // Only create a new client if one doesn't exist
            const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/test_db';
            client = new MongoClient(uri);
            await client.connect();
            console.log("Connected to MongoDB");
            db = client.db(process.env.DB_NAME);
        }
        return db;
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}

// Disconnect from MongoDB
export async function disconnect() {
    try {
        if (client) {
            await client.close();
            client = null;
            db = null;
            console.log("Disconnected from MongoDB");
        }
    } catch (error) {
        console.error("Error disconnecting from MongoDB:", error);
        throw error;
    }
}
