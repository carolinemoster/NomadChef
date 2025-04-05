import { getDb } from '../Utils/mongodb.mjs';
import { ObjectId } from 'mongodb';
import { recipeService } from './recipeService.mjs';

export const recommendationService = {
  async getPersonalizedRecommendations(userId, options = {}) {
    try {
      // Default options with temperature (randomness factor)
      const {
        limit = 10,
        temperature = 0.3,  // 0 = strict recommendations, 1 = more variety
        excludeIds = []     // IDs of recipes to exclude (already seen)
      } = options;
      
      // Get user's saved recipes to analyze preferences
      const db = await getDb();
      const userRecipes = await db.collection('users_recipes')
        .find({ userId: new ObjectId(userId) })
        .toArray();
        
      // If user has no saved recipes, return general popular recipes
      if (!userRecipes || userRecipes.length === 0) {
        return recipeService.getRecommendations({ number: limit });
      }
      
      // Analyze user preferences from saved recipes
      const preferences = await this.analyzeUserPreferences(userRecipes, userId);
      
      // Apply temperature to preferences (introduce randomness)
      const adjustedPreferences = this.applyTemperature(preferences, temperature);
      
      // Build query parameters for Spoonacular
      const queryParams = {
        number: limit + Math.max(excludeIds.length, 10), // Dynamic buffer based on excluded recipes
        addRecipeInformation: true,
        sort: 'popularity',  // Optional: sort by popularity
        fillIngredients: true  // Optional: include ingredient information
      };
      
      // Add preference parameters based on temperature
      if (adjustedPreferences.cuisines.length > 0) {
        queryParams.cuisine = adjustedPreferences.cuisines.join(',');
      }
      
      if (adjustedPreferences.includeIngredients.length > 0) {
        queryParams.includeIngredients = adjustedPreferences.includeIngredients.join(',');
      }
      
      if (adjustedPreferences.diet) {
        queryParams.diet = adjustedPreferences.diet;
      }
      
      // Get user account data for additional preferences
      const userData = await db.collection('users')
        .findOne({ _id: new ObjectId(userId) });
        
      // Apply user account preferences if available
      if (userData?.preferences) {
        // Add dietary restrictions if user has them set
        if (userData.preferences.dietaryRestrictions?.length > 0) {
          queryParams.diet = userData.preferences.dietaryRestrictions.join(',');
        }
        
        // Exclude disliked ingredients
        if (userData.preferences.dislikedIngredients?.length > 0) {
          queryParams.excludeIngredients = userData.preferences.dislikedIngredients.join(',');
        }
      }
      
      // Fetch recipes from Spoonacular
      const results = await recipeService.searchRecipes(queryParams);
      
      // Filter out recipes the user has already saved
      const savedRecipeIds = userRecipes.map(recipe => recipe.recipeId.toString());
      const filteredResults = results.results.filter(recipe => 
        !savedRecipeIds.includes(recipe.id.toString()) && 
        !excludeIds.includes(recipe.id.toString())
      );
      
      // Shuffle results slightly based on temperature to add randomness
      const shuffledResults = this.shuffleWithTemperature(filteredResults, temperature);
      
      return {
        results: shuffledResults.slice(0, limit),
        totalResults: filteredResults.length
      };
    } catch (error) {
      console.error('Error generating personalized recommendations:', error);
      throw error;
    }
  },
  
  async analyzeUserPreferences(userRecipes) {
    // Count occurrences to find patterns
    const cuisineCounts = {};
    const ingredientCounts = {};
    const dietCounts = {};
    
    // Extract info from saved recipes
    userRecipes.forEach(savedRecipe => {
      // If the recipe has cuisine information
      if (savedRecipe.recipe.cuisines) {
        savedRecipe.recipe.cuisines.forEach(cuisine => {
          cuisineCounts[cuisine] = (cuisineCounts[cuisine] || 0) + 1;
        });
      }
      
      // For ingredients, we might need to get detailed recipe info
      // This would ideally be stored when the user saves the recipe
      if (savedRecipe.recipe.extendedIngredients) {
        savedRecipe.recipe.extendedIngredients.forEach(ingredient => {
          ingredientCounts[ingredient.name] = (ingredientCounts[ingredient.name] || 0) + 1;
        });
      }
      
      // Track dietary patterns if available
      if (savedRecipe.recipe.diets) {
        savedRecipe.recipe.diets.forEach(diet => {
          dietCounts[diet] = (dietCounts[diet] || 0) + 1;
        });
      }
    });
    
    // Sort by frequency and get top preferences
    const topCuisines = Object.entries(cuisineCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);
      
    const topIngredients = Object.entries(ingredientCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);
      
    const topDiet = Object.entries(dietCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 1)
      .map(entry => entry[0])[0] || null;
    
    return {
      cuisines: topCuisines,
      includeIngredients: topIngredients,
      diet: topDiet
    };
  },
  
  applyTemperature(preferences, temperature) {
    // Clone the preferences object
    const adjusted = { ...preferences };
    
    // At higher temperatures, reduce the number of constraints
    if (temperature > 0.5) {
      // Reduce number of cuisines at higher temperatures
      const cuisineCount = Math.max(1, Math.floor(preferences.cuisines.length * (1 - temperature)));
      adjusted.cuisines = preferences.cuisines.slice(0, cuisineCount);
      
      // Reduce number of ingredients at higher temperatures
      const ingredientCount = Math.max(1, Math.floor(preferences.includeIngredients.length * (1 - temperature)));
      adjusted.includeIngredients = preferences.includeIngredients.slice(0, ingredientCount);
      
      // At very high temperatures, don't constrain by diet
      if (temperature > 0.8) {
        adjusted.diet = null;
      }
    }
    
    return adjusted;
  },
  
  shuffleWithTemperature(array, temperature) {
    // If temperature is 0, return array unchanged
    if (temperature === 0) return [...array];
    
    // Clone the array
    const shuffled = [...array];
    
    // Fisher-Yates shuffle with temperature adjustment
    for (let i = shuffled.length - 1; i > 0; i--) {
      // Only swap sometimes, based on temperature
      if (Math.random() < temperature) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
    }
    
    return shuffled;
  }
};

export default recommendationService;
