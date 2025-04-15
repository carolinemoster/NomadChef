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
    const [rating, setRating] = useState(0);
    const [unwantedIngredients, setUnwantedIngredients] = useState([]);
    const [wouldCookAgain, setWouldCookAgain] = useState('');

    if (!isOpen) return null;

    const handleClose = (e) => {
        // Only close if clicking the overlay (not the modal content)
        if (e.target.className === 'modal-overlay') {
            onClose();
        }
    };

    const handleSubmit = () => {
        onSubmit({
            rating,
            unwantedIngredients,
            wouldCookAgain
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
                            <label key={`ingredient-${index}`} style={{ 
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
                    wouldCookAgain: surveyData.wouldCookAgain,
                    favorite: isClick
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
            if (origin && origin.country) {
                console.log("Attempting to update country for:", origin.country);
                const countryCode = getCode(origin.country);
                
                if (countryCode) {
                    console.log("Valid country code found:", countryCode);
                    await fetch(BASE_USER_COUNTRIES, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            code: countryCode.toLowerCase()
                        })
                    }).then(response => {
                        if (!response.ok) {
                            throw new Error('Failed to update country');
                        }
                        return response.json();
                    }).then(data => {
                        console.log("Country update successful:", data);
                    });
                } else {
                    console.warn("Could not find valid country code for:", origin.country);
                }
            } else {
                console.log("No valid country information available for this recipe");
            }
            
            // After successful submission, trigger recommended recipes reload
            localStorage.setItem('recipeCompleted', Date.now().toString());
            
            navigate('/home');
        } catch (error) {
            console.error('Error updating preferences:', error);
            console.error('Error details:', error.message);
            navigate('/home');
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
