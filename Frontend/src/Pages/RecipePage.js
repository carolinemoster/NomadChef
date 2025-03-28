import React, { useState } from 'react';
import { useEffect } from 'react';
import './RecipePage.css';
import "react-multi-carousel/lib/styles.css";
import wisk_icon from '../Components/Assets/wisk.png';
import {useLocation} from 'react-router-dom';
import { AlignCenter } from 'lucide-react';
import check_mark from '../Components/Assets/checkmark.png';
import { useNavigate } from 'react-router-dom';
import Heart from "react-animated-heart"
const BASE_URL = "https://b60ih09kxi.execute-api.us-east-2.amazonaws.com/dev/recipes/"
const BASE_SPOON = "https://api.spoonacular.com/recipes/"
const BASE_USER_RECIPES = "https://b60ih09kxi.execute-api.us-east-2.amazonaws.com/dev/user-recipe"

function RecipePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [clickedSteps, setClickedSteps] = useState([]);
    const RecipeID = location.state?.recipeID;
    const [recipe, setRecipe] = useState([]);
    const [instructions, setInstructions] = useState([]);
    const [isClick, setClick] = useState(false);
    const recipedata = {
        recipeId: RecipeID
    };
    const handleBrandClick = () => {
        navigate('/home');
    };
    useEffect(() => {
        if (RecipeID) {
            getRecipe(RecipeID);
            getInstructions(RecipeID);
            //getInstructions(RecipeID);
        }
    }, [RecipeID]); // Runs when RecipeID changes
    const handleClick = () => {
        getInstructions(RecipeID);
        
      };
    const favoriteClick = async () => {
        setClick(!isClick);
        const token = localStorage.getItem('authToken');
        const response = await fetch(BASE_USER_RECIPES, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(recipedata)
          });
      
          
        const jsonResponse = await response.json();

    };
    const stepClicked = (index) => {
        setClickedSteps((prev) =>
            prev.includes(index)
              ? prev.filter((i) => i !== index) // Remove if already clicked (toggle off)
              : [...prev, index] // Add if not clicked
          );
    };
    
    const getRecipe = async (recipeID) => {
        //fetch(`${BASE_URL}?apiKey=${API_KEY}&query=${encodeURIComponent(query)}`).then((response) => response.json()).then((data) => setRecipes(data))
          const response = await fetch(`${BASE_URL}detail?id=${recipeID}`);
          const data = await response.json();
          setRecipe(data);
      }
      const getInstructions = async (recipeID) => {
        //fetch(`${BASE_URL}?apiKey=${API_KEY}&query=${encodeURIComponent(query)}`).then((response) => response.json()).then((data) => setRecipes(data))
        const response2 = await fetch(`${BASE_SPOON}${recipeID}/analyzedInstructions?apiKey=${process.env.REACT_APP_SPOONACULAR_KEY}&stepBreakdown=true`);
        const data2 = await response2.json();
        setInstructions(data2);
      }
      const finishClick = async () => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(BASE_USER_RECIPES, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(recipedata)
          });
          navigate('/home');
      }
      const listingredients = (recipe.extendedIngredients) ? recipe.extendedIngredients.map((ingredient) =>
        <li>
            {ingredient.original}
        </li>
      ): <div></div>
      const finishbutton = (instructions[0]) ? ((clickedSteps.includes(instructions[0].steps.length-1)) ? <div className='finish-recipe' onClick={finishClick}> <h3>Finish Recipe</h3></div> : <div></div>) : <div></div>
      const listinstructions = (instructions[0]) ? instructions[0].steps.map((instruction) =>
        <li key={instruction.number}>
            <div className={`step-box ${clickedSteps.includes(instruction.number-1) ? 'completed' : ''}`}>
                <div className='step-box-left'>
                    <input
                        type="checkbox"
                        className="step-checkbox"
                        checked={clickedSteps.includes(instruction.number-1)}
                        onChange={() => stepClicked(instruction.number-1)}
                    />
                </div>
                <div className='step-box-right'>
                    <p>{instruction.step}</p>
                </div>
            </div>
        </li>
      ) : <p>No Instructions</p>
        
    const responsive = {
        superLargeDesktop: {
            breakpoint: { max: 4000, min: 3000 },
            items: 5
        },
        desktop: {
            breakpoint: { max: 3000, min: 1024 },
            items: 4
        },
        tablet: {
            breakpoint: { max: 1024, min: 464 },
            items: 2
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: 1
        }
    };

    return (
        <div className="front-page">
            <nav className="navbar background">
                <div className='brand' onClick={handleBrandClick}>
                    NomadChef
                    <img src={wisk_icon} alt="Whisk Icon" className="whisk" />
                </div>
                <div className='list-items'>             
                    <ul className="nav-list">
                        <li>
                            <a href="#courses">About</a>
                        </li>
                        <li>
                            <a href="#tutorials">Past Recipes</a>
                        </li>
                        <li>
                            <a href="#jobs">Settings</a>
                        </li>
                        <li>
                            <a href="#student">Account</a>
                        </li>
                    </ul>
                </div>
                <div className="rightNav">
                </div>
            </nav>

            <section className="section">
                <div className='box-main'>
                    <h1>{recipe.title}</h1>
                    <div className="action-buttons">
                        <div className="heart-button">
                            <Heart isClick={isClick} onClick={() => favoriteClick()} />
                        </div>
                        <div className='save-button'>Save</div>
                    </div>
                </div>
                <div className="box-main">
                    <div className="firstHalf" style={{ overflow: 'visible' }}>
                        <img src={recipe.image} />
                    </div>
                    <div className="summary-box">
                        {(recipe.summary) ?  <p>{recipe.summary.replace(/<\/?[^>]+(>|$)/g, "")}</p> : <p></p>}
                    </div>
                </div>
                <h2>Ingredients</h2>
                <div className='box-main'>
                    <ul>
                        {listingredients}
                    </ul>
                </div>
                <h2>Instructions</h2>
                <div className='box-main'>
                    <ul className='steps-ul'>
                        {listinstructions}
                    </ul>
                </div>
                <div className='box-main'>
                    <div className='finish-recipe' onClick={finishClick}>
                        <h3>Finish Recipe</h3>
                    </div>
                </div>
            </section>
            <footer className="footer">
                <p className="text-footer">
                    Copyright ©-All rights are reserved
                </p>
            </footer>
        </div>
    );
}

export default RecipePage;
