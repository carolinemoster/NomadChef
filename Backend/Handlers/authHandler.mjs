import { signUp, login, getUserData, updateUserData } from '../Services/accountService.mjs';
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

// Token verification helper
export const verifyToken = (event) => {
    const authHeader = event.headers.Authorization || event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Unauthorized: No token provided');
    }
    console.log("Verify token handler invoked");
    const token = authHeader.split(' ')[1];
    try {
        console.log("Really?? But token failed?");
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        console.log('Token verification failed:', error);
        throw new Error('Unauthorized: Invalid or expired token');
    }
};

//If db not connected, connect to it
// if (!db.isConnected) {
//     await db.connect();
// }

export const handler = async (event) => {
    // Log request details (helpful for debugging)
    console.log('Event:', JSON.stringify(event, null, 2));
    
    try {
        switch(event.path) {
            case '/auth/signup': {
                if (event.httpMethod !== 'POST') {
                    return formatResponse(405, { error: 'Method not allowed' });
                }

                const { name: rawName, email: rawEmail, password } = parseBody(event);
                const name = sanitizeInput(rawName);
                const email = sanitizeInput(rawEmail).toLowerCase();

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

                const result = await signUp(name, email, password);
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

                const result = await login(email, password);
                return formatResponse(result.statusCode, result.body);
            }

            case '/auth/getUserData': {
                if (event.httpMethod !== 'GET') {
                    return formatResponse(405, { error: 'Method not allowed' });
                }

                // Declare decoded outside of try block
                let decoded;
                console.log("Decoded token before try block:", decoded);
                try {
                    decoded = verifyToken(event);
                    console.log("Decoded token after try block:", decoded);
                } catch (error) {
                    return formatResponse(401, { error: 'Unauthorized: Invalid or expired token' });
                }

                // Now decoded is available here
                const userData = await getUserData(decoded.id);
                if (!userData) {
                    return formatResponse(404, { error: 'User not found' });
                }

                return formatResponse(userData.statusCode, userData.body);
            }
            case '/auth/updateUserData': {
                if (event.httpMethod !== 'POST') {  // Change PUT to POST
                    return formatResponse(405, { error: 'Method not allowed' });
                }
            
                let decoded;
                try {
                    decoded = verifyToken(event);
                } catch (error) {
                    return formatResponse(401, { error: 'Unauthorized: Invalid or expired token' });
                }
            
                const updateData = parseBody(event);
                const result = await updateUserData(decoded.id, updateData);
                return formatResponse(result.statusCode, result.body);
            }

            default:
                return formatResponse(404, { error: 'Route not found' });
        }
    } catch (error) {
        console.error('Error:', error);

        // Handle known errors with specific status codes
        if (error.message === 'Invalid request body') {
            return formatResponse(400, { error: error.message });
        }
        if (error.message.startsWith('Unauthorized')) {
            return formatResponse(401, { error: error.message });
        }

        // Generic error handler
        return formatResponse(500, { 
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};