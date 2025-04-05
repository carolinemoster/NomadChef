import { recommendationService } from '../Services/recommendationService.mjs';
import { verifyToken } from './authHandler.mjs';

// Helper to format Lambda response
const formatResponse = (statusCode, body) => ({
    statusCode,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
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

// Helper to parse query parameters
const parseQueryParams = (event) => {
    return event.queryStringParameters || {};
};

// Input validation limits
const INPUT_LIMITS = {
    MAX_EXCLUDE_IDS: 100,
    MAX_LIMIT: 50
};

// Recommendation handler
export const handler = async (event) => {
    console.log('Recommendation Handler Event:', JSON.stringify(event, null, 2));

    try {
        // Verify authentication for all routes
        let decoded;
        try {
            decoded = verifyToken(event);
        } catch (error) {
            return formatResponse(401, { error: 'Unauthorized: Invalid or expired token' });
        }

        switch(event.path) {
            case '/recommendations/personalized': {
                if (event.httpMethod !== 'GET') {
                    return formatResponse(405, { error: 'Method not allowed' });
                }

                const params = parseQueryParams(event);
                
                // Parse options
                const options = {};
                
                // Parse limit
                if (params.limit) {
                    const limit = parseInt(params.limit);
                    if (isNaN(limit) || limit < 1) {
                        return formatResponse(400, { error: 'Invalid limit parameter' });
                    }
                    if (limit > INPUT_LIMITS.MAX_LIMIT) {
                        return formatResponse(400, { error: `Limit cannot exceed ${INPUT_LIMITS.MAX_LIMIT}` });
                    }
                    options.limit = limit;
                }
                
                // Parse temperature (randomness factor)
                if (params.temperature) {
                    const temperature = parseFloat(params.temperature);
                    if (isNaN(temperature) || temperature < 0 || temperature > 1) {
                        return formatResponse(400, { error: 'Temperature must be between 0 and 1' });
                    }
                    options.temperature = temperature;
                }
                
                // Parse excludeIds (recipes to exclude)
                if (params.excludeIds) {
                    const excludeIds = params.excludeIds.split(',');
                    if (excludeIds.length > INPUT_LIMITS.MAX_EXCLUDE_IDS) {
                        return formatResponse(400, { error: `Cannot exclude more than ${INPUT_LIMITS.MAX_EXCLUDE_IDS} recipes` });
                    }
                    options.excludeIds = excludeIds;
                }

                const recommendations = await recommendationService.getPersonalizedRecommendations(decoded.id, options);
                return formatResponse(200, recommendations);
            }

            default:
                return formatResponse(404, { error: 'Route not found' });
        }
    } catch (error) {
        console.error('Recommendation Handler Error:', error);

        // Handle specific error cases
        if (error.message === 'Invalid request body') {
            return formatResponse(400, { error: error.message });
        }
        if (error.message === 'User not found') {
            return formatResponse(404, { error: error.message });
        }
        if (error.message.includes('Failed to fetch recipes')) {
            return formatResponse(502, { error: 'External API error' });
        }

        // Generic error handler
        return formatResponse(500, {
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export default handler;
