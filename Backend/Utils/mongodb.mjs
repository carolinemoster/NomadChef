import { MongoClient } from 'mongodb';

// Initialize outside of handler to enable connection reuse
let client = null;
let db = null;
let isConnecting = false;

// Connect to MongoDB
export async function connect() {
    try {
        // If already connecting, wait for the existing connection attempt
        if (isConnecting) {
            let retries = 50; // 5 seconds maximum wait
            while (isConnecting && retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 100));
                retries--;
            }
            if (isConnecting) {
                throw new Error('Connection timeout while waiting for existing connection');
            }
            return db;
        }

        // If client exists, verify connection with ping
        if (client) {
            try {
                await client.db().admin().ping();
                return db;
            } catch (error) {
                console.log("Existing connection is dead, creating new connection");
                // Don't need to explicitly close here as the connection is already dead
                client = null;
                db = null;
            }
        }

        if (!client) {
            isConnecting = true;
            const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/test_db';
            client = new MongoClient(uri, {
                serverSelectionTimeoutMS: 5000,
                connectTimeoutMS: 5000,
                maxPoolSize: 1, // Limit pool size for Lambda
            });
            await client.connect();
            console.log("Connected to MongoDB");
            db = client.db(process.env.DB_NAME);
            isConnecting = false;
        }
        return db;
    } catch (error) {
        isConnecting = false;
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}

// Keep this method for cleanup during Lambda container shutdown
// but don't use it after regular operations
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
