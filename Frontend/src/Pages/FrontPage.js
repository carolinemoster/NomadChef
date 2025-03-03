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
const BASE_URL = "https://api.spoonacular.com/recipes/complexSearch";
const BASE_USER_RECIPES = "https://b60ih09kxi.execute-api.us-east-2.amazonaws.com/dev/user-recipe";
const BASE_USER_INFO = "https://b60ih09kxi.execute-api.us-east-2.amazonaws.com/dev/getUserData";

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
    const historylist = history.length > 0 ? history.map((item) => 
        <div onClick={() => recipeClicked(item.recipeId)}>
        <RecipeCard image= {item.recipe.image} name={item.recipe.title}> </RecipeCard>
        </div>
    ) :
    <p></p>

    const recipeClicked = (recipeID) => {
        navigate('/Recipe', {state: {recipeID}});
      }

    const getHistory = async () => {  
        const token = localStorage.getItem('authToken'); 
        const response = await fetch(BASE_USER_RECIPES, {
            method: "GET",  
            headers: {
              "Authorization": `Bearer ${token}`, 
              "Content-Type": "application/json" 
            }});
        const data = await response.json();
        if(data) {
            setHistory(data.recipes || []);
        }
    }
    useEffect(() => {
        window.scrollTo(0, 0);
        getHistory();

    }, []);

    const handleZoomIn = () => {
        if (zoom < 4) {
            setZoom(zoom + 0.5);
        }
    };

    const handleZoomOut = () => {
        if (zoom > 0.5) {
            setZoom(zoom - 0.5);
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
                        <li><a href="#courses">About</a></li>
                        <li><button onClick={handlePastRecipesClick} className='nav-button'>Past Recipes</button></li>
                        <li><a href="#jobs">Settings</a></li>
                        <li>
                            <button 
                                onClick={handleAccountClick} 
                                className="nav-button"
                            >
                                Account
                            </button>
                        </li>
                    </ul>
                </div>
            </nav>

            <section className="section">
                <div className="box-main">
                    <div className="firstHalf" style={{ overflow: 'visible' }}>
                        <div className="map-controls">
                            <button onClick={handleZoomIn}>+</button>
                            <button onClick={handleZoomOut}>-</button>
                        </div>
                        
                        
                        <Map>
                        <VectorMap
                            {...worldMap}
                            style={{ width: "80%", height: "100%" }}
                            checkedLayers={['us', 'in', 'uk']} currentLayers={['cn']}
                            
                            
                        />
                        </Map>
                       
                        
                    </div>
                </div>
            </section>
            <section className="section">
                <div className="box-main">
                    <PromptBox/>
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
