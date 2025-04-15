# **AI-Enhanced Cultural Cooking Website**<br>

## **Overview**<br>
Cooking new foods—especially from unfamiliar cuisines—can be daunting. This project aims to make exploring international cuisines both accessible and enjoyable, blending food, culture, and history into a personalized cooking journey.

Our AI-enhanced website guides users through cooking cultural dishes while providing context about their origins. With features like personalized recommendations, an interactive world map, and a feedback loop, users can track their culinary exploration across the globe.

## **Features**<br>

### **Account Management**<br>
Users can create accounts securely, passwords are encrypted using Bcrypt, and sessions are authenticated with JWT tokens.

During signup, users provide:

1. Food, spice level, and cuisine preferences
2. Dietary restrictions
3. Cooking experience level

### **Interactive Map Visualization**<br>
A world map links recipes to their countries of origin.

When a user completes a recipe, that country is marked as completed.

The map visually tracks progress through global cuisine.

### **Recipe Generation**<br>
Recipes are generated based on user input using the Spoonacular API.

Each recipe includes step-by-step instructions and adapts to user preferences and dietary needs.

### **Cultural & Historical Context**<br>
AI generates cultural and historical background for each dish and its country of origin.

### **Personalized Recommendations**<br>
After cooking, users complete an optional feedback survey.

Survey results influence future recipe recommendations.

A progress bar displays how many countries (out of 195) the user has explored.

## **Conclusion**<br>

This website is more than just a recipe generator—it's a journey across cultures. By making global cooking fun, accessible, and meaningful, users will gain confidence in the kitchen and a deeper appreciation for the diversity of food traditions around the world.
