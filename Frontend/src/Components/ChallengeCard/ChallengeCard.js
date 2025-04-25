import "./ChallengeCard.css"
import React from 'react';
import ProgressBar from '@ramonak/react-progress-bar';

const ChallengeCard = ({text , completed, needed, type}) => {
    return (
        <div className="challenge-card">
            <div className="challenge-card-content">
                <div className="challenge-card-text">{text}</div>
                {(completed != needed) ? <div className="challenge-card-progress">{completed}/{needed}</div> : <div className="challenge-card-progress">Completed</div>}
                <div className="challenge-card-progress">
                    {type === 1 && "300 traveler points"}
                    {type === 2 && "400 traveler points"}
                    {type === 3 && "100 traveler points"}
                    {type === 4 && "400 traveler points"}
                </div>
            </div>
            <div>
                <ProgressBar 
                    bgColor='#0d4725' 
                    width='100%' 
                    className='progress-bar' 
                    completed={completed.toString()}
                    maxCompleted={needed}
                    labelColor='#ffffff'
                    height='8px'
                    labelSize='3px'
                    baseBgColor='#e0e0de'
                />
            </div>
        </div>
    );
};

export default ChallengeCard;