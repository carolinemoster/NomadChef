import "./ChallengeCard.css"
import React, { useState } from 'react';
import ProgressBar from '@ramonak/react-progress-bar';
import { FaGlobeAsia, FaGlobeEurope, FaGlobeAmericas, FaGlobeAfrica, FaGlobe, FaUtensils, FaBookmark } from 'react-icons/fa';

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

const ChallengeCard = ({text, completed, needed, type, condition}) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const points = type === 1 ? "300" : type === 2 ? "400" : type === 3 ? "100" : "400";
    const icon = getChallengeIcon(condition);

    const handleClick = () => {
        setIsFlipped(!isFlipped);
    };

    return (
        <div className={`challenge-card ${isFlipped ? 'flipped' : ''}`} onClick={handleClick}>
            <div className="challenge-card-inner">
                <div className="challenge-card-front">
                    <div className="challenge-icon">
                        {icon}
                    </div>
                    <div className="challenge-content">
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
                    </div>
                </div>
                <div className="challenge-card-back">
                    <div className="challenge-icon">
                        {icon}
                    </div>
                    <div className="recipe-count">
                        {completed}/{needed} recipes
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChallengeCard;