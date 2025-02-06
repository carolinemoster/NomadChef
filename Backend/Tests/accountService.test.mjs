import { signUp, login, verifyToken } from '../Services/accountService.mjs';
import { connect } from '../Utils/mongodb.mjs';

describe('Account Service', () => {
  let testUser;
  let db;
  
  beforeAll(async () => {
    db = await connect();
  });

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
      
      // Then try to login - add db parameter
      const result = await login(db, testUser.email, testUser.password);
      
      expect(result.statusCode).toBe(200);
      expect(result.body.user).toBeDefined();
      expect(result.body.token).toBeDefined();
    });

    it('should fail with incorrect password', async () => {
      await signUp(db, testUser.name, testUser.email, testUser.password);
      // Add db parameter
      const result = await login(db, testUser.email, 'wrongpassword');
      
      expect(result.statusCode).toBe(401);
      expect(result.body.error).toBe('Invalid credentials');
    });

    it('should fail with non-existent email', async () => {
      // Add db parameter
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