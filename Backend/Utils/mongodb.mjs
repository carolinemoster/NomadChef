import { MongoClient } from 'mongodb';

// Define client outside with recommended options

const client = new MongoClient(process.env.MONGO_URI, {
    maxPoolSize: 1,
    maxIdleTimeMS: 60000,  // Close idle connections after 1 minute
});

// Export the db instance directly
export const db = client.db(process.env.DB_NAME);
