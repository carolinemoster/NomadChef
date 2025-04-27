import React from 'react';
import './Leaderboard.css';

const Leaderboard = ({ topUsers, userRank, userPoints, userPosition }) => {
    const maxPoints = Math.max(...topUsers.map(user => user.points), userPoints);

    // Check if the user is in the top users list
    const isUserInTopList = topUsers.some(user => user.points === userPoints);

    return (
        <div className="leaderboard-container">
            <h2 className="leaderboard-title">Global Leaderboard</h2>
            <div className="leaderboard-list">
                {topUsers.map((user, index) => {
                    const pointsPercentage = (user.points / maxPoints) * 100;
                    const isCurrentUser = user.points === userPoints;
                    
                    return (
                        <div 
                            key={index} 
                            className={`leaderboard-item ${isCurrentUser ? 'current-user' : ''}`}
                        >
                            <div className="leaderboard-rank">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                            </div>
                            <div className="leaderboard-username">
                                {user.username}
                                {isCurrentUser && <span className="user-badge">You</span>}
                            </div>
                            <div className="leaderboard-bar-container">
                                <div 
                                    className="leaderboard-bar" 
                                    style={{ width: `${pointsPercentage}%` }}
                                />
                                <div className="leaderboard-points">{user.points} pts</div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {!isUserInTopList && userPosition > 0 && (
                <div className="user-rank-section">
                    <div className="user-rank">
                        <span className="rank-label">Your Rank:</span>
                        <span className="rank-value">#{userPosition}</span>
                        <span className="points-value">{userPoints} pts</span>
                    </div>
                    <div className="rank-title">
                        <span className="rank-title-label">Rank Title:</span>
                        <span className="rank-title-value">{userRank}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leaderboard; 