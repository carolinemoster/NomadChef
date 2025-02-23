import { recipeService } from '../Services/recipeService.mjs';

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
    MAX_INGREDIENTS: 20,
    MAX_QUERY_LENGTH: 200,
    MAX_NUMBER: 100
};

export const handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));

    try {
        switch(event.path) {
            case '/recipes/search': {
                if (event.httpMethod !== 'GET') {
                    return formatResponse(405, { error: 'Method not allowed' });
                }

                const params = parseQueryParams(event);
                if (params.query && params.query.length > INPUT_LIMITS.MAX_QUERY_LENGTH) {
                    return formatResponse(400, { error: 'Search query too long' });
                }

                const recipes = await recipeService.searchRecipes(params);
                return formatResponse(200, recipes);
            }

            case '/recipes/detail': {
                if (event.httpMethod !== 'GET') {
                    return formatResponse(405, { error: 'Method not allowed' });
                }

                const { id } = parseQueryParams(event);
                if (!id) {
                    return formatResponse(400, { error: 'Recipe ID is required' });
                }

                const recipe = await recipeService.getRecipeById(id, parseQueryParams(event));
                return formatResponse(200, recipe);
            }

            case '/recipes/ingredients': {
                if (event.httpMethod !== 'POST') {
                    return formatResponse(405, { error: 'Method not allowed' });
                }

                const { ingredients, ...params } = parseBody(event);
                if (!ingredients || !Array.isArray(ingredients)) {
                    return formatResponse(400, { error: 'Valid ingredients array is required' });
                }

                if (ingredients.length > INPUT_LIMITS.MAX_INGREDIENTS) {
                    return formatResponse(400, { error: 'Too many ingredients' });
                }

                const recipes = await recipeService.searchByIngredients(ingredients, params);
                return formatResponse(200, recipes);
            }

            default:
                return formatResponse(404, { error: 'Route not found' });
        }
    } catch (error) {
        console.error('Error:', error);

        // Handle specific error cases
        if (error.message === 'Invalid request body') {
            return formatResponse(400, { error: error.message });
        }
        if (error.message === 'Spoonacular API key is not configured') {
            return formatResponse(500, { error: 'API configuration error' });
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
