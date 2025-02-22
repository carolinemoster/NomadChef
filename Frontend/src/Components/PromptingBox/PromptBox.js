
import { useState } from "react";
import { Send } from "lucide-react";
import './PromptBox.css';
import { useNavigate } from 'react-router-dom';
const BASE_URL = "https://api.spoonacular.com/recipes/complexSearch";

const PromptBox = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [recipes, setRecipes] = useState([]);
  const recipeClicked = (recipeID) => {
    navigate('/Recipe', {state: {recipeID}});
  }
  const onSubmit = async (query) => {
    //fetch(`${BASE_URL}?apiKey=${API_KEY}&query=${encodeURIComponent(query)}`).then((response) => response.json()).then((data) => setRecipes(data))
      const response = await fetch(`${BASE_URL}?apiKey=${process.env.REACT_APP_SPOONACULAR_KEY}&query=${encodeURIComponent(query)}&addRecipeInformation=true`);
      const data = await response.json();
      setRecipes(data.results || []); // Fixed: store only `results` array
  }
  const listrecipes = recipes.length > 0 ? recipes.map((recipe) =>
    <div className="recipe-box" onClick={() => recipeClicked(recipe.id)}>
      <div className="recipe-box-left">
        <img src={recipe.image} alt={recipe.title} className="recipe-image"/>
      </div>
      <div className="recipe-box-right">
        <h3 className="recipe-title">{recipe.title}</h3>
        <p className="recipe-box-summary">
          {recipe.summary.replace(/<\/?[^>]+(>|$)/g, "")}
        </p>
      </div>
    </div>
  ) : <div></div>
  const handleSend = () => {
    if (input.trim()) {
      onSubmit(input);
      setInput("");
    }
  };

  return (
    <div>
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
      <div>
      <ul>{listrecipes}</ul>
      </div>
      </div>
  );
};

export default PromptBox;