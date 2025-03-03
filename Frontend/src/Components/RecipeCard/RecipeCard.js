import { useState } from "react";
import './RecipeCard.css';


const RecipeCard = ({image, name}) => {
  
  return (
    <div className="recipe-card">
        <div className="recipe-card-title"><h3>{name}</h3></div>
        <img className="recipe-image" src={image}></img>
    </div>
  );
};

export default RecipeCard;