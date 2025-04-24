const BASE_URL = 'https://api.spoonacular.com/recipes';
const API_KEY = process.env.SPOONACULAR_API_KEY;

// Parameters that accept comma-separated values
const CSV_PARAMS = new Set([
    'cuisine',
    'excludeCuisine',
    'diet',
    'intolerances',
    'equipment',
    'includeIngredients',
    'excludeIngredients',
    'tags'
]);

// Helper function to build query string from parameters
const buildQueryString = (params) => {
    const processedParams = Object.entries(params).reduce((acc, [key, value]) => {
        // Skip empty values
        if (!value) return acc;
        
        // Only process arrays for parameters that accept CSV
        if (CSV_PARAMS.has(key) && (Array.isArray(value) || typeof value === 'string')) {
            acc[key] = Array.isArray(value) ? value.join(',') : value;
        } else {
            acc[key] = value;
        }
        return acc;
    }, {});

    return `?${new URLSearchParams({
        apiKey: API_KEY,
        ...processedParams
    }).toString()}`;
};

// Helper function to handle API responses
const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch recipes');
    }
    return response.json();
};

// Helper function to validate parameters
const validateParams = (params) => {
    if (params.number && (isNaN(params.number) || params.number < 1 || params.number > 100)) {
        throw new Error('Number must be between 1 and 100');
    }
    if (params.offset && (isNaN(params.offset) || params.offset < 0)) {
        throw new Error('Offset must be non-negative');
    }
    if (params.maxReadyTime && (isNaN(params.maxReadyTime) || params.maxReadyTime < 0)) {
        throw new Error('maxReadyTime must be non-negative');
    }
    // Add validation for API key
    if (!API_KEY) {
        throw new Error('Spoonacular API key is not configured');
    }
};

// Recipe service object
export const recipeService = {
    // Search recipes with queries like cuisine, diet, intolerances, etc.
    async searchRecipes({
        query = '',
        cuisine = '',
        diet = '',
        intolerances = '',
        includeIngredients = '',
        excludeIngredients = '',
        type = '',
        maxReadyTime,
        number = 10,
        offset = 0,
        addRecipeInformation = true,
        addRecipeNutrition = false,
        sort = 'popularity',
        sortDirection = 'desc',
        instructionsRequired = true
    } = {}) {
        try {
            const params = {
                query, cuisine, diet, intolerances, includeIngredients, excludeIngredients, type, maxReadyTime, number, offset, addRecipeInformation, addRecipeNutrition, sort, sortDirection, instructionsRequired
            };
            validateParams(params);
            const queryString = buildQueryString(params);

            const response = await fetch(`${BASE_URL}/complexSearch${queryString}`);
            return handleResponse(response);
        } catch (error) {
            console.error('Error searching recipes:', error);
            throw error;
        }
    },

    // Get detailed recipe information by ID
    async getRecipeById(id, {
        includeNutrition = false,
    } = {}) {
        try {
            // Handle bulk request
            if (Array.isArray(id)) {
                const queryString = buildQueryString({
                    ids: id.join(','),
                    includeNutrition
                });
                const response = await fetch(`${BASE_URL}/informationBulk${queryString}`);
                return handleResponse(response);
            }
            
            // Handle single recipe request
            const queryString = buildQueryString({ includeNutrition });
            const response = await fetch(`${BASE_URL}/${id}/information${queryString}`);
            return handleResponse(response);
        } catch (error) {
            console.error('Error fetching recipe information:', error);
            throw error;
        }
    },

    // Search recipes by cuisine type
    async getRecipesByCuisine(cuisine, {
        number = 10,
        offset = 0,
        addRecipeInformation = true
    } = {}) {
        return this.searchRecipes({
            cuisine,
            number,
            offset,
            addRecipeInformation
        });
    },

    // Get recipe recommendations based on user preferences
    async getRecommendations({
        cuisine = '',
        diet = '',
        intolerances = '',
        type = '',
        maxReadyTime,
        number = 10
    } = {}) {
        return this.searchRecipes({
            cuisine,
            diet,
            intolerances,
            type,
            maxReadyTime,
            number,
            addRecipeInformation: true,
            sort: 'popularity'
        });
    },

    // Search recipes by dietary restrictions
    async getRecipesByDiet(diet, {
        number = 10,
        offset = 0,
        addRecipeInformation = true
    } = {}) {
        return this.searchRecipes({
            diet,
            number,
            offset,
            addRecipeInformation
        });
    },

    // Search recipes by available ingredients
    async searchByIngredients(ingredients, {
        number = 10,
        ignorePantry = true,
        ranking = 2  // 1 = maximize used ingredients, 2 = minimize missing ingredients
    } = {}) {
        try {
            const queryString = buildQueryString({
                ingredients: Array.isArray(ingredients) ? ingredients.join(',') : ingredients,
                number,
                ignorePantry,
                ranking
            });

            const response = await fetch(`${BASE_URL}/findByIngredients${queryString}`);
            return handleResponse(response);
        } catch (error) {
            console.error('Error searching recipes by ingredients:', error);
            throw error;
        }
    }
};

export default recipeService;
