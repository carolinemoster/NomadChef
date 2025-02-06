import { MongoClient } from 'mongodb';

// These variables persist across Lambda invocations in the same container
let cachedClient = null;
let cachedDb = null;

// Connect to MongoDB
export async function connect() {
    // First, check if we have a valid cached connection
    if (cachedClient && cachedDb) {
        try {
            // Verify the connection still works
            await cachedClient.db().admin().ping();
            return cachedDb;  // Reuse existing connection
        } catch (error) {
            // Reset if connection is dead
            cachedClient = null;
            cachedDb = null;
        }
    }

    // Create new connection if needed
    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/test_db';
        const client = new MongoClient(uri, {
            maxPoolSize: 1  // Important for Lambda
        });
        await client.connect();
        const db = client.db(process.env.DB_NAME);
        
        // Cache for reuse in future invocations
        cachedClient = client;
        cachedDb = db;
        
        return cachedDb;
    } catch (error) {
        throw error;
    }
}

// Keep this method for cleanup during Lambda container shutdown
// but don't use it after regular operations
export async function disconnect() {
    try {
        if (cachedClient) {
            await cachedClient.close();
            cachedClient = null;
            cachedDb = null;
            console.log("Disconnected from MongoDB");
        }
    } catch (error) {
        console.error("Error disconnecting from MongoDB:", error);
        throw error;
    }
}
