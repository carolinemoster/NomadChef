import { ObjectId } from 'mongodb';
import { getDb } from '../Utils/mongodb.mjs';
import { recipeService } from './recipeService.mjs';

export const userRecipeService = {
    async saveRecipe(userId, recipeId, options = {}) {
        const db = await getDb();
        
        // First verify user exists in users collection
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
        if (!user) {
            throw new Error('User not found');
        }

        // Check if recipe is already saved
        const recipesCollection = db.collection('users_recipes');
        const existingRecipe = await recipesCollection.findOne({
            userId: new ObjectId(userId),
            recipeId: recipeId
        });

        if (existingRecipe) {
            throw new Error('Recipe already saved for this user');
        }

        // Get recipe details from Spoonacular
        const recipeDetails = await recipeService.getRecipeById(recipeId);
        
        // Prepare recipe document
        const savedRecipe = {
            userId: new ObjectId(userId),
            recipeId: recipeId,
            savedAt: new Date(),
            favorite: options.favorite || false,
            personalRating: options.rating,
            notes: options.notes,
            tags: options.tags || [],
            recipe: {
                title: recipeDetails.title,
                image: recipeDetails.image,
                servings: recipeDetails.servings,
                readyInMinutes: recipeDetails.readyInMinutes,
                sourceName: recipeDetails.sourceName,
                sourceUrl: recipeDetails.sourceUrl
            }
        };

        // Save to users_recipes collection
        await recipesCollection.insertOne(savedRecipe);

        // Initialize stats if they don't exist
        await usersCollection.updateOne(
            { _id: new ObjectId(userId), savedRecipeCount: { $exists: false } },
            { $set: { savedRecipeCount: 0, savedRecipeIds: [] } }
        );

        // Update user's recipe stats
        await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            {
                $addToSet: { savedRecipeIds: recipeId },
                $inc: { savedRecipeCount: 1 }
            }
        );

        return savedRecipe;
    }
};

export default userRecipeService;