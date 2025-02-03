import { signUp, login, verifyToken } from '../Services/accountService.mjs';
import { MongoClient } from 'mongodb';

describe('Account Service', () => {
  let testUser;
  
  beforeEach(() => {
    // Reset testUser before each test to ensure clean state
    testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`, // Make email unique for each test
      password: 'Password123!'
    };
  });

  describe('signUp', () => {
    it('should create a new user successfully', async () => {
      const result = await signUp(testUser.name, testUser.email, testUser.password);
      
      expect(result.statusCode).toBe(201);
      expect(result.body.user).toHaveProperty('_id');
      expect(result.body.user.name).toBe(testUser.name);
      expect(result.body.user.email).toBe(testUser.email);
      expect(result.body.token).toBeDefined();
    });

    it('should not allow duplicate emails', async () => {
      // First signup
      await signUp(testUser.name, testUser.email, testUser.password);
      
      // Try to signup again with same email
      const result = await signUp(testUser.name, testUser.email, testUser.password);
      
      expect(result.statusCode).toBe(409);
      expect(result.body.error).toBe('Email already registered');
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      // Create a test user before each login test
      await signUp(testUser.name, testUser.email, testUser.password);
    });

    it('should login successfully with correct credentials', async () => {
      const result = await login(testUser.email, testUser.password);
      
      expect(result.statusCode).toBe(200);
      expect(result.body.user.email).toBe(testUser.email);
      expect(result.body.token).toBeDefined();
    });

    it('should fail with incorrect password', async () => {
      const result = await login(testUser.email, 'wrongpassword');
      
      expect(result.statusCode).toBe(401);
      expect(result.body.error).toBe('Invalid credentials');
    });

    it('should fail with non-existent email', async () => {
      const result = await login('nonexistent@example.com', testUser.password);
      
      expect(result.statusCode).toBe(401);
      expect(result.body.error).toBe('Invalid credentials');
    });
  });

  describe('token verification', () => {
    it('should verify a valid token', async () => {
      const signUpResult = await signUp(testUser.name, testUser.email, testUser.password);
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