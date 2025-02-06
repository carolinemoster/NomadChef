import React, { useState } from 'react';
import World from '@react-map/world';
import './FrontPage.css';
import PromptBox from '../Components/PromptingBox/PromptBox';
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import wisk_icon from '../Components/Assets/wisk.png';

function FrontPage() {
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
                        <World 
                            size={800} 
                            hoverColor="#2d8b4e"
                            type='select-multiple'
                            tooltip={true}
                            tooltipStyle={{
                                background: 'rgba(255, 255, 255, 0.95)',
                                color: '#0d4725',
                                border: '2px solid #0d4725',
                                borderRadius: '8px',
                                padding: '5px 10px'
                            }}
                            viewBox="0 0 800 400"
                            zoom={zoom}
                            onSelect={(country) => {
                                if (country.selected) {
                                    console.log('Country selected:', country.name);
                                } else {
                                    console.log('Country deselected:', country.name);
                                }
                            }}
                        />
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
