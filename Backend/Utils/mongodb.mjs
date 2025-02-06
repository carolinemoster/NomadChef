import { MongoClient } from 'mongodb';

// These variables persist across Lambda invocations in the same container
let cachedClient = null;
let cachedDb = null;

// Connect to MongoDB
export async function connect() {
    if (cachedClient && cachedDb) {
        try {
            await cachedClient.db().admin().ping();
            return cachedDb;
        } catch (error) {
            console.log("Cached connection expired, creating new connection");
            cachedClient = null;
            cachedDb = null;
        }
    }

    // Create new connection if needed
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error('MONGO_URI environment variable is not set');
        }

        // Essential MongoDB connection options for Lambda
        const client = new MongoClient(uri, {
            maxPoolSize: 1,                    // Essential: Limit pool for Lambda
            serverSelectionTimeoutMS: 5000,    // Essential: Fail fast if can't connect
            socketTimeoutMS: 30000,            // Essential: Reasonable operation timeout
        });

        await client.connect();
        const db = client.db(process.env.DB_NAME);
        
        // Cache for reuse in future invocations
        cachedClient = client;
        cachedDb = db;
        
        console.log("New MongoDB connection established");
        return cachedDb;
    } catch (error) {
        console.error("MongoDB connection error:", error);
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
