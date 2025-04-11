import React from 'react';
import './SmallRecipeCard.css';

const SmallRecipeCard = ({ image, name}) => {
    return (
        <div className="small-recipe-card">
            <img 
                src={image} 
                alt={name} 
                className="small-recipe-image"
                onError={(e) => {
                    e.target.src = 'path/to/fallback/image.jpg'; // Add a fallback image
                }}
            />
            <div className="recipe-card-title">
                {name}
            </div>
        </div>
    );
};

export default SmallRecipeCard;