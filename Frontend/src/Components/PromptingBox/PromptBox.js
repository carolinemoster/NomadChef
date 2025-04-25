import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import './PromptBox.css';
import { useNavigate } from 'react-router-dom';
const BASE_URL = "https://b60ih09kxi.execute-api.us-east-2.amazonaws.com/dev/recipes/search";
const BASE_USER_INFO = "https://b60ih09kxi.execute-api.us-east-2.amazonaws.com/dev/auth/getUserData";

const PromptBox = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [userPreferences, setUserPreferences] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const recipeClicked = (recipeID) => {
    navigate('/Recipe', {state: {recipeID}});
  }

  const getUserParams = async () => {
    const token = localStorage.getItem('authToken'); 
    const response = await fetch(BASE_USER_INFO, {
        method: "GET",  
        headers: {
          "Authorization": `Bearer ${token}`, 
          "Content-Type": "application/json" 
        }});
    const data = await response.json();
    if(data) {
        setUserPreferences(data.preferences || []);
    }
  }

  useEffect(() => {
    getUserParams();
  }, []);

  const onSubmit = async (query) => {
    try {
      setIsLoading(true);
      setSearchQuery(query);
      const token = localStorage.getItem('authToken');
      
      // Prepare user preferences as query parameters
      const params = new URLSearchParams();
      
      // Add the search query
      params.append('query', query);
      
      // Add user preferences if available
      if (userPreferences) {
        // Add dietary restrictions
        if (userPreferences.dietaryRestrictions) {
          params.append('diet', userPreferences.dietaryRestrictions);
        }

        // Add disliked ingredients
        if (userPreferences.dislikedIngredients) {
          params.append('excludeIngredients', userPreferences.dislikedIngredients);
        }
      }
      
      // Make the API call with all parameters
      const response = await fetch(`${BASE_URL}?${params.toString()}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      const data = await response.json();
      setRecipes(data.results || []);
    } catch (error) {
      console.error("Error searching recipes:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const renderResults = () => {
    if (isLoading) {
      return (
        <div className="loading-container">
          <span className="loading-text">Loading recipes...</span>
          <div className="loading-spinner"></div>
        </div>
      );
    }

    if (recipes.length === 0 && searchQuery) {
      return (
        <div className="no-results">
          <p>No recipes found for "{searchQuery}"</p>
          <p className="no-results-suggestion">Try a different search term or check your spelling.</p>
        </div>
      );
    }

    return (
      <ul>
        {recipes.map((recipe) => (
          <div key={recipe.id} className="recipe-box" onClick={() => recipeClicked(recipe.id)}>
            <div className="recipe-box-left">
              <img src={recipe.image} alt={recipe.title} className="recipe-image"/>
            </div>
            <div className="recipe-box-right">
              <h3 className="recipe-title">{recipe.title}</h3>
            </div>
          </div>
        ))}
      </ul>
    );
  };

  const handleSend = () => {
    if (input.trim()) {
      onSubmit(input);
      setInput("");
    }
  };

  return (
    <div className="prompt-container">
      <div className="glassmorphic-box">
        <input
          type="text"
          placeholder="Begin Searching Recipes..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button className="send-button" onClick={handleSend}>
          <Send />
        </button>
      </div>
      {searchQuery && (
        <div className="search-results-header">
          <h2>Search Results for "{searchQuery}"</h2>
        </div>
      )}
      <div className="results-container">
        {renderResults()}
      </div>
    </div>
  );
};

export default PromptBox;