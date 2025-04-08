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
            // If recipe exists, update with new data
            const updateData = {
                updatedAt: new Date()
            };

            // Only update fields that are provided
            if (options.rating !== undefined) updateData.personalRating = options.rating;
            if (options.wouldCookAgain !== undefined) updateData.wouldCookAgain = options.wouldCookAgain;
            if (options.origin) updateData['recipe.origin'] = options.origin;
            if (options.culturalContext) updateData['recipe.culturalContext'] = options.culturalContext;

            await recipesCollection.updateOne(
                { _id: existingRecipe._id },
                { $set: updateData }
            );
            
            // Return updated recipe
            return await recipesCollection.findOne({ _id: existingRecipe._id });
        }

        // Get recipe details from Spoonacular
        const recipeDetails = await recipeService.getRecipeById(recipeId);
        
        // Prepare recipe document with cultural information if provided
        const savedRecipe = {
            userId: new ObjectId(userId),
            recipeId: recipeId,
            savedAt: new Date(),
            updatedAt: new Date(),
            favorite: options.favorite || false,
            personalRating: options.rating || null,
            wouldCookAgain: options.wouldCookAgain || null,
            notes: options.notes,
            tags: options.tags || [],
            recipe: {
                title: recipeDetails.title,
                image: recipeDetails.image,
                servings: recipeDetails.servings,
                readyInMinutes: recipeDetails.readyInMinutes,
                sourceName: recipeDetails.sourceName,
                sourceUrl: recipeDetails.sourceUrl,
                summary: recipeDetails.summary,
                // Include cultural information if provided, otherwise use existing or null
                origin: options.origin || recipeDetails.origin || null,
                culturalContext: options.culturalContext || recipeDetails.culturalContext || null
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
    },
    
    async getUserRecipes(userId, options = {}) {
        const db = await getDb();
        
        // Verify user exists in users collection
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
        if (!user) {
            throw new Error('User not found');
        }
        
        // Set up query options
        const query = { userId: new ObjectId(userId) };
        
        // Add filter for favorites if specified
        if (options.favoritesOnly === true) {
            query.favorite = true;
        }
        
        // Add filter for tags if specified
        if (options.tags && options.tags.length > 0) {
            query.tags = { $all: options.tags };
        }
        
        // Set up pagination
        const limit = options.limit || 20;
        const skip = options.page ? (options.page - 1) * limit : 0;
        
        // Set up sorting
        const sortOptions = {};
        if (options.sortBy) {
            sortOptions[options.sortBy] = options.sortOrder === 'asc' ? 1 : -1;
        } else {
            // Default sort by savedAt date, newest first
            sortOptions.savedAt = -1;
        }
        
        const recipesCollection = db.collection('users_recipes');
        
        // Get total count for pagination
        const totalCount = await recipesCollection.countDocuments(query);
        
        // Get recipes
        const recipes = await recipesCollection
            .find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .toArray();
            
        return {
            recipes,
            pagination: {
                total: totalCount,
                page: options.page || 1,
                limit,
                pages: Math.ceil(totalCount / limit)
            }
        };
    }
};

export default userRecipeService;