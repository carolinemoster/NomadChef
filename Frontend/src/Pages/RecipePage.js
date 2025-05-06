import React, { useState, useEffect, useRef } from 'react';
import './RecipePage.css';
import "react-multi-carousel/lib/styles.css";
import wisk_icon from '../Components/Assets/wisk.png';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Heart from "react-animated-heart"
import { FaStar, FaClock, FaUsers, FaDollarSign } from 'react-icons/fa';
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

// Add this function to decode HTML entities
const decodeHtml = (html) => {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};

// Add this helper function at the top of your file, outside the RecipePage component
const formatPrice = (price) => {
    return (price / 100).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
    });
};

function RecipePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [clickedSteps, setClickedSteps] = useState([]);
    const RecipeID = location.state?.recipeID;
    const [recipe, setRecipe] = useState([]);
    const [instructions, setInstructions] = useState([]);
    const [newRecipe, setNewRecipe] = useState(true);
    const [isClick, setClick] = useState(false);
    const [showSurvey, setShowSurvey] = useState(false);
    const { getCode, getName } = require('country-list');
    const recipedata = {
        recipeId: RecipeID
    };
    const [culturalContext, setCulturalContext] = useState(null);
    const [origin, setOrigin] = useState(null);
    
    // Separate loading states for different data types
    const [isLoadingRecipe, setIsLoadingRecipe] = useState(true);
    const [isLoadingCultural, setIsLoadingCultural] = useState(true);
    const [isLoadingInstructions, setIsLoadingInstructions] = useState(true);
    
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
    const handleChallengesClick = () => {
        navigate('/challenges');
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/');
    };
    const recipeRequestRef = useRef(false);
    const culturalRequestRef = useRef(false);
    
    useEffect(() => {
        if (RecipeID) {
            // Reset request flags when RecipeID changes
            recipeRequestRef.current = false;
            culturalRequestRef.current = false;
            
            // Fetch recipe details and instructions
            getRecipe(RecipeID);
            getInstructions(RecipeID);
        }

        // Add event listener for browser back button
        const handlePopState = () => {
            window.location.reload();
        };

        // Add event listener for browser reload button
        const handleBeforeUnload = () => {
            // Clear any cached data if needed
            sessionStorage.removeItem("recipeDetails");
        };

        window.addEventListener('popstate', handlePopState);
        window.addEventListener('beforeunload', handleBeforeUnload);
        
        // Clean up function
        return () => {
            // Reset the refs when component unmounts
            recipeRequestRef.current = false;
            culturalRequestRef.current = false;
            // Remove event listeners
            window.removeEventListener('popstate', handlePopState);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [RecipeID]);
    
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
    const stepClicked = (setIndex, stepNumber) => {
        const stepId = `${setIndex}-${stepNumber}`;
        setClickedSteps((prev) =>
            prev.includes(stepId)
                ? prev.filter((id) => id !== stepId)
                : [...prev, stepId]
        );
    };
    
    const addPoints = async (pointsAmount) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/auth/addUserPoints`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    points: pointsAmount
                })
            });
            if (!response.ok) {
                throw new Error('Failed to update user points');
            }
            const data = await response.json();
            console.log("points update successful:", data);
        }
        catch {
            console.log("Error updating points");
        }
    };

    const getRecipe = async (recipeID) => {
        // If we've already started this request, don't do it again
        if (recipeRequestRef.current) {
            console.log('Recipe request already in progress, skipping duplicate call');
            return;
        }
        
        // Mark that we've started the request
        recipeRequestRef.current = true;
        
        setIsLoadingRecipe(true);
        try {
            // First get basic recipe details
            console.log('Fetching recipe details from:', `${BASE_URL}detail?id=${recipeID}`);
            const response = await fetch(`${BASE_URL}detail?id=${recipeID}`);
            const data = await response.json();
            console.log('Recipe data received:', data);
            
            // Set basic recipe data immediately so it renders
            setRecipe(data);
            setIsLoadingRecipe(false);
            
            // Then fetch cultural info in the background
            fetchCulturalInfo(recipeID, data);
            
        } catch (error) {
            console.error('Error in getRecipe:', error);
            setIsLoadingRecipe(false);
        }
    }
    
    const fetchCulturalInfo = async (recipeID, recipeData) => {
        // Prevent duplicate calls using ref
        if (culturalRequestRef.current) {
            console.log('Cultural info fetch already in progress, skipping');
            return;
        }
        
        // Mark that we've started the cultural request
        culturalRequestRef.current = true;
        setIsLoadingCultural(true);
        
        try {
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
                
                if (savedRecipe && savedRecipe.recipe?.origin && savedRecipe.recipe?.culturalContext) {
                    console.log('Found existing cultural information');
                    setCulturalContext(savedRecipe.recipe.culturalContext);
                    setOrigin(savedRecipe.recipe.origin);
                    setRecipe(prev => ({
                        ...prev,
                        origin: savedRecipe.recipe.origin,
                        culturalContext: savedRecipe.recipe.culturalContext
                    }));
                    setIsLoadingCultural(false);
                    return;
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

                // Update local state
                setCulturalContext(culturalInfo.culturalContext);
                setOrigin(culturalInfo.origin);
                setRecipe(prev => ({
                    ...prev,
                    origin: culturalInfo.origin,
                    culturalContext: culturalInfo.culturalContext
                }));
                
                // Save the cultural information
                fetch(`${API_BASE_URL}/user-recipe`, {
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
                }).catch(error => {
                    console.error('Error saving cultural info:', error);
                });
            } else {
                const errorText = await culturalResponse.text();
                console.log('Cultural response not OK. Status:', culturalResponse.status);
                console.log('Error text:', errorText);
            }
        } catch (error) {
            console.error('Error fetching cultural info:', error);
        }
        setIsLoadingCultural(false);
    }

    const updateSingleChallenge = async (challenge) => {
        try {
            console.log(challenge._id);
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/auth/updateUserChallenge`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: challenge._id
                })
            });
            if (!response.ok) {
                throw new Error('Failed to update user points');
            }
            const data = await response.json();
            console.log("challenge update successful:", data);

            if(data.isCompleted) {
                switch(parseInt(challenge.type)) {
                    case(1): addPoints(300);
                    break;
                    case(2): addPoints(400);
                    break;
                    case(3): addPoints(100);
                    break;
                    case(4): addPoints(400);
                    break;
                }
            }
        }
        catch {
            console.log("Error updating points");
        }
    };


    const updateChallenges = async () => {
        console.log(newRecipe);
        try {
            const token = localStorage.getItem('authToken'); 
            const response = await fetch(`${API_BASE_URL}/auth/getUserChallenges`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}, ${response.statusText}`);
            }
    
            const data = await response.json();
            if(data.challenges.length == 0) { //If no challenges then don't progress
                return;
            }
            console.log("Challenge array recieved");
            for (const challenge of data.challenges) {

                if(challenge.completed === true) { //If challenge is already completed then move on
                    console.log("Completed challenge");
                    continue;
                }
                //Update Challenges based on type
                switch(parseInt(challenge.type)) {
                    case(1): 
                        if((challenge.condition).toLowerCase() === (getCode(origin.country)).toLowerCase()) {
                            console.log(challenge.id);
                            updateSingleChallenge(challenge);
                        }
                        break;
                    case(2): 
                        if((challenge.condition).toLowerCase() === (origin.region).toLowerCase()) {
                            updateSingleChallenge(challenge);
                        }
                        break;
                    case(3): 
                        if(newRecipe) {
                            updateSingleChallenge(challenge);
                            console.log("New recipe challenge hit");
                        }
                        break;
                    case(4): 
                        if(!newRecipe) {
                            updateSingleChallenge(challenge);
                        }
                        break;
                    default:
                        break;
                } 

            }
            return;
        }
        catch {
            console.log("Error getting user challenges");
        }
    }

    const getInstructions = async (recipeID) => {
        setIsLoadingInstructions(true);
        try {
            const flush = '27630916589947baa9da132202bff648'
            const response2 = await fetch(`${BASE_SPOON}${recipeID}/analyzedInstructions?apiKey=${flush}&stepBreakdown=true`);
            const data2 = await response2.json();
            setInstructions(data2);
        } catch (error) {
            console.error('Error fetching instructions:', error);
        }
        setIsLoadingInstructions(false);
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
            await addPoints(50);
            await updateChallenges();
            navigate('/home');
        } catch (error) {
            console.error('Error submitting survey:', error);
        }
    };
    const listingredients = (recipe.extendedIngredients) ? recipe.extendedIngredients.map((ingredient, index) =>
        <li key={`ingredient-${index}`} className="ingredient-item">
            <div className="ingredient-content">
                {ingredient.image && (
                    <img 
                        src={`https://spoonacular.com/cdn/ingredients_100x100/${ingredient.image}`}
                        alt={ingredient.name}
                        className="ingredient-image"
                        onError={(e) => e.target.style.display = 'none'}
                    />
                )}
                <span className="ingredient-text">{ingredient.original}</span>
            </div>
        </li>
    ) : <div>No ingredients available</div>;
    const finishbutton = (instructions && instructions[0] && instructions[0].steps) ? 
        (clickedSteps.includes(instructions[0].steps.length-1) ? 
            <div className='finish-recipe' onClick={finishClick}> 
                <h3>Finish Recipe</h3>
            </div> 
            : <div></div>
        ) : <div></div>;
    const renderInstructions = () => {
        if (!instructions || instructions.length === 0) {
            return <p>No Instructions</p>;
        }

        return instructions.map((instructionSet, setIndex) => (
            <div key={`instruction-set-${setIndex}`} className="instruction-set">
                {instructionSet.name && (
                    <h3 className="instruction-set-name">{instructionSet.name}</h3>
                )}
                <ul className="steps-ul">
                    {instructionSet.steps.map((instruction) => {
                        // Collect all possible images from both equipment and ingredients
                        const possibleImages = [];
                        
                        // Add equipment images
                        if (instruction.equipment && instruction.equipment.length > 0) {
                            instruction.equipment.forEach(item => {
                                if (item.image) {
                                    // Fix the double URL issue
                                    const imageUrl = item.image.startsWith('http') 
                                        ? item.image 
                                        : `https://spoonacular.com/cdn/equipment_100x100/${item.image}`;
                                    
                                    possibleImages.push({
                                        url: imageUrl,
                                        name: item.name,
                                        type: 'equipment'
                                    });
                                }
                            });
                        }
                        
                        // Add ingredient images with the same URL fix
                        if (instruction.ingredients && instruction.ingredients.length > 0) {
                            instruction.ingredients.forEach(item => {
                                if (item.image) {
                                    // Fix the double URL issue
                                    const imageUrl = item.image.startsWith('http') 
                                        ? item.image 
                                        : `https://spoonacular.com/cdn/ingredients_100x100/${item.image}`;
                                    
                                    possibleImages.push({
                                        url: imageUrl,
                                        name: item.name,
                                        type: 'ingredient'
                                    });
                                }
                            });
                        }
                        
                        return (
                            <li key={`${setIndex}-step-${instruction.number}`}>
                                <div className={`step-box ${clickedSteps.includes(`${setIndex}-${instruction.number-1}`) ? 'completed' : ''}`}>
                                    <div className='step-box-left'>
                                        <input
                                            type="checkbox"
                                            className="step-checkbox"
                                            checked={clickedSteps.includes(`${setIndex}-${instruction.number-1}`)}
                                            onChange={() => stepClicked(setIndex, instruction.number-1)}
                                        />
                                    </div>
                                    <div className='step-box-right'>
                                        <div className="step-content">
                                            <p>{decodeHtml(instruction.step)}</p>
                                            
                                            {possibleImages.length > 0 ? (
                                                <div className="step-images-wrapper" style={{ position: 'relative' }}>
                                                    {possibleImages.map((image, idx) => (
                                                        <div 
                                                            key={`image-${idx}`} 
                                                            className="step-image-container" 
                                                            style={{ 
                                                                display: idx === 0 ? 'block' : 'none',
                                                                position: 'relative'  // Ensure proper stacking
                                                            }}
                                                            data-image-index={idx}
                                                            data-total-images={possibleImages.length}
                                                        >
                                                            <img 
                                                                src={image.url} 
                                                                alt={image.name} 
                                                                title={image.name}
                                                                className="step-image"
                                                                onError={(e) => {
                                                                    // Immediately hide the broken image itself
                                                                    e.target.style.display = 'none';
                                                                    
                                                                    console.error(`Failed to load image for ${image.name}:`, image.url);
                                                                    
                                                                    // Hide this image container
                                                                    const container = e.target.parentNode;
                                                                    container.style.display = 'none';
                                                                    
                                                                    // Show the next image if available
                                                                    const currentIndex = parseInt(container.dataset.imageIndex);
                                                                    const totalImages = parseInt(container.dataset.totalImages);
                                                                    
                                                                    if (currentIndex < totalImages - 1) {
                                                                        // Hide ALL other image containers first
                                                                        const wrapper = container.parentNode;
                                                                        const allContainers = wrapper.querySelectorAll('.step-image-container');
                                                                        allContainers.forEach(c => {
                                                                            c.style.display = 'none';
                                                                        });
                                                                        
                                                                        // Then show only the next one
                                                                        const nextContainer = wrapper.querySelector(`[data-image-index="${currentIndex + 1}"]`);
                                                                        if (nextContainer) {
                                                                            nextContainer.style.display = 'block';
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="step-image-placeholder"></div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        ));
    };
    
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
                            <button onClick={handleChallengesClick} className='nav-button'>
                                Challenges
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
                            <Heart isClick={isClick} onClick={() => favoriteClick()} />
                        </div>
                        <div className='save-button' onClick={() => favoriteClick()}>{isClick ? "Saved" : "Save"}</div>
                    </div>
                </div>

                {!isLoadingRecipe && recipe && (
                    <div className="recipe-metrics">
                        <div className="metrics-container">
                            <div className="metric-item">
                                <div className="metric-icon">
                                    <FaDollarSign className="icon" />
                                </div>
                                <div className="metric-content">
                                    <span className="metric-value">{recipe.pricePerServing ? formatPrice(recipe.pricePerServing) : 'N/A'}</span>
                                    <span className="metric-label">per serving</span>
                                </div>
                            </div>

                            <div className="metric-item">
                                <div className="metric-icon">
                                    <FaUsers className="icon" />
                                </div>
                                <div className="metric-content">
                                    <span className="metric-value">{recipe.servings || 'N/A'}</span>
                                    <span className="metric-label">servings</span>
                                </div>
                            </div>

                            <div className="metric-item">
                                <div className="metric-icon">
                                    <FaClock className="icon" />
                                </div>
                                <div className="metric-content">
                                    <span className="metric-value">{recipe.readyInMinutes || 'N/A'}</span>
                                    <span className="metric-label">minutes</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="origin-line">
                    {isLoadingCultural ? (
                        <div className="loading-container">
                            <span className="loading-text">Loading origin...</span>
                            <div className="loading-spinner"></div>
                        </div>
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
                        {isLoadingRecipe ? (
                            <div className="loading-container">
                                <span className="loading-text">Loading image...</span>
                                <div className="loading-spinner"></div>
                            </div>
                        ) : (
                            <img src={recipe.image} alt={recipe.title || "Recipe image"} />
                        )}
                    </div>
                    <div className="cultural-context-box">
                        {isLoadingCultural ? (
                            <div className="loading-container">
                                <span className="loading-text">Loading cultural context...</span>
                                <div className="loading-spinner"></div>
                            </div>
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
                <div className="origin-line"></div>
                <div className='box-main ingredients-container'>
                    {isLoadingRecipe ? (
                        <div className="loading-container">
                            <span className="loading-text">Loading ingredients...</span>
                            <div className="loading-spinner"></div>
                        </div>
                    ) : (
                        <ul className="ingredients-list">
                            {listingredients}
                        </ul>
                    )}
                </div>
                <h2>Instructions</h2>
                <div className="origin-line"></div>
                <div className='box-main'>
                    {isLoadingInstructions ? (
                        <div className="loading-container">
                            <span className="loading-text">Loading instructions...</span>
                            <div className="loading-spinner"></div>
                        </div>
                    ) : (
                        renderInstructions()
                    )}
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
