import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { jest, describe, it, expect, beforeEach, afterEach, afterAll } from '@jest/globals';

// Load environment variables
dotenv.config();

let mongoServer;
let mongoClient;

// Setup before all tests
beforeAll(async () => {
  // Create MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Set the MONGO_URI environment variable for tests
  process.env.MONGO_URI = mongoUri;
  
  // Create MongoDB client
  mongoClient = new MongoClient(mongoUri);
  await mongoClient.connect();

  // Mock the mongodb.mjs connect/disconnect functions
  jest.mock('../../Utils/mongodb.mjs', () => ({
    connect: async () => mongoClient.db(),
    disconnect: async () => {
      // Do nothing in tests since we manage connection in setup
    }
  }));
});

// Clean up after each test
afterEach(async () => {
  // Clear all collections
  if (mongoClient) {
    const db = mongoClient.db();
    const collections = await db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }
  
  // Clear all mocks
  jest.clearAllMocks();
});

// Cleanup after all tests
afterAll(async () => {
  // Close MongoDB connection
  if (mongoClient) {
    await mongoClient.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// Default timeout
jest.setTimeout(10000);

// Optional: Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
});
