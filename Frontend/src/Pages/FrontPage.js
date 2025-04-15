import React, { useState, useEffect } from 'react';
import { VectorMap } from '@south-paw/react-vector-maps';
import worldMap from "../Components/Assets/world.json"
import './FrontPage.css';
import PromptBox from '../Components/PromptingBox/PromptBox';
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import wisk_icon from '../Components/Assets/wisk.png';
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom';
import RecipeCard from '../Components/RecipeCard/RecipeCard';
import SmallRecipeCard from '../Components/SmallRecipeCard/SmallRecipeCard';
import ProgressBar from '@ramonak/react-progress-bar'
import { Swiper, SwiperSlide } from 'swiper/react';
const BASE_URL = "https://api.spoonacular.com/recipes/complexSearch";
const BASE_USER_RECIPES = "https://b60ih09kxi.execute-api.us-east-2.amazonaws.com/dev/user-recipe";
const BASE_USER_INFO = "https://b60ih09kxi.execute-api.us-east-2.amazonaws.com/dev/getUserData";
const BASE_USER_COUNTRIES = "https://b60ih09kxi.execute-api.us-east-2.amazonaws.com/dev/auth/getUserCountries"
const BASE_RECIPES_URL = "https://b60ih09kxi.execute-api.us-east-2.amazonaws.com/dev/recipes";

function FrontPage() {
    const Map = styled.div`
        width: 80% !important;
        max-width: 1000px;
        margin: 0 auto;

        svg {
            stroke: rgb(0,0,0);
            width: 100%;
            height: auto;

            path {
                fill: rgb(255, 255, 255);
                cursor: pointer;
                outline: none;
                transition: all 0.3s ease;

                &:hover {
                    fill: #2d8b4e;
                }

                &:focus {
                    fill: #2d8b4e;
                }

                &[aria-checked='true'] {
                    fill: #2d8b4e !important;
                }

                &[aria-current='true'] {
                    fill: #2d8b4e !important;
                }
            }
        }
    `;
    const [zoom, setZoom] = useState(1);
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const { getCode, getName } = require('country-list');
    const [selectedCountryList, setSelectedCountryList] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [completedCountries, setCountries] = useState([]);
    const [completedCountriesCount, setCountriesCount] = useState(0);
    const [recommendedRecipes, setRecommendedRecipes] = useState([]);
    const mapLayerProps = {
        onClick: ({ target }) => handleCountryClick(target.attributes.name.value),
      };
    const handleCountryClick = (countrySelect) => {
        setSelectedCountry(countrySelect);
        
        if(countrySelect !== undefined) {
            const countrySelectLower = countrySelect.toLowerCase();
            
            const matchingRecipes = history.filter(r => {
                if (!r.recipe.origin || !r.recipe.origin.country) {
                    return false;
                }
                
                const recipeCountry = r.recipe.origin.country.toLowerCase();
                
                // Direct match
                if (recipeCountry === countrySelectLower) {
                    return true;
                }
                
                // Check common variations
                const variations = {
                    'vn': ['vietnam', 'vietnamese'],
                    'us': ['united states', 'usa', 'united states of america'],
                    'gb': ['united kingdom', 'great britain'],
                    'it': ['italy', 'italian'],
                    'fr': ['france', 'french'],
                    'es': ['spain', 'spanish'],
                    'de': ['germany', 'german'],
                    'cn': ['china', 'chinese'],
                    'jp': ['japan', 'japanese'],
                    'mx': ['mexico', 'mexican'],
                    'in': ['india', 'indian'],
                    'th': ['thailand', 'thai'],
                    'gr': ['greece', 'greek'],
                    'tr': ['turkey', 'turkish']
                };
                
                // Check if the recipe country matches any variation of the selected country
                if (variations[countrySelectLower] && variations[countrySelectLower].includes(recipeCountry)) {
                    return true;
                }
                
                // Check reverse mapping (if recipe has code and selected is full name)
                for (const [code, names] of Object.entries(variations)) {
                    if (names.includes(countrySelectLower) && recipeCountry === code) {
                        return true;
                    }
                }
                
                return false;
            });

            setSelectedCountryList(matchingRecipes);
        }
    };
    const selectedCountryListBoxes = selectedCountryList && selectedCountryList.length > 0 ? selectedCountryList.map((item,index) =>
        <div key={`recipe-${index}`} onClick={() => recipeClicked(item.recipeId)}>
    <SmallRecipeCard 
        image={item.recipe?.image} 
        name={item.recipe?.title}
    /> 
</div>
) : <p></p>;
    const historylist = history && history.length > 0 ? history.map((item, index) => 
        <div key={`recipe-${index}`} onClick={() => recipeClicked(item.recipeId)}>
            <RecipeCard 
                image={item.recipe?.image} 
                name={item.recipe?.title}
            /> 
        </div>
    ) : <p>No recipe history available</p>;

    const recipeClicked = (recipeID) => {
        navigate('/Recipe', {state: {recipeID}});
      }
    const getCountries = async () => {
        try {
            const token = localStorage.getItem('authToken'); 
            console.log("Fetching countries data...");
            const response = await fetch(BASE_USER_COUNTRIES, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const jsonResponse = await response.json();
            console.log("Full countries response:", jsonResponse);
            
            // Get the country codes and filter out null/undefined values
            const countriesCompletedIDs = jsonResponse.countriesCompletedIDs || [];
            console.log("Raw country codes:", countriesCompletedIDs);
            
            // Convert to lowercase and ensure they match the map's format
            const formattedCountryCodes = countriesCompletedIDs
                .filter(code => code !== null && code !== undefined)
                .map(code => code.toLowerCase())
                .map(code => {
                    // Special handling for certain country codes if needed
                    // For example, if 'USA' needs to be 'us', or 'GBR' needs to be 'gb'
                    switch(code) {
                        case 'usa': return 'us';
                        case 'gbr': return 'gb';
                        // Add more cases as needed
                        default: return code;
                    }
                });
                
            console.log("Formatted country codes for map:", formattedCountryCodes);
            
            // Update the state
            setCountries(formattedCountryCodes);
            setCountriesCount(formattedCountryCodes.length);

            // Log the current state of the map's layers
            console.log("Current map layers:", completedCountries);
        } catch (error) {
            console.error("Error fetching countries:", error);
            setCountries([]);
            setCountriesCount(0);
        }
    };
    const getHistory = async () => {  
        try {
            const token = localStorage.getItem('authToken'); 
            console.log("Fetching recipe history...");
            
            const response = await fetch(BASE_USER_RECIPES, {
                method: "GET",  
                headers: {
                    "Authorization": `Bearer ${token}`, 
                    "Content-Type": "application/json" 
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Recipe history received:", data);

            // Make sure we have recipes before setting them
            if (data && Array.isArray(data.recipes)) {
                setHistory(data.recipes);
                
                // Extract and format country codes from recipe history
                const completedCountryCodes = [...new Set(
                    data.recipes
                        .filter(recipe => recipe.recipe.origin && recipe.recipe.origin.country)
                        .map(recipe => {
                            const country = recipe.recipe.origin.country.toLowerCase();
                            // Map country names to their ISO codes
                            const countryMappings = {
                                'united states': 'us',
                                'usa': 'us',
                                'united states of america': 'us',
                                'united kingdom': 'gb',
                                'great britain': 'gb',
                                'italy': 'it',
                                'france': 'fr',
                                'spain': 'es',
                                'germany': 'de',
                                'china': 'cn',
                                'japan': 'jp',
                                'mexico': 'mx',
                                'india': 'in',
                                'thailand': 'th',
                                'vietnam': 'vn',
                                'greece': 'gr',
                                'turkey': 'tr',
                                // Add more mappings as needed
                            };
                            
                            console.log("Processing country:", country);
                            const mappedCode = countryMappings[country] || country;
                            console.log("Mapped to:", mappedCode);
                            return mappedCode;
                        })
                )];
                
                console.log("Formatted country codes for map:", completedCountryCodes);
                
                // Update the completed countries state
                setCountries(completedCountryCodes);
                setCountriesCount(completedCountryCodes.length);
            } else {
                console.log("No recipes found in response:", data);
                setHistory([]);
                setCountries([]);
                setCountriesCount(0);
            }
        } catch (error) {
            console.error("Error fetching recipe history:", error);
            setHistory([]);
            setCountries([]);
            setCountriesCount(0);
        }
    };
    const getRecommendedRecipes = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${BASE_RECIPES_URL}/search?number=4`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Recommended recipes received:", data);

            if (data && Array.isArray(data.results)) {
                setRecommendedRecipes(data.results);
            } else {
                console.log("No recommended recipes found:", data);
                setRecommendedRecipes([]);
            }
        } catch (error) {
            console.error("Error fetching recommended recipes:", error);
            setRecommendedRecipes([]);
        }
    };
    useEffect(() => {
        window.scrollTo(0, 0);
        getHistory();
        getRecommendedRecipes();
    }, []);
    const [startIndex, setStartIndex] = useState(0);
    const endIndex = startIndex + 3;

    const showNext = () => {
        if (endIndex < selectedCountryList.length) {
        setStartIndex(startIndex + 3);
        }
    };

    const showPrev = () => {
        if (startIndex >= 3) {
        setStartIndex(startIndex - 3);
        }
    };

    const handleAccountClick = () => {
        navigate('/account');
    };

    const handlePastRecipesClick = () => {
        navigate('/pastrecipes')
    }

    const handleBrandClick = () => {
        navigate('/home');
    };

    const handleLogout = () => {
        // Clear the auth token
        localStorage.removeItem('authToken');
        // Navigate to login page
        navigate('/');
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

    const CustomProgressBar = () => {
        const validCountryCodes = completedCountries.length;
        const percentage = validCountryCodes > 0 
            ? Math.min(Math.round((validCountryCodes/195)*100), 100)
            : 0;
        
        console.log("Valid country codes count:", validCountryCodes);
        console.log("Progress bar percentage:", percentage);
        
        return (
            <div className="progress-section">
                <h2>Global Culinary Journey Progress</h2>
                <div className="progress-stats">
                    <span>{validCountryCodes} of 195 countries explored</span>
                    <span>{percentage}% completed</span>
                </div>
                <ProgressBar 
                    bgColor='#0d4725' 
                    width='100%' 
                    className='progress-bar' 
                    completed={percentage}
                    labelColor='#ffffff'
                    height='25px'
                    labelSize='16px'
                    baseBgColor='#e0e0de'
                />
            </div>
        );
    };

    const recommendedList = recommendedRecipes.length > 0 ? recommendedRecipes.map((recipe, index) =>
        <div key={`recommended-${index}`} onClick={() => recipeClicked(recipe.id)}>
            <RecipeCard 
                image={recipe.image} 
                name={recipe.title}
            />
        </div>
    ) : <p>Loading recommended recipes...</p>;

    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'recipeCompleted') {
                getRecommendedRecipes();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    useEffect(() => {
        console.log("completedCountries updated:", completedCountries);
    }, [completedCountries]);

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
                <div className="map-and-recipes-container">
                    <div className="map-container">
                        <Map>
                            <VectorMap
                                {...worldMap}
                                style={{ width: "100%", height: "100%" }}
                                checkedLayers={completedCountries}
                                layerProps={mapLayerProps}
                                currentLayers={completedCountries}
                                onLayerClick={({ target }) => handleCountryClick(target.attributes.name.value)}
                            />
                        </Map>
                        <div className="progress-container">
                            <CustomProgressBar />
                        </div>
                    </div>
                    
                    {selectedCountry && selectedCountryList.length > 0 && (
                        <div className="country-recipes-panel">
                            <h3>Recipes from {selectedCountry}</h3>
                            {selectedCountryList.map((item, index) => (
                                <div 
                                    key={`recipe-${index}`} 
                                    className="country-recipe-card"
                                    onClick={() => recipeClicked(item.recipeId)}
                                >
                                    <SmallRecipeCard 
                                        image={item.recipe?.image || 'No image available'} 
                                        name={item.recipe?.title || 'Untitled Recipe'}
                                        fallbackText="No image available"
                                    /> 
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <section className="section">
                <PromptBox/>
            </section>
            <section className="section">
                <h1>Recommended Recipes</h1>
                <div className="slider">
                    <Carousel responsive={responsive}>
                        {recommendedList}
                    </Carousel>
                </div>
            </section>
            <section className="section">
                <h1>History</h1>
                <div className="slider">
                    <Carousel responsive={responsive}>
                        {historylist}
                    </Carousel>
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

export default FrontPage;
