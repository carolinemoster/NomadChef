import React from 'react';
import './SmallRecipeCard.css';

const SmallRecipeCard = ({ image, name, fallbackText = "No image available" }) => {
    return (
        <div className="small-recipe-card">
            {image && image !== 'No image available' ? (
                <img src={image} alt={name} className="small-recipe-image" />
            ) : (
                <div className="small-recipe-image-placeholder">{fallbackText}</div>
            )}
            <h4 className="small-recipe-title">{name}</h4>
        </div>
    );
};

export default SmallRecipeCard;