import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import { connect, disconnect } from '../../Utils/mongodb.mjs';
import { jest } from '@jest/globals';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

let mongoServer;
let mongoClient;

console.log('1. Setup file is being loaded');

jest.mock('../../Utils/mongodb.mjs', () => {
  console.log('2. Creating mock');
  const mock = {
    connect: async () => {
      console.log('3. Mock connect called');
      if (!mongoClient) {
        throw new Error('mongoClient not initialized');
      }
      const db = mongoClient.db(process.env.DB_NAME);
      console.log('3a. Mock connect returning db');
      return db;
    },
    disconnect: async () => {
      console.log('4. Mock disconnect called');
      if (mongoClient) {
        await mongoClient.close();
        console.log('4a. Mock disconnect closed client');
      }
    }
  };
  return mock;
});

beforeAll(async () => {
  console.log('6. beforeAll starting');
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
    console.log('7. afterAll starting');
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