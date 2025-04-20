import React from 'react';
import './RecipeCard.css';

const RecipeCard = ({ image, name }) => {
    return (
        <div className="recipe-card">
            {image ? (
                <div className="recipe-image-container">
                    <img 
                        src={image} 
                        alt={name} 
                        className="recipe-image"
                    />
                </div>
            ) : (
                <div className="recipe-image-placeholder">No image available</div>
            )}
            <div className="recipe-card-content">
                <div className="recipe-card-title">{name}</div>
            </div>
        </div>
    );
};

export default RecipeCard;