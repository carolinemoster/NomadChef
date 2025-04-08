import { culturalContextService } from '../Services/cultureService.mjs';
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

// Culture context handler
export const handler = async (event) => {
    console.log('Culture Handler Event:', JSON.stringify(event, null, 2));

    try {
        // Verify authentication for all routes
        // try {
        //     verifyToken(event);
        // } catch (error) {
        //     return formatResponse(401, { error: 'Unauthorized: Invalid or expired token' });
        // }

        switch (event.path) {
            case '/culture/enrich': {
                if (event.httpMethod !== 'GET') {
                    return formatResponse(405, { error: 'Method not allowed' });
                }

                const { recipeId } = parseQueryParams(event);
                
                if (!recipeId) {
                    return formatResponse(400, { error: 'Recipe ID is required' });
                }

                const culturalContext = await culturalContextService.enrichRecipeWithCulturalContext(recipeId);
                return formatResponse(200, culturalContext);
            }

            case '/culture/enrichWithRecipe': {
                if (event.httpMethod !== 'POST') {
                    return formatResponse(405, { error: 'Method not allowed' });
                }

                const recipeData = parseBody(event);
                
                if (!recipeData || !recipeData.title) {
                    return formatResponse(400, { error: 'Valid recipe data with title is required' });
                }

                const culturalContext = await culturalContextService.enrichRecipeWithCulturalContext(recipeData);
                return formatResponse(200, culturalContext);
            }

            case '/culture/origin': {
                if (event.httpMethod !== 'POST') {
                    return formatResponse(405, { error: 'Method not allowed' });
                }

                const recipeData = parseBody(event);
                
                if (!recipeData || !recipeData.title) {
                    return formatResponse(400, { error: 'Valid recipe data with title is required' });
                }

                const origin = await culturalContextService.parseRecipeOrigin(recipeData);
                return formatResponse(200, { origin });
            }

            case '/culture/context': {
                if (event.httpMethod !== 'POST') {
                    return formatResponse(405, { error: 'Method not allowed' });
                }

                const requestData = parseBody(event);
                console.log('Received request data:', requestData);
                
                if (!requestData.recipeId) {
                    return formatResponse(400, { error: 'Recipe ID is required' });
                }

                try {
                    console.log('Checking Spoonacular API Key:', process.env.SPOONACULAR_API_KEY ? 'Present' : 'Missing');
                    console.log('Attempting to enrich recipe:', requestData.recipeId);
                    const culturalContext = await culturalContextService.enrichRecipeWithCulturalContext(requestData.recipeId);
                    console.log('Cultural context result:', culturalContext);
                    return formatResponse(200, culturalContext);
                } catch (error) {
                    console.error('Detailed error in cultural context:', error);
                    console.error('Error stack:', error.stack);
                    return formatResponse(500, { 
                        error: 'Failed to get cultural context',
                        details: error.message,
                        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
                    });
                }
            }

            default:
                return formatResponse(404, { error: 'Route not found' });
        }
    } catch (error) {
        console.error('Culture Handler Error:', error);

        // Handle specific error cases
        if (error.message === 'Invalid request body') {
            return formatResponse(400, { error: error.message });
        }
        if (error.message === 'Recipe not found') {
            return formatResponse(404, { error: error.message });
        }
        if (error.message.includes('OpenAI API')) {
            return formatResponse(502, { error: 'AI service error', message: error.message });
        }

        // Generic error handler
        return formatResponse(500, {
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const getRecipeCulture = async (event) => {
    try {
        // Your existing code...
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*', // Or specify your frontend URL
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                origin: origin,
                culturalContext: culturalContext
            })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*', // Or specify your frontend URL
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: 'Failed to get cultural context' })
        };
    }
};

// Add this handler for OPTIONS requests
export const handleOptions = async (event) => {
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*', // Or specify your frontend URL
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    };
};
