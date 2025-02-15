import { signUp, login } from '../Services/accountService.mjs';

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
        console.log("Request body: ", event.body);  // Log the raw body
        return JSON.parse(event.body);
    } catch (error) {
        console.log("Error parsing body: ", error);  // Log the error
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
    // Log request details (helpful for debugging)
    console.log('Event:', JSON.stringify(event, null, 2));
    
    try {
        switch(event.path) {
            case '/auth/signup': {
                if (event.httpMethod !== 'POST') {
                    return formatResponse(405, { error: 'Method not allowed' });
                }
            
                const userData = parseBody(event);
            
                if (!userData.name || !userData.email || !userData.password) {
                    return formatResponse(400, { 
                        error: 'Name, email, and password are required' 
                    });
                }
            
                const result = await signUp(userData);
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

            default:
                return formatResponse(404, { error: 'Route not found' });
        }
    } catch (error) {
        console.error('Error:', error);
        
        // Handle known errors with specific status codes
        if (error.message === 'Invalid request body') {
            return formatResponse(400, { error: error.message });
        }

        // Generic error handler
        return formatResponse(500, { 
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
