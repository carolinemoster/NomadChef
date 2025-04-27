import "./ChallengeCard.css"
import React, { useState, useEffect } from 'react';
import ProgressBar from '@ramonak/react-progress-bar';
import { FaGlobeAsia, FaGlobeEurope, FaGlobeAmericas, FaGlobeAfrica, FaGlobe, FaUtensils, FaBookmark, FaCheckCircle, FaArrowRight, FaGift } from 'react-icons/fa';

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

const ChallengeCard = ({text, completed, needed, type, condition, isPlaceholder, onPlaceholderClick, challengeId}) => {
    const [isFading, setIsFading] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);
    const [isClaimed, setIsClaimed] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const points = type === 1 ? "300" : type === 2 ? "400" : type === 3 ? "100" : "400";
    const icon = getChallengeIcon(condition);
    const isCompleted = completed >= needed;

    // Check if this challenge has been claimed before
    useEffect(() => {
        if (challengeId && isCompleted) {
            const claimedChallenges = JSON.parse(localStorage.getItem('claimedChallenges') || '[]');
            if (claimedChallenges.includes(challengeId)) {
                setIsClaimed(true);
            }
        }
    }, [challengeId, isCompleted]);

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
        
        if (isCompleted && !isClaimed) {
            setIsClaiming(true);
            setShowConfetti(true);
            
            // Play a sound effect (optional)
            try {
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3');
                audio.volume = 0.2;
                audio.play().catch(e => console.log('Audio play failed:', e));
            } catch (e) {
                console.log('Audio error:', e);
            }
            
            setTimeout(() => {
                setIsClaimed(true);
                setIsClaiming(false);
                
                // Save the claimed state to localStorage
                if (challengeId) {
                    const claimedChallenges = JSON.parse(localStorage.getItem('claimedChallenges') || '[]');
                    if (!claimedChallenges.includes(challengeId)) {
                        claimedChallenges.push(challengeId);
                        localStorage.setItem('claimedChallenges', JSON.stringify(claimedChallenges));
                    }
                }
            }, 1500); // Longer animation duration
            
            return;
        }
    };

    // Create confetti effect
    const renderConfetti = () => {
        if (!showConfetti) return null;
        
        const confetti = [];
        for (let i = 0; i < 50; i++) {
            const style = {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#0d4725', '#1a6a3a', '#2a8a4a', '#45b7d1', '#96ceb4'][Math.floor(Math.random() * 5)],
                width: `${Math.random() * 10 + 5}px`,
                height: `${Math.random() * 10 + 5}px`,
                position: 'absolute',
                borderRadius: Math.random() > 0.5 ? '50%' : '0',
                animation: `confetti-fall ${Math.random() * 3 + 2}s linear forwards`,
                zIndex: 10
            };
            confetti.push(<div key={i} style={style} />);
        }
        return <div className="confetti-container">{confetti}</div>;
    };

    return (
        <div 
            className={`challenge-card ${isCompleted ? 'completed' : ''} ${isPlaceholder ? 'placeholder' : ''} ${isFading ? 'fading' : ''} ${isClaiming ? 'claiming' : ''} ${isClaimed ? 'claimed' : ''}`} 
            onClick={handleClick}
        >
            {renderConfetti()}
            <div className="challenge-card-content">
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
                            <div className="recipe-count">
                                {completed}/{needed} recipes
                            </div>
                            {isCompleted && !isPlaceholder && (
                                <>
                                    <div className="completed-badge">
                                        <FaCheckCircle /> Challenge Completed!
                                    </div>
                                    {!isClaimed && (
                                        <div className="claim-button">
                                            <FaGift /> Click to Claim
                                        </div>
                                    )}
                                    {isClaimed && (
                                        <div className="claimed-text">
                                            <FaGift /> Claimed!
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChallengeCard;