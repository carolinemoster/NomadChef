import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import { jest } from '@jest/globals';


let mongoServer;
let mongoClient;
let testDb;

// Mock the module to return our mock object
jest.mock('../../Utils/mongodb.mjs', () => ({
    __esModule: true,
    db: null // This will be updated when the memory server starts
}));

beforeAll(async () => {
    console.log('Starting MongoMemoryServer...');
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
    testDb = mongoClient.db('test_db');

    // Update the mock module's db
    const mockModule = await import('../../Utils/mongodb.mjs');
    Object.defineProperty(mockModule, 'db', {
        value: testDb,
        writable: true
    });

    // Verify the mock
    console.log('Memory Server URI:', mongoUri);
    console.log('Test DB Name:', testDb.databaseName);
    const collections = await testDb.collections();
    console.log('Available collections:', collections.map(c => c.collectionName));
});

beforeEach(async () => {
    // Clear all collections before each test
    if (testDb) {
        const collections = await testDb.collections();
        await Promise.all(collections.map(collection => collection.deleteMany({})));
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