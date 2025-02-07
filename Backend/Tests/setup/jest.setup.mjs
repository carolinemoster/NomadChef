import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import { jest } from '@jest/globals';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

let mongoServer;
let mongoClient;
let testDb;

console.log('1. Setup file is being loaded');

beforeAll(async () => {
    console.log('Starting MongoMemoryServer...');
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
    testDb = mongoClient.db('test_db');
    
    // Mock with the already connected database
    jest.mock('../../Utils/mongodb.mjs', () => ({
        db: testDb
    }));
});

// Clean up after each test
afterEach(async () => {
    if (testDb) {
        const collections = await testDb.collections();
        for (const collection of collections) {
            await collection.deleteMany({});
        }
    }
});

afterAll(async () => {
    console.log('Cleaning up...');
    try {
        if (mongoClient) {
            await mongoClient.close();
        }
        if (mongoServer) {
            await mongoServer.stop();
        }
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
});