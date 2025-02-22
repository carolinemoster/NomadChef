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
        <RecipeCard image= {item.image} name={item.title} summary={item.summary}> </RecipeCard>
    ) :
    <RecipeCard></RecipeCard>

    const getHistory = async () => {  
        const response = await fetch(`${BASE_URL}?apiKey=${process.env.REACT_APP_SPOONACULAR_KEY}&query=pasta&addRecipeInformation=true`);
        const data = await response.json();
        setHistory(data.results || []); // Fixed: store only `results` array
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
                        <li><a href="#tutorials">Past Recipes</a></li>
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
