import "./ChallengeCard.css"
import React, { useState, useEffect } from 'react';
import ProgressBar from '@ramonak/react-progress-bar';
import { FaGlobeAsia, FaGlobeEurope, FaGlobeAmericas, FaGlobeAfrica, FaGlobe, FaUtensils, FaBookmark, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

const getChallengeIcon = (condition) => {
    switch(condition) {
        case 'in':
            return <FaGlobeAsia size={40} />;
        case 'asia':
            return <FaGlobeAsia size={40} />;
        case 'europe':
            return <FaGlobeEurope size={40} />;
        case 'africa':
            return <FaGlobeAfrica size={40} />;
        case 'south-america':
            return <FaGlobeAmericas size={40} />;
        case 'oceania':
            return <FaGlobe size={40} />;
        case 'jp':
            return <FaGlobeAsia size={40} className="japan-icon" />;
        case 'mx':
            return <FaGlobeAmericas size={40} className="mexico-icon" />;
        case 'it':
            return <FaGlobeEurope size={40} />;
        case 'ma':
            return <FaGlobeAfrica size={40} />;
        case 'new':
            return <FaUtensils size={40} />;
        case 'saved':
            return <FaBookmark size={40} />;
        default:
            return <FaGlobe size={40} />;
    }
};

const ChallengeCard = ({text, completed, needed, type, condition, isPlaceholder, onPlaceholderClick}) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isFading, setIsFading] = useState(false);
    const points = type === 1 ? "300" : type === 2 ? "400" : type === 3 ? "100" : "400";
    const icon = getChallengeIcon(condition);
    const isCompleted = completed >= needed;

    const handleClick = () => {
        if (isPlaceholder) {
            setIsFading(true);
            setTimeout(() => {
                if (onPlaceholderClick) {
                    onPlaceholderClick();
                }
            }, 500); // Match this with CSS transition duration
            return;
        }
        setIsFlipped(!isFlipped);
    };

    return (
        <div 
            className={`challenge-card ${isFlipped ? 'flipped' : ''} ${isCompleted ? 'completed' : ''} ${isPlaceholder ? 'placeholder' : ''} ${isFading ? 'fading' : ''}`} 
            onClick={handleClick}
        >
            <div className="challenge-card-inner">
                <div className="challenge-card-front">
                    <div className="challenge-icon">
                        {icon}
                    </div>
                    <div className="challenge-content">
                        {isPlaceholder ? (
                            <>
                                <h3 className="challenge-title">Challenge Completed!</h3>
                                <div className="placeholder-text">
                                    Click to get a new challenge
                                </div>
                                <div className="placeholder-icon">
                                    <FaArrowRight />
                                </div>
                            </>
                        ) : (
                            <>
                                <h3 className="challenge-title">{text}</h3>
                                <div className="challenge-progress">
                                    <ProgressBar 
                                        bgColor='#0d4725' 
                                        width='100%' 
                                        completed={completed.toString()}
                                        maxCompleted={needed}
                                        labelColor='#ffffff'
                                        height='8px'
                                        labelSize='3px'
                                        baseBgColor='#e0e0de'
                                    />
                                    <div className="challenge-points">
                                        {points} traveler points
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className="challenge-card-back">
                    <div className="challenge-icon">
                        {icon}
                    </div>
                    <div className="recipe-count">
                        {completed}/{needed} recipes
                    </div>
                    {isCompleted && !isPlaceholder && (
                        <div className="completed-badge">
                            <FaCheckCircle /> Challenge Completed!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChallengeCard;