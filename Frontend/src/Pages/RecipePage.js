import React, { useState } from 'react';
import { useEffect } from 'react';
import './RecipePage.css';
import "react-multi-carousel/lib/styles.css";
import wisk_icon from '../Components/Assets/wisk.png';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Heart from "react-animated-heart"
import { FaStar } from 'react-icons/fa';

const BASE_URL = "https://b60ih09kxi.execute-api.us-east-2.amazonaws.com/dev/recipes/"
const BASE_SPOON = "https://api.spoonacular.com/recipes/"
const BASE_USER_RECIPES = "https://b60ih09kxi.execute-api.us-east-2.amazonaws.com/dev/user-recipe"
const BASE_USER_COUNTRIES = "https://b60ih09kxi.execute-api.us-east-2.amazonaws.com/dev/auth/updateUserCountries"
const API_BASE_URL = "https://b60ih09kxi.execute-api.us-east-2.amazonaws.com/dev"

const StarRating = ({ rating, setRating }) => {
    return (
        <div style={{ display: 'flex', gap: '8px' }}>
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                    <FaStar
                        key={index}
                        size={24}
                        onClick={() => setRating(ratingValue)}
                        style={{
                            cursor: 'pointer',
                            color: ratingValue <= rating ? '#ffc107' : '#e4e5e9'
                        }}
                    />
                );
            })}
        </div>
    );
};

const stripMeasurements = (ingredientString) => {
    return ingredientString
        // Remove fractions (½, ¼, etc.) and numbers with optional fractions
        .replace(/[¼½¾\d]+\s*\/?\s*\d*/, '')
        // Remove common measurements and descriptors
        .replace(/teaspoon|tablespoon|cup|ounce|pound|tbsp|tsp|oz|lb|medium|small|large|can|freshly squeezed|chopped|minced|diced|sliced|\(.*?\)/gi, '')
        // Remove leading spaces, commas, dots, hyphens, or 's'
        .replace(/^[\s,.-]+|s\s+/g, '')
        // Remove any remaining numbers and special characters
        .replace(/[\d-]+/g, '')
        // Clean up multiple spaces and trim
        .replace(/\s+/g, ' ')
        .trim();
};

const SurveyModal = ({ isOpen, onClose, recipe, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [unwantedIngredients, setUnwantedIngredients] = useState([]);
    const [wouldCookAgain, setWouldCookAgain] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        onSubmit({
            rating,
            unwantedIngredients,
            wouldCookAgain
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 style={{ textAlign: 'center', color: '#0d4725', marginBottom: '20px' }}>
                    Recipe Survey
                </h2>
                
                <div className="survey-question">
                    <h3 style={{ textAlign: 'left' }}>How would you rate this recipe?</h3>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                        <StarRating rating={rating} setRating={setRating} />
                    </div>
                </div>

                <div className="survey-question">
                    <h3 style={{ textAlign: 'left' }}>Are there any ingredients you'd prefer not to have in future recipes?</h3>
                    <div className="ingredients-list" style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'flex-start',
                        marginTop: '10px',
                        paddingLeft: '20px'
                    }}>
                        {recipe.extendedIngredients?.map((ingredient, index) => (
                            <label key={index} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px',
                                margin: '5px 0'
                            }}>
                                <input
                                    type="checkbox"
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setUnwantedIngredients([...unwantedIngredients, stripMeasurements(ingredient.original)]);
                                        } else {
                                            setUnwantedIngredients(
                                                unwantedIngredients.filter(i => i !== stripMeasurements(ingredient.original))
                                            );
                                        }
                                    }}
                                />
                                {stripMeasurements(ingredient.original)}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="survey-question">
                    <h3 style={{ textAlign: 'left' }}>Would you cook this recipe again?</h3>
                    <div className="cook-again-options" style={{ 
                        display: 'flex', 
                        justifyContent: 'center',
                        gap: '20px',
                        marginTop: '10px'
                    }}>
                        {['Yes', 'No', 'Maybe'].map((option) => (
                            <label key={option} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px'
                            }}>
                                <input
                                    type="radio"
                                    name="cookAgain"
                                    value={option.toLowerCase()}
                                    checked={wouldCookAgain === option.toLowerCase()}
                                    onChange={(e) => setWouldCookAgain(e.target.value)}
                                />
                                {option}
                            </label>
                        ))}
                    </div>
                </div>

                <button 
                    className="submit-survey" 
                    onClick={handleSubmit}
                    style={{
                        display: 'block',
                        margin: '20px auto 0',
                        padding: '10px 30px'
                    }}
                >
                    Submit
                </button>
            </div>
        </div>
    );
};

function RecipePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [clickedSteps, setClickedSteps] = useState([]);
    const RecipeID = location.state?.recipeID;
    const [recipe, setRecipe] = useState([]);
    const [instructions, setInstructions] = useState([]);
    const [isClick, setClick] = useState(false);
    const [showSurvey, setShowSurvey] = useState(false);
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
      
      const setCountry = async (countryCode) => {
        const payload = {
            code: countryCode
        }
        const token = localStorage.getItem('authToken'); 
        await fetch(BASE_USER_COUNTRIES, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
    };
    const favoriteClick = async () => {
        setClick(!isClick);
        const token = localStorage.getItem('authToken');
        await fetch(BASE_USER_RECIPES, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(recipedata)
        });
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
      const finishClick = () => {
        setShowSurvey(true);
      }
      const handleSurveySubmit = async (surveyData) => {
        try {
            const token = localStorage.getItem('authToken');

            // First save/update the recipe with rating and wouldCookAgain
            const recipeUpdateResponse = await fetch(BASE_USER_RECIPES, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    recipeId: RecipeID,
                    rating: parseInt(surveyData.rating),
                    wouldCookAgain: surveyData.wouldCookAgain
                })
            });

            if (!recipeUpdateResponse.ok) {
                throw new Error('Recipe update failed');
            }

            // Then handle the disliked ingredients update
            const userDataResponse = await fetch(`${API_BASE_URL}/auth/getUserData`, {
                method: 'GET',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!userDataResponse.ok) {
                throw new Error('Failed to fetch user data');
            }

            const userData = await userDataResponse.json();
            const existingDisliked = userData.preferences?.dislikedIngredients || [];
            
            // Only proceed if there are unwanted ingredients to add
            if (surveyData.unwantedIngredients && surveyData.unwantedIngredients.length > 0) {
                // Filter out any duplicates and add new ingredients
                const newDislikedIngredients = surveyData.unwantedIngredients.filter(
                    ingredient => !existingDisliked.includes(ingredient)
                );
                const combinedDisliked = [...existingDisliked, ...newDislikedIngredients];

                // Update user preferences
                const userUpdateResponse = await fetch(`${API_BASE_URL}/auth/updateUserData`, {
                    method: 'POST',
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        preferences: {
                            dislikedIngredients: combinedDisliked
                        }
                    })
                });

                if (!userUpdateResponse.ok) {
                    throw new Error('Failed to update user preferences');
                }
            }

            // Update the country if available
            if (recipe.cuisineCountry) {
                await setCountry(recipe.cuisineCountry);
            }
            
            navigate('/home');
        } catch (error) {
            console.error('Error updating preferences:', error);
            navigate('/home');
        }
    };
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
                        <img src={recipe.image} alt={recipe.title || "Recipe image"} />
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
            <SurveyModal 
                isOpen={showSurvey}
                onClose={() => setShowSurvey(false)}
                recipe={recipe}
                onSubmit={handleSurveySubmit}
            />
        </div>
    );
}

export default RecipePage;
