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
        
      // Get user account data for additional preferences
      const userData = await db.collection('users')
        .findOne({ _id: new ObjectId(userId) });
      
      // If user has no saved recipes, return recommendations based on account preferences
      if (!userRecipes || userRecipes.length === 0) {
        if (userData?.preferences) {
          return this.getRecommendationsFromUserPreferences(userData.preferences, limit, excludeIds);
        }
        return recipeService.getRecommendations({ number: limit });
      }
      
      // Analyze user preferences from saved recipes, prioritizing rated ones
      const preferences = await this.analyzeUserPreferences(userRecipes, userId);
      
      // Merge with user account preferences
      const mergedPreferences = this.mergeWithUserAccountPreferences(preferences, userData?.preferences);
      
      // Apply temperature to preferences (introduce randomness)
      const adjustedPreferences = this.applyTemperature(mergedPreferences, temperature);
      
      // Build query parameters for Spoonacular
      const queryParams = {
        number: limit + Math.max(excludeIds.length, 10), // Dynamic buffer based on excluded recipes
        addRecipeInformation: true,
        sort: 'popularity',  // Optional: sort by popularity
        fillIngredients: true  // Optional: include ingredient information
      };
      
      // Add preference parameters based on temperature
      if (adjustedPreferences.includeIngredients.length > 0) {
        queryParams.includeIngredients = adjustedPreferences.includeIngredients.join(',');
      }
      
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
      
      // Apply cooking skill level filter
      if (adjustedPreferences.cookingSkill) {
        queryParams.maxReadyTime = this.getMaxReadyTimeForSkill(adjustedPreferences.cookingSkill);
        queryParams.instructionsRequired = true;
      }
      
      // Apply meal type preferences if available
      if (adjustedPreferences.mealTypes?.length > 0) {
        queryParams.type = adjustedPreferences.mealTypes[0]; // Spoonacular only supports one type at a time
      }
      
      // Exclude disliked ingredients
      if (adjustedPreferences.dislikedIngredients?.length > 0) {
        queryParams.excludeIngredients = adjustedPreferences.dislikedIngredients.join(',');
      }
      
      // Fetch recipes from Spoonacular
      const results = await recipeService.searchRecipes(queryParams);
      
      // Filter out recipes the user has already saved
      const savedRecipeIds = userRecipes.map(recipe => recipe.recipeId.toString());
      const filteredResults = results.results.filter(recipe => 
        !savedRecipeIds.includes(recipe.id.toString()) && 
        !excludeIds.includes(recipe.id.toString())
      );
      
      // Apply additional filtering/ranking based on spice level if needed
      let rankedResults = filteredResults;
      
      // Shuffle results slightly based on temperature to add randomness
      const shuffledResults = this.shuffleWithTemperature(rankedResults, temperature);
      
      return {
        results: shuffledResults.slice(0, limit),
        totalResults: filteredResults.length
      };
    } catch (error) {
      console.error('Error generating personalized recommendations:', error);
      throw error;
    }
  },
  
  async analyzeUserPreferences(userRecipes, userId) {
    // Track ingredients and characteristics from highly-rated recipes
    const ingredientCounts = {};
    const dietCounts = {};
    const mealTypeCounts = {};
    const preparationTimeCounts = {};
    
    // Get recipes with ratings
    const ratedRecipes = userRecipes.filter(recipe => recipe.personalRating !== null);
    
    // If no rated recipes, use all saved recipes
    const recipesToAnalyze = ratedRecipes.length > 0 ? ratedRecipes : userRecipes;
    
    // Track recipes that need additional data
    const recipesNeedingDetails = [];
    
    // Extract info from saved recipes, prioritizing highly-rated ones
    for (const savedRecipe of recipesToAnalyze) {
      // Weight factor based on rating (higher rated recipes have more influence)
      const ratingWeight = savedRecipe.personalRating ? (savedRecipe.personalRating / 5) : 0.6;
      
      // Check if we have complete recipe data
      const hasCompleteData = savedRecipe.recipe?.extendedIngredients || 
                             savedRecipe.recipe?.diets;
      
      // If we don't have complete data, add to list for fetching
      if (!hasCompleteData && savedRecipe.recipeId) {
        recipesNeedingDetails.push(savedRecipe.recipeId);
      }
      
      // Process available data with rating weight
      if (savedRecipe.recipe?.extendedIngredients) {
        savedRecipe.recipe.extendedIngredients.forEach(ingredient => {
          ingredientCounts[ingredient.name] = (ingredientCounts[ingredient.name] || 0) + ratingWeight;
        });
      }
      
      if (savedRecipe.recipe?.diets) {
        savedRecipe.recipe.diets.forEach(diet => {
          dietCounts[diet] = (dietCounts[diet] || 0) + ratingWeight;
        });
      }
      
      // Track meal types if available
      if (savedRecipe.recipe?.dishTypes) {
        savedRecipe.recipe.dishTypes.forEach(type => {
          mealTypeCounts[type] = (mealTypeCounts[type] || 0) + ratingWeight;
        });
      }
      
      // Track preparation time preferences
      if (savedRecipe.recipe?.readyInMinutes) {
        const timeCategory = this.categorizePreparationTime(savedRecipe.recipe.readyInMinutes);
        preparationTimeCounts[timeCategory] = (preparationTimeCounts[timeCategory] || 0) + ratingWeight;
      }
      
      // Extract keywords from title for ingredient analysis
      if (savedRecipe.recipe?.title) {
        this.extractIngredientsFromTitle(savedRecipe.recipe.title, ingredientCounts, ratingWeight);
      }
    }
    
    // If we have recipes needing details, fetch them in batches
    if (recipesNeedingDetails.length > 0) {
      try {
        // Fetch in batches of 20 to avoid overloading the API
        for (let i = 0; i < recipesNeedingDetails.length; i += 20) {
          const batch = recipesNeedingDetails.slice(i, i + 20);
          const detailedRecipes = await recipeService.getRecipesBulk(batch);
          
          // Process the detailed data
          detailedRecipes.forEach(recipe => {
            // Find the original saved recipe to get its rating
            const savedRecipe = recipesToAnalyze.find(r => r.recipeId.toString() === recipe.id.toString());
            const ratingWeight = savedRecipe?.personalRating ? (savedRecipe.personalRating / 5) : 0.6;
            
            if (recipe.extendedIngredients) {
              recipe.extendedIngredients.forEach(ingredient => {
                ingredientCounts[ingredient.name] = (ingredientCounts[ingredient.name] || 0) + ratingWeight;
              });
            }
            
            if (recipe.diets) {
              recipe.diets.forEach(diet => {
                dietCounts[diet] = (dietCounts[diet] || 0) + ratingWeight;
              });
            }
          });
        }
      } catch (error) {
        console.error('Error fetching detailed recipe information:', error);
        // Continue with partial data if fetch fails
      }
    }
    
    // Sort by frequency and get top preferences
    const topIngredients = Object.entries(ingredientCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);
      
    const topDiet = Object.entries(dietCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 1)
      .map(entry => entry[0])[0] || null;
    
    // Extract cooking complexity preference based on saved recipes
    const complexityPreference = this.inferCookingComplexity(recipesToAnalyze);
    
    // Preferred meal types
    const topMealTypes = Object.entries(mealTypeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);
    
    return {
      includeIngredients: topIngredients,
      diet: topDiet,
      cookingSkill: complexityPreference,
      mealTypes: topMealTypes,
      // Explicitly set cuisines to empty array to avoid cuisine-based filtering
      cuisines: []
    };
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
    
    // Apply loved ingredients if available
    if (userPreferences.lovedIngredients?.length > 0) {
      queryParams.includeIngredients = userPreferences.lovedIngredients.join(',');
    }
    
    // Apply dietary restrictions if available
    if (userPreferences.dietaryRestrictions?.length > 0) {
      queryParams.diet = userPreferences.dietaryRestrictions.join(',');
    }
    
    // Apply disliked ingredients if available
    if (userPreferences.dislikedIngredients?.length > 0) {
      queryParams.excludeIngredients = userPreferences.dislikedIngredients.join(',');
    }
    
    // Apply cooking skill level
    if (userPreferences.cookingSkill) {
      queryParams.maxReadyTime = this.getMaxReadyTimeForSkill(userPreferences.cookingSkill);
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
  
  // New method to merge analyzed preferences with user account preferences
  mergeWithUserAccountPreferences(analyzedPreferences, userAccountPreferences) {
    if (!userAccountPreferences) return analyzedPreferences;
    
    const merged = { ...analyzedPreferences };
    
    // Explicitly set cuisines to empty array
    merged.cuisines = [];
    
    // Add loved ingredients to include ingredients
    if (userAccountPreferences.lovedIngredients?.length > 0) {
      merged.includeIngredients = [
        ...new Set([
          ...userAccountPreferences.lovedIngredients,
          ...analyzedPreferences.includeIngredients
        ])
      ].slice(0, 8); // Limit to top 8
    }
    
    // Add dietary restrictions
    if (userAccountPreferences.dietaryRestrictions?.length > 0) {
      merged.dietaryRestrictions = userAccountPreferences.dietaryRestrictions;
    }
    
    // Add disliked ingredients
    if (userAccountPreferences.dislikedIngredients?.length > 0) {
      merged.dislikedIngredients = userAccountPreferences.dislikedIngredients;
    }
    
    // Add cooking skill
    if (userAccountPreferences.cookingSkill) {
      merged.cookingSkill = userAccountPreferences.cookingSkill;
    }
    
    return merged;
  },
  
  // Helper method to determine max ready time based on cooking skill
  getMaxReadyTimeForSkill(skill) {
    switch(skill) {
      case 'Beginner':
        return 30; // 30 minutes max for beginners
      case 'Intermediate':
        return 60; // 60 minutes max for intermediate
      case 'Advanced':
        return 120; // 120 minutes max for advanced
      default:
        return 60; // Default to intermediate
    }
  },
  
  // Helper to categorize preparation time
  categorizePreparationTime(minutes) {
    if (minutes <= 30) return 'quick';
    if (minutes <= 60) return 'medium';
    return 'lengthy';
  },
  
  // Helper to extract potential ingredients from recipe title
  extractIngredientsFromTitle(title, ingredientCounts, weight) {
    const commonIngredients = [
      'chicken', 'beef', 'pork', 'lamb', 'fish', 'shrimp', 'tofu',
      'potato', 'tomato', 'onion', 'garlic', 'carrot', 'broccoli',
      'spinach', 'kale', 'lettuce', 'avocado', 'mushroom', 'squash',
      'rice', 'pasta', 'noodle', 'bread', 'cheese', 'cream', 'butter'
    ];
    
    const words = title.toLowerCase().split(/\s+/);
    
    words.forEach(word => {
      if (word.length > 3) { // Only consider meaningful words
        commonIngredients.forEach(ingredient => {
          if (word.includes(ingredient)) {
            ingredientCounts[ingredient] = (ingredientCounts[ingredient] || 0) + (weight * 0.5);
          }
        });
      }
    });
  },
  
  // Modified to focus on preparation time rather than cuisines
  inferCookingComplexity(userRecipes) {
    // Count recipes by preparation time
    let beginnerCount = 0;
    let intermediateCount = 0;
    let advancedCount = 0;
    
    userRecipes.forEach(savedRecipe => {
      const readyInMinutes = savedRecipe.recipe?.readyInMinutes || 0;
      const ratingWeight = savedRecipe.personalRating ? (savedRecipe.personalRating / 5) : 0.6;
      
      if (readyInMinutes <= 30) {
        beginnerCount += ratingWeight;
      } else if (readyInMinutes <= 60) {
        intermediateCount += ratingWeight;
      } else {
        advancedCount += ratingWeight;
      }
    });
    
    // Determine preferred complexity
    if (advancedCount > intermediateCount && advancedCount > beginnerCount) {
      return 'Advanced';
    } else if (intermediateCount > beginnerCount) {
      return 'Intermediate';
    } else {
      return 'Beginner';
    }
  }
};

export default recommendationService;
