import React from 'react';
import './RecipeCard.css';

const RecipeCard = ({ image, name, summary }) => {
    return (
        <div className="recipe-card">
            {image ? (
                <img 
                    src={image} 
                    alt={name} 
                    className="recipe-image"
                />
            ) : (
                <div className="recipe-image-placeholder">No image available</div>
            )}
            <div className="recipe-card-title">
                {name}
            </div>
            {summary && (
                <div className="recipe-summary">
                    {summary.length > 100 ? `${summary.substring(0, 100)}...` : summary}
                </div>
            )}
        </div>
    );
};

export default RecipeCard;