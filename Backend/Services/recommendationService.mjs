import { getDb } from '../Utils/mongodb.mjs';
import { ObjectId } from 'mongodb';
import { recipeService } from './recipeService.mjs';

export const recommendationService = {
  async getPersonalizedRecommendations(userId, options = {}) {
    try {
      const {
        limit = 20,
        temperature = 0.3,  // 0 = strict recommendations, 1 = more variety
        excludeIds = []     // IDs of recipes to exclude (already seen)
      } = options;

      // Get user data and preferences
      const db = await getDb();
      const userData = await db.collection('users')
        .findOne({ _id: new ObjectId(userId) });
      
      // If user has no saved recipes, return recommendations based on account preferences
      if (!userRecipes || userRecipes.length === 0) {
        if (userData?.preferences) {
          return recommendationService.getRecommendationsFromUserPreferences(userData.preferences, limit, excludeIds);
        }
        return recipeService.getRecommendations({ number: limit });
      }
      
      const adjustedPreferences = await recommendationService.analyzeUserPreferences(userRecipes, userId);
      
      // Build query parameters for Spoonacular
      const queryParams = {
        number: limit + Math.max(excludeIds.length, 10),
        addRecipeInformation: true,
        sort: 'popularity',
        fillIngredients: true
      };
      
      // Apply diet preference
      if (adjustedPreferences.diet) {
        queryParams.diet = adjustedPreferences.diet;
      }
      
      // Apply dietary restrictions
      if (adjustedPreferences.dietaryRestrictions?.length > 0) {
        // If diet is already set, combine with dietary restrictions
        if (queryParams.diet) {
          queryParams.diet = [queryParams.diet, ...adjustedPreferences.dietaryRestrictions].join(',');
        } else {
          queryParams.diet = adjustedPreferences.dietaryRestrictions.join(',');
        }
      }

      // Exclude disliked ingredients
      if (adjustedPreferences.dislikedIngredients?.length > 0) {
        queryParams.excludeIngredients = adjustedPreferences.dislikedIngredients.join(',');
      }
      
      console.log(queryParams);
      // Fetch recipes from Spoonacular
      const results = await recipeService.searchRecipes(queryParams);

      // Filter out completed recipes
      let filteredResults = results.results.filter(recipe => 
        !excludeIds.includes(recipe.id.toString())
      );
      
      // Apply additional filtering/ranking based on spice level if needed
      let rankedResults = filteredResults;
      
      // Shuffle results slightly based on temperature to add randomness
      const shuffledResults = recommendationService.shuffleWithTemperature(rankedResults, temperature);
      
      return {
        results: filteredResults.slice(0, limit),
        totalResults: filteredResults.length
      };
    } catch (error) {
      console.error('Error generating personalized recommendations:', error);
      throw error;
    }
  },
  
  async analyzeUserPreferences(userRecipes, userId) {
    try {
      // Set up basic preference tracking
      const preferences = {
        includeIngredients: [],
        excludeIngredients: [],
        cuisines: [],
        diet: null
      };
      
      // Skip analysis if no recipes
      if (!userRecipes || userRecipes.length === 0) {
        return preferences;
      }
      
      // Track regions and countries by frequency
      const countryCounts = {};
      const regionCounts = {};
      
      // Get IDs of highly-rated recipes - will need to fetch more data
      const highlyRatedRecipes = userRecipes.filter(recipe => 
        recipe.personalRating >= 4
      );
      
      // Use highly rated recipes if available, otherwise use all
      const recipesToAnalyze = highlyRatedRecipes.length > 0 ? 
        highlyRatedRecipes : userRecipes;
      
      // Extract origin data from recipes
      recipesToAnalyze.forEach(savedRecipe => {
        // Weight based on rating
        const weight = savedRecipe.personalRating ? 
          savedRecipe.personalRating / 5 : 0.6;
        
        // Extract countries/regions from origin data
        if (savedRecipe.recipe?.origin?.country) {
          const country = savedRecipe.recipe.origin.country;
          countryCounts[country] = (countryCounts[country] || 0) + weight;
        }
        
        if (savedRecipe.recipe?.origin?.region) {
          const region = savedRecipe.recipe.origin.region;
          regionCounts[region] = (regionCounts[region] || 0) + weight;
        }
      });
      
      // Get recipe IDs to fetch additional data from Spoonacular
      const recipeIds = recipesToAnalyze.map(recipe => recipe.recipeId).slice(0, 5);
      
      // Fetch detailed recipe information for the top rated recipes
      const recipeDetails = await Promise.all(
        recipeIds.map(id => recipeService.getRecipeById(id).catch(err => null))
      ).then(results => results.filter(Boolean)); // Remove any failed requests
      
      // Extract information from the detailed recipe data
      const ingredientCounts = {};
      const dietCounts = {};
      const cuisineCounts = {};
      
      recipeDetails.forEach(recipe => {
        // Find the corresponding saved recipe to get its rating
        const savedRecipe = recipesToAnalyze.find(r => r.recipeId.toString() === recipe.id.toString());
        const weight = savedRecipe?.personalRating ? savedRecipe.personalRating / 5 : 0.6;
        
        // Extract cuisines
        if (recipe.cuisines && recipe.cuisines.length) {
          recipe.cuisines.forEach(cuisine => {
            cuisineCounts[cuisine] = (cuisineCounts[cuisine] || 0) + weight;
          });
        }
        
        // Extract diets
        if (recipe.diets && recipe.diets.length) {
          recipe.diets.forEach(diet => {
            dietCounts[diet] = (dietCounts[diet] || 0) + weight;
          });
        }
        
        // Extract ingredients
        if (recipe.extendedIngredients && recipe.extendedIngredients.length) {
          recipe.extendedIngredients.forEach(ingredient => {
            ingredientCounts[ingredient.name] = (ingredientCounts[ingredient.name] || 0) + weight;
          });
        }
      });
      
      // Get top 5 ingredients
      preferences.includeIngredients = Object.entries(ingredientCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(entry => entry[0]);
      
      // Get top 3 cuisines - use both API data and country data
      const apiCuisines = Object.entries(cuisineCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(entry => entry[0]);
      
      // Map top countries to cuisines when possible
      const countryCuisines = Object.entries(countryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(entry => {
          // Map countries to cuisines
          const countryToCuisine = {
            'United States': 'American',
            'Italy': 'Italian',
            'Mexico': 'Mexican',
            'China': 'Chinese',
            'India': 'Indian',
            'Japan': 'Japanese',
            'Thailand': 'Thai',
            'France': 'French',
            'Spain': 'Spanish',
            'Greece': 'Greek',
            'Vietnam': 'Vietnamese',
            'Korea': 'Korean',
            'Lebanon': 'Lebanese',
            'Morocco': 'Moroccan'
            // Add more mappings as needed
          };
          return countryToCuisine[entry[0]] || null;
        })
        .filter(Boolean); // Remove null values
      
      // Combine API cuisines with country-derived cuisines, remove duplicates
      preferences.cuisines = [...new Set([...apiCuisines, ...countryCuisines])].slice(0, 3);
      
      // Get top diet if exists
      const topDiet = Object.entries(dietCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 1)
        .map(entry => entry[0])[0];
      
      if (topDiet) {
        preferences.diet = topDiet;
      }
      
      return preferences;
    } catch (error) {
      console.error("Error analyzing user preferences:", error);
      // Return empty preferences if error occurs
      return {
        includeIngredients: [],
        cuisines: [],
        diet: null
      };
    }
  },
  
  applyTemperature(preferences, temperature) {
    // Clone the preferences object
    const adjusted = { ...preferences };
    
    // At higher temperatures, reduce the number of constraints
    if (temperature > 0.5) {
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
  },
  
  // New method to get recommendations based solely on user account preferences
  async getRecommendationsFromUserPreferences(userPreferences, limit, excludeIds = []) {
    const queryParams = {
      number: limit + 10,
      addRecipeInformation: true,
      sort: 'popularity',
      fillIngredients: true
    };
    
    // Apply dietary restrictions if available
    if (userPreferences.dietaryRestrictions?.length > 0) {
      queryParams.diet = userPreferences.dietaryRestrictions.join(',');
    }
    
    // Apply disliked ingredients if available
    if (userPreferences.dislikedIngredients?.length > 0) {
      queryParams.excludeIngredients = userPreferences.dislikedIngredients.join(',');
    }
    
    // Fetch recipes from Spoonacular
    const results = await recipeService.searchRecipes(queryParams);
    
    // Filter out excluded recipes
    const filteredResults = results.results.filter(recipe => 
      !excludeIds.includes(recipe.id.toString())
    );
    
    // Apply additional filtering/ranking based on spice level if needed
    let finalResults = filteredResults;
    
    return {
      results: finalResults.slice(0, limit),
      totalResults: filteredResults.length
    };
  },
  
  // New method to get random recipes
  async getRandomRecipes(userId, limit = 20, excludeIds = []) {
    try {
      const db = await getDb();
      const userPreferences = await db.collection('users')
        .findOne({ _id: new ObjectId(userId) });

        
      const queryParams = {
        number: limit + 10,
        addRecipeInformation: true,
        fillIngredients: true,
        instructionsRequired: true,
        sort: 'random'  // Use random sort to get random recipes
      };

      // Apply dietary restrictions if available
      if (userPreferences?.preferences?.dietaryRestrictions?.length > 0) {
        queryParams.diet = userPreferences.preferences.dietaryRestrictions.join(',');
      }
      
      // Apply disliked ingredients if available
      if (userPreferences?.preferences?.dislikedIngredients?.length > 0) {
        queryParams.excludeIngredients = userPreferences.preferences.dislikedIngredients.join(',');
      }
      
      // Fetch random recipes from Spoonacular
      const results = await recipeService.searchRecipes(queryParams);
      
      // Filter out excluded recipes
      const filteredResults = results.results.filter(recipe => 
        !excludeIds.includes(recipe.id.toString())
      );
      
      return {
        results: filteredResults.slice(0, limit),
        totalResults: filteredResults.length
      };
    } catch (error) {
      console.error('Error getting random recipes:', error);
      throw error;
    }
  }
};

export default recommendationService;