import OpenAI from 'openai';
import { recipeService } from './recipeService.mjs';
import fetch from 'node-fetch';

// Initialize OpenAI with the new pattern
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com/recipes';

// At the top of the file, add this check
if (!process.env.SPOONACULAR_API_KEY) {
  console.error('SPOONACULAR_API_KEY is not set in environment variables');
}

export const culturalContextService = {
  // First, let's add a method to fetch recipe details from Spoonacular
  async getRecipeDetails(recipeId) {
    try {
      console.log('Using Spoonacular API Key:', process.env.SPOONACULAR_API_KEY ? 'Key is set' : 'Key is missing');
      console.log('Attempting to fetch recipe details for ID:', recipeId);
      const recipe = await recipeService.getRecipeById(recipeId);
      console.log('Successfully retrieved recipe details');
      return recipe;
    } catch (error) {
      console.error('Detailed error in getRecipeDetails:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  },

  // Extract geographic origin from recipe
  async parseRecipeOrigin(recipe) {
    try {
      let recipeText;
  
      // Get full recipe details if only an ID is passed
      if (typeof recipe === 'string' || typeof recipe === 'number') {
        const recipeDetails = await this.getRecipeDetails(recipe);
        recipeText = `
          Title: ${recipeDetails.title}
          Cuisine: ${recipeDetails.cuisines?.join(', ') || 'Not specified'}
          Dish Types: ${recipeDetails.dishTypes?.join(', ') || 'Not specified'}
          Ingredients: ${recipeDetails.extendedIngredients?.map(ing => ing.name).join(', ') || 'Not specified'}
          Instructions: ${recipeDetails.instructions || 'Not specified'}
          Summary: ${recipeDetails.summary || 'Not specified'}
          Ready in: ${recipeDetails.readyInMinutes || 'N/A'} minutes
        `;
      } else {
        recipeText = `
          Title: ${recipe.title}
          Cuisine: ${recipe.cuisines?.join(', ') || 'Not specified'}
          Dish Types: ${recipe.dishTypes?.join(', ') || 'Not specified'}
          Ingredients: ${recipe.extendedIngredients?.map(ing => ing.name).join(', ') || 'Not specified'}
          Instructions: ${recipe.instructions || 'Not specified'}
          Summary: ${recipe.summary || 'Not specified'}
          Ready in: ${recipe.readyInMinutes || 'N/A'} minutes
        `;
      }
  
      console.log('Sending to OpenAI (for origin):', recipeText);
  
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a culinary expert AI that always determines the **most likely country of origin** for recipes.
  Return only a JSON object with the fields: "country", "region", and "locality".
  Do not return anything else. Never return "Unknown".
  
  Examples:
  Title: Sushi → { "country": "Japan", "region": "Asia", "locality": "Tokyo" }
  Title: Tacos al Pastor → { "country": "Mexico", "region": "North America", "locality": "Mexico City" }
  Title: Croissant → { "country": "France", "region": "Europe", "locality": "Paris" }`
          },
          {
            role: "user",
            content: `Based on this recipe, what is the most likely country of origin? Return a JSON object only:\n${recipeText}`
          }
        ],
        temperature: 0.3,
        max_tokens: 200
      });
  
      const message = response.choices[0]?.message?.content;
  
      let result = JSON.parse(message);
      if (!result.country) {
        result.country = "Unknown";
      }
  
      return {
        country: result.country,
        region: result.region || null,
        locality: result.locality || null
      };
  
    } catch (error) {
      console.error('Error in parseRecipeOrigin:', error);
      return { country: "Unknown", region: null, locality: null };
    }
  },
  
  
  // Generate cultural context for a geographic origin
  async generateCulturalContext(origin, recipe) {
    try {
      const location = origin.country === "Unknown" ? "this dish" : 
        [origin.locality, origin.region, origin.country]
          .filter(Boolean)
          .join(", ");
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a culinary historian and cultural expert. Provide fascinating, concise cultural context about culinary traditions, focusing on the ingredients, techniques, and cultural significance."
          },
          {
            role: "user",
            content: `Provide 2-3 interesting paragraphs about ${recipe.title}. Discuss its cultural significance, traditional ingredients, cooking techniques, and any historical influences. If this is a modern adaptation, explain traditional preparation methods as well. Focus on ${location}.`
          }
        ],
        temperature: 0.7,
        max_tokens: 400
      });
      
      console.log('Cultural context generated:', response.choices[0].message.content);
      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error generating cultural context:', error);
      return `This recipe, ${recipe.title}, represents a modern approach to cooking, combining various ingredients and techniques to create a flavorful dish.`;
    }
  },
  
  // Main function to process a recipe
  async enrichRecipeWithCulturalContext(recipeOrId) {
    try {
      let recipe;
      
      console.log('Starting enrichRecipeWithCulturalContext with:', recipeOrId);
      
      if (typeof recipeOrId === 'string' || typeof recipeOrId === 'number') {
        console.log('Fetching recipe details for ID:', recipeOrId);
        recipe = await this.getRecipeDetails(recipeOrId);
        console.log('Recipe title:', recipe.title);
        console.log('Recipe cuisines:', recipe.cuisines);
        console.log('Recipe ingredients:', recipe.extendedIngredients?.map(ing => ing.name));
        
        if (!recipe) {
          throw new Error('Recipe not found');
        }
      } else if (typeof recipeOrId === 'object' && recipeOrId !== null) {
        recipe = recipeOrId;
        console.log('Using provided recipe object:', recipe.title);
        
        if (!recipe.title) {
          throw new Error('Invalid recipe: title is required');
        }
      } else {
        throw new Error('Invalid input: expected recipe object or recipe ID');
      }
      
      console.log('Parsing recipe origin...');
      const origin = await this.parseRecipeOrigin(recipe);
      console.log('Parsed origin:', origin);
      
      console.log('Generating cultural context...');
      const culturalContext = await this.generateCulturalContext(origin, recipe);
      console.log('Generated cultural context:', culturalContext);
      
      return {
        recipeId: recipe.id || null,
        origin,
        culturalContext
      };
    } catch (error) {
      console.error('Error enriching recipe with cultural context:', error);
      console.error('Full error details:', {
        message: error.message,
        stack: error.stack,
        cause: error.cause
      });
      throw error;
    }
  }
};

export default culturalContextService;