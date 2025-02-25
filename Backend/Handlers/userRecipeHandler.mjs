import { userRecipeService } from '../Services/userRecipeService.mjs';
import { verifyToken } from '../Services/accountService.mjs';

// Reuse your existing formatResponse helper
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

export const handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));

    try {
        // Verify authentication for all routes
        const decoded = verifyToken(event);
        if (!decoded) {
            return formatResponse(401, { error: 'Unauthorized' });
        }

        switch(event.path) {
            case '/user/recipes/save': {
                if (event.httpMethod !== 'POST') {
                    return formatResponse(405, { error: 'Method not allowed' });
                }

                const body = parseBody(event);
                const { recipeId, ...options } = body;

                // Validate required fields
                if (!recipeId) {
                    return formatResponse(400, { error: 'Recipe ID is required' });
                }

                // First fetch recipe details from recipe Lambda
                const recipeResponse = await fetch(`${RECIPE_API_URL}/recipes/detail?id=${recipeId}`);
                if (!recipeResponse.ok) {
                    return formatResponse(404, { error: 'Recipe not found' });
                }
                const recipeDetails = await recipeResponse.json();

                try {
                    const savedRecipe = await userRecipeService.saveRecipe(
                        decoded.id, 
                        recipeId,
                        {
                            ...options,
                            recipeDetails  // Pass the recipe details to the service
                        }
                    );
                    return formatResponse(201, savedRecipe);
                } catch (error) {
                    if (error.message === 'Recipe already saved for this user') {
                        return formatResponse(409, { error: error.message });
                    }
                    if (error.message === 'User not found') {
                        return formatResponse(404, { error: error.message });
                    }
                    throw error;
                }
            }

            case '/user/recipes': {
                if (event.httpMethod !== 'GET') {
                    return formatResponse(405, { error: 'Method not allowed' });
                }
                // TODO: Implement get user's saved recipes
                return formatResponse(501, { error: 'Not implemented' });
            }

            case '/user/recipes/delete': {
                if (event.httpMethod !== 'DELETE') {
                    return formatResponse(405, { error: 'Method not allowed' });
                }
                // TODO: Implement delete saved recipe
                return formatResponse(501, { error: 'Not implemented' });
            }

            default:
                return formatResponse(404, { error: 'Route not found' });
        }
    } catch (error) {
        console.error('Error:', error);
        
        if (error.message === 'Invalid request body') {
            return formatResponse(400, { error: error.message });
        }

        return formatResponse(500, { 
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
