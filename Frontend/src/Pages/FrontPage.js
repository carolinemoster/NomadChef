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
import ProgressBar from '@ramonak/react-progress-bar'
const BASE_URL = "https://api.spoonacular.com/recipes/complexSearch";
const BASE_USER_RECIPES = "https://b60ih09kxi.execute-api.us-east-2.amazonaws.com/dev/user-recipe";
const BASE_USER_INFO = "https://b60ih09kxi.execute-api.us-east-2.amazonaws.com/dev/getUserData";
const BASE_USER_COUNTRIES = "https://b60ih09kxi.execute-api.us-east-2.amazonaws.com/dev/auth/getUserCountries"

function FrontPage() {
    const Map = styled.div`
        margin: 1rem auto;
        width: 1000px;

        svg {
            stroke: rgb(0,0,0);

            // All layers are just path elements
            path {
            fill:rgb(255, 255, 255);
            cursor: pointer;
            outline: none;

            // When a layer is hovered
            &:hover {
                fill: #2d8b4e;
            }

            // When a layer is focused.
            &:focus {
                fill: #2d8b4e;
            }

            // When a layer is 'checked' (via checkedLayers prop).
            &[aria-checked='true'] {
                fill: #2d8b4e;;
            }

            // When a layer is 'selected' (via currentLayers prop).
            &[aria-current='true'] {
                fill: #2d8b4e;;
            }

            // You can also highlight a specific layer via it's id
            &[id="nz-can"] {
                fill: rgba(56,43,168,0.6);
            }
            }
        }
        `;
    const [zoom, setZoom] = useState(1);
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [completedCountries, setCountries] = useState([]);
    const [completedCountriesCount, setCountriesCount] = useState(0);
    const mapLayerProps = {
        onClick: ({ target }) => setSelectedCountry(target.attributes.name.value),
      };
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
            console.log("Setting countries...");
            const response = await fetch(BASE_USER_COUNTRIES, {
                method: "GET",
                headers: {
                  "Authorization": `Bearer ${token}`,
                  "Content-Type": "application/json"
                }
            });
            const jsonResponse = await response.json();
            
            // Check if the response has the expected properties
            const countriesCompleted = jsonResponse.countriesCompleted || 0;
            const countriesCompletedIDs = jsonResponse.countriesCompletedIDs || [];
            
            console.log("Countries completed:", countriesCompleted);
            console.log("Completed country IDs:", countriesCompletedIDs);
            
            setCountriesCount(countriesCompleted);
            setCountries(countriesCompletedIDs);
        } catch (error) {
            console.error("Error fetching countries:", error);
            // Set default values in case of error
            setCountriesCount(0);
            setCountries([]);
        }
    }
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
            } else {
                console.log("No recipes found in response:", data);
                setHistory([]);
            }
        } catch (error) {
            console.error("Error fetching recipe history:", error);
            setHistory([]);
        }
    };
    useEffect(() => {
        window.scrollTo(0, 0);
        getHistory();
        getCountries();

    }, []);

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
        return (
            <ProgressBar 
                bgColor='#0d4725' 
                width='100%' 
                className='progress-bar' 
                completed={Math.round((completedCountriesCount/195)*100)}
            />
        );
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
                <div className="box-main">
                    <div className="firstHalf" style={{ overflow: 'visible' }}>
                        <div>
                            <Map>
                                <VectorMap
                                    {...worldMap}
                                    style={{ width: "80%", height: "100%" }}
                                    checkedLayers={completedCountries}
                                    layerProps={mapLayerProps}
                                />
                            </Map>
                        </div>
                    </div>
                </div>
                <div className='box-main'>
                    <CustomProgressBar />
                </div>
            </section>
            <section className="section">
                <PromptBox/>
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
