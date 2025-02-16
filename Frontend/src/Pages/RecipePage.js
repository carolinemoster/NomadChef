import React, { useState } from 'react';
import { useEffect } from 'react';
import './RecipePage.css';
import "react-multi-carousel/lib/styles.css";
import wisk_icon from '../Components/Assets/wisk.png';
import {useLocation} from 'react-router-dom';
const API_KEY = "9cfdb05515424fa68e068845dc7edcae";
const BASE_URL = "https://api.spoonacular.com/recipes/";

function RecipePage() {
    const location = useLocation();
    const RecipeID = location.state?.recipeID;
    const [recipe, setRecipe] = useState([]);
    const [instructions, setInstructions] = useState([]);
    useEffect(() => {
        if (RecipeID) {
            //getRecipe(RecipeID);
            getInstructions(RecipeID);
        }
    }, [RecipeID]); // Runs when RecipeID changes
    const getRecipe = async (recipeID) => {
        //fetch(`${BASE_URL}?apiKey=${API_KEY}&query=${encodeURIComponent(query)}`).then((response) => response.json()).then((data) => setRecipes(data))
          const response = await fetch(`${BASE_URL}${recipeID}/information?apiKey=${API_KEY}`);
          const data = await response.json();
          setRecipe(data);
      }
      const getInstructions = async (recipeID) => {
        //fetch(`${BASE_URL}?apiKey=${API_KEY}&query=${encodeURIComponent(query)}`).then((response) => response.json()).then((data) => setRecipes(data))
        const response2 = await fetch(`${BASE_URL}${recipeID}/analyzedInstructions?apiKey=${API_KEY}`);
        const data2 = await response2.json();
        setInstructions(data2);
      }
      const listingredients = (recipe.extendedIngredients) ? recipe.extendedIngredients.map((ingredient) =>
        <li>
            {ingredient.original}
        </li>
      ): <div></div>
      const listinstructions= (instructions.steps) ? instructions.steps.map((instruction) =>
        <li>
            {instruction.step}
        </li>
      ): <p>No Instructions</p>
        
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
                <div className='brand'>
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
                </div>
                <div className="box-main">
                    <div className="firstHalf" style={{ overflow: 'visible' }}>
                        <img src={recipe.image} />
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
                    <ul>
                        {listinstructions}
                    </ul>
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
