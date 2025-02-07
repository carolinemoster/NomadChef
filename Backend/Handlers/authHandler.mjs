import { signUp, login } from '../Services/accountService.mjs';
import { db } from '../Utils/mongodb.mjs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Helper to format Lambda response
const formatResponse = (statusCode, body) => ({
    statusCode,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Configure based on your needs
        'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(body)
});

// Helper to parse request body
const parseBody = (event) => {
    try {
        return JSON.parse(event.body);
    } catch (error) {
        throw new Error('Invalid request body');
    }
};

// Add basic input limits
const INPUT_LIMITS = {
    NAME_MAX_LENGTH: 100,
    EMAIL_MAX_LENGTH: 254,
    PASSWORD_MIN_LENGTH: 5,
    PASSWORD_MAX_LENGTH: 72  // bcrypt limit
};

// Simple sanitization
const sanitizeInput = (str) => str?.trim() || '';

export const handler = async (event) => {
    console.log('Handler started');
    console.log('MongoDB URI exists:', !!process.env.MONGO_URI);
    console.log('DB_NAME exists:', !!process.env.DB_NAME);
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    
    try {
        console.log('Event:', JSON.stringify(event, null, 2));
        
        // Test DB connection
        console.log('Testing DB connection...');
        try {
            await db.command({ ping: 1 });
            console.log('MongoDB connection successful!');
        } catch (dbError) {
            console.error('MongoDB connection failed:', dbError);
            throw dbError;
        }

        switch(event.path) {
            case '/auth/signup': {
                console.log('Processing signup request');
                if (event.httpMethod !== 'POST') {
                    return formatResponse(405, { error: 'Method not allowed' });
                }

                const { name: rawName, email: rawEmail, password } = parseBody(event);
                console.log('Parsed request body');
                
                const name = sanitizeInput(rawName);
                const email = sanitizeInput(rawEmail).toLowerCase();
                console.log(name, email, password);

                if (!name || !email || !password) {
                    return formatResponse(400, { 
                        error: 'Name, email, and password are required' 
                    });
                }

                // Simple length checks
                if (name.length > INPUT_LIMITS.NAME_MAX_LENGTH || 
                    email.length > INPUT_LIMITS.EMAIL_MAX_LENGTH ||
                    password.length < INPUT_LIMITS.PASSWORD_MIN_LENGTH ||
                    password.length > INPUT_LIMITS.PASSWORD_MAX_LENGTH) {
                    return formatResponse(400, { 
                        error: 'Invalid input length' 
                    });
                }

                console.log("Signing up user:", name, email, password);
                const result = await signUp(db, name, email, password);
                console.log('SignUp completed');
                
                return formatResponse(result.statusCode, result.body);
            }

            case '/auth/login': {
                if (event.httpMethod !== 'POST') {
                    return formatResponse(405, { error: 'Method not allowed' });
                }

                const { email, password } = parseBody(event);
                
                if (!email || !password) {
                    return formatResponse(400, { 
                        error: 'Email and password are required' 
                    });
                }

                const result = await login(db, email, password);
                return formatResponse(result.statusCode, result.body);
            }

            default:
                return formatResponse(404, { error: 'Route not found' });
        }
    } catch (error) {
        console.error('Handler error:', error);
        console.error('Error stack:', error.stack);
        
        if (error.message === 'Invalid request body') {
            return formatResponse(400, { error: error.message });
        }
        
        if (error.name === 'MongoError' || error.name === 'MongoServerError') {
            console.error('MongoDB error details:', {
                name: error.name,
                code: error.code,
                message: error.message
            });
            return formatResponse(500, { error: 'Database operation failed' });
        }

        return formatResponse(500, { 
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
