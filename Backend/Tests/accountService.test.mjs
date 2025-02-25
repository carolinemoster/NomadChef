import { signUp, login, verifyToken } from '../Services/accountService.mjs';
import { jest } from '@jest/globals';

// Import the mocked db
let db;

beforeAll(async () => {
    // Get the mocked db from our mocked mongodb.mjs
    const mockModule = await import('../Utils/mongodb.mjs');
    db = mockModule.db;
    
    // Additional verification
    console.log('Verifying test database setup:');
    console.log('DB Name:', db.databaseName);
    console.log('DB URL:', db.client.options.url);
    
    // Verify we're using memory server
    expect(db.databaseName).toBe('test_db');
    expect(db.client.options.url).toContain('mongodb-memory-server');
});

// Add a test to verify db operations
describe('Database Setup', () => {
    it('should be using in-memory database', async () => {
        // Try a test write
        const collection = db.collection('test');
        await collection.insertOne({ test: true });
        const result = await collection.findOne({ test: true });
        expect(result).toBeTruthy();
        
        // Verify URL is memory server
        expect(db.client.options.url).toContain('mongodb-memory-server');
    });
});

describe('Account Service', () => {
  let testUser;
  
  beforeEach(() => {
    // Reset testUser before each test to ensure clean state
    testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'Password123!'
    };
  });

  describe('signUp', () => {
    it('should create a new user successfully', async () => {
      const result = await signUp(db, testUser.name, testUser.email, testUser.password);
      
      expect(result.statusCode).toBe(201);
      expect(result.body.user).toHaveProperty('_id');
      expect(result.body.user.name).toBe(testUser.name);
      expect(result.body.user.email).toBe(testUser.email);
      expect(result.body.token).toBeDefined();
    });

    it('should not allow duplicate emails', async () => {
      // First signup
      await signUp(db, testUser.name, testUser.email, testUser.password);
      
      // Try to signup again with same email
      const result = await signUp(db, testUser.name, testUser.email, testUser.password)
        .catch(error => ({
          statusCode: 409,
          body: { error: error.message }
        }));
      
      expect(result.statusCode).toBe(409);
      expect(result.body.error).toBe('Email already registered');
    });
  });
  
  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      // Create a user first
      await signUp(db, testUser.name, testUser.email, testUser.password);
      
      const result = await login(db, testUser.email, testUser.password);
      
      expect(result.statusCode).toBe(200);
      expect(result.body.user).toBeDefined();
      expect(result.body.token).toBeDefined();
    });

    it('should fail with incorrect password', async () => {
      await signUp(db, testUser.name, testUser.email, testUser.password);
      const result = await login(db, testUser.email, 'wrongpassword');
      
      expect(result.statusCode).toBe(401);
      expect(result.body.error).toBe('Invalid credentials');
    });

    it('should fail with non-existent email', async () => {
      const result = await login(db, 'nonexistent@example.com', testUser.password);
      
      expect(result.statusCode).toBe(401);
      expect(result.body.error).toBe('Invalid credentials');
    });
  });

  describe('token verification', () => {
    it('should verify a valid token', async () => {
      const signUpResult = await signUp(db, testUser.name, testUser.email, testUser.password);
      const { token } = signUpResult.body;
      
      const decoded = verifyToken(token);
      
      expect(decoded).toBeTruthy();
      expect(decoded.email).toBe(testUser.email);
    });

    it('should return null for invalid token', () => {
      const result = verifyToken('invalid-token');
      expect(result).toBeNull();
    });
  });
}); 