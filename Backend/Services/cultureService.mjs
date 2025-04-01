import { Configuration, OpenAIApi } from 'openai';
import { recipeService } from './recipeService.mjs';

// Initialize OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

export const culturalContextService = {
  // Extract geographic origin from recipe
  async parseRecipeOrigin(recipe) {
    try {
      const recipeText = `${recipe.title} ${recipe.summary || ''} ${recipe.instructions || ''}`;
      
      const response = await openai.createChatCompletion({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a culinary geography expert. Extract the country, region, and locality of origin for recipes. Return JSON with country, region, and locality fields. If any field is unknown, set it to null."
          },
          {
            role: "user",
            content: `Parse the geographic origin of this recipe: ${recipeText}`
          }
        ],
        temperature: 0.3,
        max_tokens: 150
      });
      
      const result = JSON.parse(response.data.choices[0].message.content);
      return {
        country: result.country,
        region: result.region,
        locality: result.locality
      };
    } catch (error) {
      console.error('Error parsing recipe origin:', error);
      return { country: null, region: null, locality: null };
    }
  },
  
  // Generate cultural context for a geographic origin
  async generateCulturalContext(origin) {
    if (!origin.country && !origin.region && !origin.locality) {
      return null;
    }
    
    try {
      const location = [origin.locality, origin.region, origin.country]
        .filter(Boolean)
        .join(", ");
        
      const response = await openai.createChatCompletion({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a culinary historian and cultural expert. Provide fascinating, concise cultural context about culinary traditions."
          },
          {
            role: "user",
            content: `Provide 2-3 interesting paragraphs about the culinary traditions and cultural significance of dishes from ${location}. Include unique ingredients, cooking techniques, historical influences, and cultural practices. Be specific to the region but concise.`
          }
        ],
        temperature: 0.7,
        max_tokens: 400
      });
      
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating cultural context:', error);
      return null;
    }
  },
  
  // Refactored function to process a recipe object directly
  async enrichRecipeWithCulturalContext(recipeOrId) {
    try {
      let recipe;
      
      // Handle both recipe object and recipeId for backward compatibility
      if (typeof recipeOrId === 'string' || typeof recipeOrId === 'number') {
        // It's an ID, fetch the recipe
        recipe = await recipeService.getRecipeById(recipeOrId);
        
        if (!recipe) {
          throw new Error('Recipe not found');
        }
      } else if (typeof recipeOrId === 'object' && recipeOrId !== null) {
        // It's already a recipe object
        recipe = recipeOrId;
        
        if (!recipe.title) {
          throw new Error('Invalid recipe: title is required');
        }
      } else {
        throw new Error('Invalid input: expected recipe object or recipe ID');
      }
      
      // Parse origin
      const origin = await this.parseRecipeOrigin(recipe);
      
      // Generate cultural context
      const culturalContext = await this.generateCulturalContext(origin);
      
      return {
        recipeId: recipe.id,
        origin,
        culturalContext
      };
    } catch (error) {
      console.error('Error enriching recipe with cultural context:', error);
      throw error;
    }
  }
};

export default culturalContextService;