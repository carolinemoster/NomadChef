import { MongoClient } from 'mongodb';

let client = null;
let db = null;

async function getDb() {
    if (db) return db;
    
    if (!client) {
        client = new MongoClient(process.env.MONGO_URI, {
            maxPoolSize: 1,
            maxIdleTimeMS: 60000,
        });
    }
    
    if (!client.topology || !client.topology.isConnected()) {
        await client.connect();
    }
    
    db = client.db(process.env.DB_NAME);
    return db;
}

export { getDb };