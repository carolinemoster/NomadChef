import { userRecipeService } from '../Services/userRecipeService.mjs';
import { verifyToken } from './authHandler.mjs';

const BASE_URL = process.env.BASE_URL;

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

        // Single path with different methods
        if (event.path === '/user-recipe') {
            switch(event.httpMethod) {
                case 'POST': {
                    const body = parseBody(event);
                    const { recipeId, ...options } = body;

                    // Validate required fields
                    if (!recipeId) {
                        return formatResponse(400, { error: 'Recipe ID is required' });
                    }

                    // First fetch recipe details from recipe Lambda
                    const recipeResponse = await fetch(`${BASE_URL}/recipes/detail?id=${recipeId}`);
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
                                recipeDetails
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

                case 'GET': {
                    const { 
                        page, 
                        limit, 
                        favoritesOnly, 
                        tags,
                        sortBy,
                        sortOrder
                    } = event.queryStringParameters || {};
                    
                    // Parse options from query parameters
                    const options = {
                        page: page ? parseInt(page) : 1,
                        limit: limit ? parseInt(limit) : 20
                    };
                    
                    // Add optional filters
                    if (favoritesOnly === 'true') {
                        options.favoritesOnly = true;
                    }
                    
                    if (tags) {
                        options.tags = tags.split(',');
                    }
                    
                    if (sortBy) {
                        options.sortBy = sortBy;
                        options.sortOrder = sortOrder || 'desc';
                    }
                    
                    try {
                        const userRecipes = await userRecipeService.getUserRecipes(decoded.id, options);
                        return formatResponse(200, userRecipes);
                    } catch (error) {
                        if (error.message === 'User not found') {
                            return formatResponse(404, { error: error.message });
                        }
                        throw error;
                    }
                }

                case 'DELETE': {
                    // TODO: Implement delete saved recipe
                    // Expect recipeId in query parameters
                    const { recipeId } = event.queryStringParameters || {};
                    if (!recipeId) {
                        return formatResponse(400, { error: 'Recipe ID is required' });
                    }
                    return formatResponse(501, { error: 'Not implemented' });
                }

                default:
                    return formatResponse(405, { error: 'Method not allowed' });
            }
        }

        return formatResponse(404, { error: 'Route not found' });
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
