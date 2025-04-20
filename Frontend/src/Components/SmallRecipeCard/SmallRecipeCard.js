import React from 'react';
import './SmallRecipeCard.css';

const SmallRecipeCard = ({ image, name, fallbackText = "No image available" }) => {
    return (
        <div className="small-recipe-card">
            {image && image !== 'No image available' ? (
                <div className="small-recipe-image-container">
                    <img 
                        src={image} 
                        alt={name} 
                        className="small-recipe-image"
                    />
                </div>
            ) : (
                <div className="small-recipe-image-placeholder">{fallbackText}</div>
            )}
            <div className="small-recipe-card-content">
                <div className="small-recipe-card-title">{name}</div>
            </div>
        </div>
    );
};

export default SmallRecipeCard;