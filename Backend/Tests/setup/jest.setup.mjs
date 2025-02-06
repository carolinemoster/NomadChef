import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import { connect, disconnect } from '../../Utils/mongodb.mjs';
import { jest } from '@jest/globals';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

let mongoServer;
let mongoClient;

// Mock the mongodb.mjs module
jest.mock('../../Utils/mongodb.mjs', () => ({
    connect: async () => {
        console.log('Mock connect called');
        return mongoClient.db(process.env.DB_NAME);
    },
    disconnect: async () => {
        console.log('Mock disconnect called');
        if (mongoClient) {
            await mongoClient.close(true);
            console.log('MongoDB client closed');
        }
    }
}));

beforeAll(async () => {
    console.log('Starting MongoMemoryServer...');
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    process.env.MONGO_URI = mongoUri;
    process.env.DB_NAME = 'test_db';
    
    console.log('Connecting to MongoDB...');
    mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
    console.log('Connected to MongoDB');
});

// Clean up after each test
afterEach(async () => {
    if (mongoClient) {
        const db = mongoClient.db();
        const collections = await db.collections();
        for (const collection of collections) {
            await collection.deleteMany({});
        }
    }
    jest.clearAllMocks();
});

afterAll(async () => {
    console.log('Cleaning up...');
    try {
        if (mongoClient) {
            await mongoClient.close(true);
            console.log('MongoDB client closed');
        }
        if (mongoServer) {
            await mongoServer.stop({ doCleanup: true, force: true });
            console.log('MongoMemoryServer stopped');
        }
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
    console.log('Cleanup complete');
}, 10000);