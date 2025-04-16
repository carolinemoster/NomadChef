import React, { useState } from 'react';
import { useEffect } from 'react';
import './RecipePage.css';
import "react-multi-carousel/lib/styles.css";
import wisk_icon from '../Components/Assets/wisk.png';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Heart from "react-animated-heart"
import { FaStar } from 'react-icons/fa';
import axios from 'axios';

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
        // Remove standalone 'c' at start and other common measurements
        .replace(/^[c]\s+|^\d+\/?\d*\s*[c]\s+/i, '')
        // Remove all measurements and common descriptors
        .replace(/cup(s)?|teaspoon(s)?|tablespoon(s)?|ounce(s)?|pound(s)?|tbsp|tsp|oz|lb|medium|small|large|can|freshly|squeezed|chopped|minced|diced|sliced|softened|room temperature|instant|few drops of|\(.*?\)/gi, '')
        // Remove numbers and fractions
        .replace(/\d+\/?\d*\s*/g, '')
        // Remove special characters and extra spaces
        .replace(/[,\+\-\.]/g, ' ')
        // Clean up multiple spaces and trim
        .replace(/\s+/g, ' ')
        .trim();
};

const SurveyModal = ({ isOpen, onClose, recipe, onSubmit }) => {
    const [surveyData, setSurveyData] = useState({
        rating: 0,
        wouldCookAgain: '',
        dislikedIngredients: []
    });

    if (!isOpen) return null;

    const handleClose = (e) => {
        if (e.target.className === 'modal-overlay') {
            onClose();
        }
    };

    const handleSubmit = () => {
        onSubmit({
            rating: surveyData.rating,
            dislikedIngredients: surveyData.dislikedIngredients,
            wouldCookAgain: surveyData.wouldCookAgain
        });
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content">
                <button 
                    className="close-button" 
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        right: '10px',
                        top: '10px',
                        background: 'none',
                        border: 'none',
                        fontSize: '20px',
                        cursor: 'pointer',
                        color: '#0d4725'
                    }}
                >
                    ×
                </button>
                <h2 style={{ textAlign: 'center', color: '#0d4725', marginBottom: '20px' }}>
                    Recipe Survey
                </h2>
                
                <div className="survey-question">
                    <h3 style={{ textAlign: 'left' }}>How would you rate this recipe?</h3>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                        <StarRating rating={surveyData.rating} setRating={(value) => setSurveyData(prev => ({ ...prev, rating: value }))} />
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
                            <label key={`ingredient-${index}`} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '12px',
                                margin: '8px 0',
                                fontSize: '15px'
                            }}>
                                <input
                                    type="checkbox"
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                        cursor: 'pointer'
                                    }}
                                    onChange={(e) => {
                                        const strippedIngredient = stripMeasurements(ingredient.original);
                                        if (e.target.checked) {
                                            setSurveyData(prev => ({
                                                ...prev,
                                                dislikedIngredients: [...prev.dislikedIngredients, strippedIngredient]
                                            }));
                                        } else {
                                            setSurveyData(prev => ({
                                                ...prev,
                                                dislikedIngredients: prev.dislikedIngredients.filter(i => i !== strippedIngredient)
                                            }));
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
                                    checked={surveyData.wouldCookAgain === option.toLowerCase()}
                                    onChange={(e) => setSurveyData(prev => ({ ...prev, wouldCookAgain: e.target.value }))}
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
    const { getCode, getName } = require('country-list');
    const recipedata = {
        recipeId: RecipeID
    };
    const [culturalContext, setCulturalContext] = useState(null);
    const [origin, setOrigin] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showFullContext, setShowFullContext] = useState(false);
    const MAX_CONTEXT_LENGTH = 600;
    const handleBrandClick = () => {
        navigate('/home');
    };
    const handlePastRecipesClick = () => {
        navigate('/pastrecipes');
    };
    const handleAccountClick = () => {
        navigate('/account');
    };
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/');
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
        if (!countryCode) {
            console.error("Invalid country code:", countryCode);
            return;
        }
        
        const payload = {
            code: countryCode.toLowerCase()
        };
        
        try {
            const token = localStorage.getItem('authToken'); 
            const response = await fetch(BASE_USER_COUNTRIES, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error('Failed to update country');
            }
            
            const data = await response.json();
            console.log("Country update successful:", data);
        } catch (error) {
            console.error("Error updating country:", error);
        }
    };
    const favoriteClick = async () => {
        setClick(!isClick);
        console.log("Saved?:")
        console.log(isClick);
        const token = localStorage.getItem('authToken');
        await fetch(BASE_USER_RECIPES, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({...recipedata,
                favorite: !isClick
            })
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
        let data = null;
        setIsLoading(true);
        try {
            // First get basic recipe details
            console.log('Fetching recipe details from:', `${BASE_URL}detail?id=${recipeID}`);
            const response = await fetch(`${BASE_URL}detail?id=${recipeID}`);
            data = await response.json();
            console.log('Recipe data received:', data);

            // Check if this recipe is already saved with cultural info
            const token = localStorage.getItem('authToken');
            const userRecipesResponse = await fetch(`${API_BASE_URL}/user-recipe`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (userRecipesResponse.ok) {
                const userRecipes = await userRecipesResponse.json();
                const savedRecipe = userRecipes.recipes.find(r => r.recipeId === recipeID);
                
                // Check if savedRecipe exists before accessing its properties
                if (savedRecipe) {
                    setClick(savedRecipe.favorite || false);
                    
                    if (savedRecipe.recipe?.origin && savedRecipe.recipe?.culturalContext) {
                        console.log('Found existing cultural information');
                        setCulturalContext(savedRecipe.recipe.culturalContext);
                        setOrigin(savedRecipe.recipe.origin);
                        setRecipe({
                            ...data,
                            origin: savedRecipe.recipe.origin,
                            culturalContext: savedRecipe.recipe.culturalContext
                        });
                        setIsLoading(false);
                        return;
                    }
                }
            }

            // If no saved cultural info, get it from the API
            console.log('Cultural information missing, fetching from API...');
            const culturalUrl = `${API_BASE_URL}/culture/context`;
            const requestBody = { recipeId: recipeID };
            
            const culturalResponse = await fetch(culturalUrl, {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Cultural response status:', culturalResponse.status);
            
            if (culturalResponse.ok) {
                const culturalInfo = await culturalResponse.json();
                console.log('Cultural info received:', culturalInfo);
                
                // Save the cultural information
                await fetch(`${API_BASE_URL}/user-recipe`, {
                    method: 'POST',
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        recipeId: recipeID,
                        origin: culturalInfo.origin,
                        culturalContext: culturalInfo.culturalContext
                    })
                });

                // Update local state
                setCulturalContext(culturalInfo.culturalContext);
                setOrigin(culturalInfo.origin);
                setRecipe({
                    ...data,
                    origin: culturalInfo.origin,
                    culturalContext: culturalInfo.culturalContext
                });
            } else {
                const errorText = await culturalResponse.text();
                console.log('Cultural response not OK. Status:', culturalResponse.status);
                console.log('Error text:', errorText);
                setRecipe(data);
            }
        } catch (error) {
            console.error('Error in getRecipe:', error);
            if (data) {
                setRecipe(data);
            }
        }
        setIsLoading(false);
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
    const closeSurvey = () => {
        setShowSurvey(false);
    };
    const handleSurveySubmit = async (surveyData) => {
        try {
            const token = localStorage.getItem('authToken');
            const apiBaseUrl = 'https://b60ih09kxi.execute-api.us-east-2.amazonaws.com/dev';

            // First, get current user data
            const userDataResponse = await axios.get(`${apiBaseUrl}/auth/getUserData`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Get current preferences and disliked ingredients
            const currentPreferences = userDataResponse.data.preferences || {};
            const currentDislikedIngredients = currentPreferences.dislikedIngredients || [];

            // Add new disliked ingredients to the existing list (avoid duplicates)
            const newDislikedIngredients = [...new Set([
                ...currentDislikedIngredients,
                ...surveyData.dislikedIngredients // Make sure this matches your survey data structure
            ])];

            // Update user preferences with the new combined list
            await axios.post(`${apiBaseUrl}/auth/updateUserData`, {
                preferences: {
                    ...currentPreferences,
                    dislikedIngredients: newDislikedIngredients
                }
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Save recipe completion data
            await axios.post(BASE_USER_RECIPES, {
                recipeId: RecipeID,
                rating: surveyData.rating,
                wouldCookAgain: surveyData.wouldCookAgain,
                notes: surveyData.notes
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Trigger front page refresh
            localStorage.setItem('recipeCompleted', Date.now().toString());
            navigate('/home');
        } catch (error) {
            console.error('Error submitting survey:', error);
        }
    };
    const listingredients = (recipe.extendedIngredients) ? recipe.extendedIngredients.map((ingredient, index) =>
        <li key={`ingredient-${index}`}>
            {ingredient.original}
        </li>
    ) : <div></div>;
    const finishbutton = (instructions && instructions[0] && instructions[0].steps) ? 
        (clickedSteps.includes(instructions[0].steps.length-1) ? 
            <div className='finish-recipe' onClick={finishClick}> 
                <h3>Finish Recipe</h3>
            </div> 
            : <div></div>
        ) : <div></div>;
    const listinstructions = (instructions && instructions[0] && instructions[0].steps) ? 
        instructions[0].steps.map((instruction) =>
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
                <div className='brand' onClick={handleBrandClick} style={{cursor: 'pointer'}}>
                    NomadChef
                    <img src={wisk_icon} alt="Whisk Icon" className="whisk" />
                </div>
                <div className='list-items'>             
                    <ul className="nav-list">
                        <li>
                            <button onClick={handlePastRecipesClick} className='nav-button'>
                                Past Recipes
                            </button>
                        </li>
                        <li>
                            <button onClick={handleAccountClick} className='nav-button'>
                                Account
                            </button>
                        </li>
                        <li>
                            <button onClick={handleLogout} className='nav-button logout-button'>
                                Logout
                            </button>
                        </li>
                    </ul>
                </div>
            </nav>

            <section className="section">
                <div className='box-main'>
                    <h1>{recipe.title}</h1>
                    <div className="action-buttons">
                        <div className="heart-button">
                            <Heart isclick={isClick} onClick={() => favoriteClick()} />
                        </div>
                        <div className='save-button' onClick={() => favoriteClick()}>{isClick ? "Saved" : "Save"}</div>
                    </div>
                </div>

                <div className="origin-line">
                    {isLoading ? (
                        <div className="loading-spinner">Loading origin...</div>
                    ) : (
                        <p>
                            {origin ? (
                                <>
                                    {origin.country && <span><strong>Country:</strong> {origin.country}</span>}
                                    {origin.region && <span> • <strong>Region:</strong> {origin.region}</span>}
                                    {origin.locality && <span> • <strong>Locality:</strong> {origin.locality}</span>}
                                </>
                            ) : (
                                "Origin information not available"
                            )}
                        </p>
                    )}
                </div>

                <div className="box-main">
                    <div className="firstHalf" style={{ overflow: 'visible' }}>
                        <img src={recipe.image} alt={recipe.title || "Recipe image"} />
                    </div>
                    <div className="cultural-context-box">
                        {isLoading ? (
                            <div className="loading-spinner">Loading cultural context...</div>
                        ) : (
                            <>
                                {culturalContext ? (
                                    <div>
                                        <p>
                                            {showFullContext 
                                                ? culturalContext 
                                                : culturalContext.substring(0, MAX_CONTEXT_LENGTH) + "..."}
                                        </p>
                                        {culturalContext.length > MAX_CONTEXT_LENGTH && (
                                            <span 
                                                className="read-more-link"
                                                onClick={() => setShowFullContext(!showFullContext)}
                                            >
                                                {showFullContext ? "Read less" : "Read more"}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    "Cultural information not available"
                                )}
                            </>
                        )}
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
                onClose={closeSurvey}
                recipe={recipe}
                onSubmit={handleSurveySubmit}
            />
        </div>
    );
}

export default RecipePage;
