const BASE_URL = 'https://api.spoonacular.com/recipes';
const API_KEY = process.env.SPOONACULAR_API_KEY;

//Need to fix comma separated values, unsure if working

// Helper function to build query string from parameters
const buildQueryString = (params) => {
    const processedParams = Object.entries(params).reduce((acc, [key, value]) => {
        acc[key] = Array.isArray(value) ? value.join(',') : value;
        return acc;
    }, {});

    // Add API key to the params object
    const queryParams = new URLSearchParams({
        apiKey: API_KEY,
        ...processedParams
    });
    
    // Prepend ? to the entire string
    return `?${queryParams.toString()}`;
};

// Helper function to handle API responses
const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch recipes');
    }
    return response.json();
};

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
        sortDirection = 'desc'
    } = {}) {
        try {
            const queryString = buildQueryString({
                query,
                cuisine,
                diet,
                intolerances,
                includeIngredients,
                excludeIngredients,
                type,
                maxReadyTime,
                number,
                offset,
                addRecipeInformation,
                addRecipeNutrition,
                sort,
                sortDirection
            });

            const response = await fetch(`${BASE_URL}/complexSearch${queryString}`);
            return handleResponse(response);
        } catch (error) {
            console.error('Error searching recipes:', error);
            throw error;
        }
    },

    // Get detailed recipe information by ID
    async getRecipeById(id, {
        addRecipeInformation = true,
        addRecipeNutrition = false
    } = {}) {
        try {
            const queryString = buildQueryString({
                addRecipeInformation,
                addRecipeNutrition
            });

            const response = await fetch(`${BASE_URL}/${id}/information${queryString}`);
            return handleResponse(response);
        } catch (error) {
            console.error('Error fetching recipe details:', error);
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
