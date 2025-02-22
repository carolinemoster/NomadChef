import { useState } from "react";
import './RecipeCard.css';


const RecipeCard = ({image, name, summary}) => {
  
  return (
    <div className="recipe-card">
        <div className="recipe-card-title"><h3>{name}</h3></div>
        <img className="recipe-image" src={image}></img>
        <p className="recipe-summary">{summary}</p>
    </div>
  );
};

export default RecipeCard;