import React, { useState } from 'react';
import { VectorMap } from '@south-paw/react-vector-maps';
import worldMap from "../Components/Assets/world.json"
import './FrontPage.css';
import PromptBox from '../Components/PromptingBox/PromptBox';
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import wisk_icon from '../Components/Assets/wisk.png';
import styled from 'styled-components'

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
                <div className="slider">
                    <Carousel responsive={responsive}>
                        <div className="product-box">Item 1</div>
                        <div className="product-box">Item 2</div>
                        <div>Item 3</div>
                        <div>Item 4</div>
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
