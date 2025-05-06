import React, { useState, useEffect } from 'react';
import './ChallengesPage.css';
import wisk_icon from '../Components/Assets/wisk.png';
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import ProgressBar from '@ramonak/react-progress-bar';
import challengesSet from '../Components/Challenges/challenges'
import ChallengeCard from '../Components/ChallengeCard/ChallengeCard';
import Leaderboard from '../Components/Leaderboard/Leaderboard';

const BASE_AUTH_URL = 'https://b60ih09kxi.execute-api.us-east-2.amazonaws.com/dev/auth';

function ChallengesPage() {
    const navigate = useNavigate();
    const [userChallenges, setUserChallenges] = useState([]);
    const [placeholders, setPlaceholders] = useState([]);
    const [userPoints, setUserPoints] = useState(0);
    const [userRank, setUserRank] = useState("Beginner");
    const [nextUserRank, setNextUserRank] = useState("Well Traveled");
    const [topUsers, setTopUsers] = useState([]);
    const [userPosition, setUserPosition] = useState(0);
    const [leaderboard, setLeaderboard] = useState([]);

    const getRandomChallenges = (number) => {
        const allChallenges = [
            {
                text: "Cook 5 dishes from India",
                condition: "in",
                amountNeeded: 5,
                amountCompleted: 0,
                completed: false,
                type: 1
            },
            {
                text: "Cook 10 dishes from Asia",
                condition: "asia",
                amountNeeded: 10,
                amountCompleted: 0,
                completed: false,
                type: 2
            },
            {
                text: "Cook a new dish",
                condition: "new",
                amountNeeded: 1,
                amountCompleted: 0,
                completed: false,
                type: 3
            },
            {
                text: "Cook 8 dishes from Europe",
                condition: "europe",
                amountNeeded: 8,
                amountCompleted: 0,
                completed: false,
                type: 2
            },
            {
                text: "Cook 5 dishes from Africa",
                condition: "africa",
                amountNeeded: 5,
                amountCompleted: 0,
                completed: false,
                type: 2
            },
            {
                text: "Cook 7 dishes from South America",
                condition: "south-america",
                amountNeeded: 7,
                amountCompleted: 0,
                completed: false,
                type: 2
            },
            {
                text: "Cook 4 dishes from Oceania",
                condition: "oceania",
                amountNeeded: 4,
                amountCompleted: 0,
                completed: false,
                type: 2
            },
            {
                text: "Cook 3 dishes from Japan",
                condition: "jp",
                amountNeeded: 3,
                amountCompleted: 0,
                completed: false,
                type: 1
            },
            {
                text: "Cook 4 dishes from Mexico",
                condition: "mx",
                amountNeeded: 4,
                amountCompleted: 0,
                completed: false,
                type: 1
            },
            {
                text: "Cook 6 dishes from Italy",
                condition: "it",
                amountNeeded: 6,
                amountCompleted: 0,
                completed: false,
                type: 1
            },
            {
                text: "Cook 2 dishes from Morocco",
                condition: "ma",
                amountNeeded: 2,
                amountCompleted: 0,
                completed: false,
                type: 1
            },
            {
                text: "Cook 5 new dishes",
                condition: "new",
                amountNeeded: 5,
                amountCompleted: 0,
                completed: false,
                type: 3
            },
            {
                text: "Cook a saved recipe",
                condition: "saved",
                amountNeeded: 1,
                amountCompleted: 0,
                completed: false,
                type: 4
            }
        ];

        const shuffled = [...allChallenges].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, number);
    };

    const newUserChallenges = async (amount) => {
        console.log("Calling newUserChallenges with amount:", amount);
        const newChallenges = getRandomChallenges(amount);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.error('No auth token found');
                return;
            }

            const response = await fetch(`${BASE_AUTH_URL}/addUserChallenges`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                    
                },
                body: JSON.stringify({
                    challenges: newChallenges
                })
            });

            if (!response.ok) {
                throw new Error('Failed to add new challenges');
            }

            const data = await response.json();
            if (data.insertedCount === amount) {
                console.log("Challenges initialized successfully:", data);
                // After successfully adding challenges, fetch the updated list
                await getUserChallenges();
            }
        } catch (error) {
            console.error("Error initializing challenges:", error);
        }
    };

    const getUserChallenges = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.error('No auth token found');
                return;
            }

            const response = await fetch(`${BASE_AUTH_URL}/getUserChallenges`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });


            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            console.log("Data:", data);
            
            if (!data.challenges || data.challenges.length === 0) {
                // If no challenges exist, initialize with 3 new challenges
                console.log("No challenges found, initializing with 3 new challenges");
                await newUserChallenges(3);
                return;
            }

            setUserChallenges(data.challenges);
            
            // Check if we need placeholders for incomplete challenges
            const incompleteChallenges = data.challenges.filter(challenge => !challenge.completed);
            if (incompleteChallenges.length < 3) {
                const newPlaceholders = Array(3 - incompleteChallenges.length).fill().map((_, index) => ({
                    id: `placeholder-${Date.now()}-${index}`,
                    type: 1,
                    condition: 'new'
                }));
                setPlaceholders(newPlaceholders);
            } else {
                setPlaceholders([]);
            }
        } catch (error) {
            console.error("Error getting user challenges:", error);
            // If there's an error, try to initialize new challenges
            await newUserChallenges(3);
        }
    };

    const handlePlaceholderClick = async (placeholderId) => {
        try {
            // Remove the clicked placeholder
            setPlaceholders(prevPlaceholders => 
                prevPlaceholders.filter(p => p.id !== placeholderId)
            );
            
            // Add a new challenge
            await newUserChallenges(1);
        } catch (error) {
            console.error("Error handling placeholder click:", error);
        }
    };

    const handleRedeemChallenge = async (challengeId) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.error('No auth token found');
                return;
            }

            const response = await fetch(`${BASE_AUTH_URL}/redeemChallenge`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    challengeId: challengeId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to redeem challenge');
            }

            const data = await response.json();
            if (data.success) {
                // Update local state to reflect the redeemed challenge
                setUserChallenges(prevChallenges => 
                    prevChallenges.map(challenge => 
                        challenge._id === challengeId 
                            ? { ...challenge, redeemed: true }
                            : challenge
                    )
                );
                // Refresh points and rank
                await setPointsRank();
            }
        } catch (error) {
            console.error("Error redeeming challenge:", error);
        }
    };

    const currentChallengesList = userChallenges
        .filter(challenge => !challenge.completed)
        .map((challenge) => (
            <ChallengeCard
                key={challenge._id}
                text={challenge.text}
                needed={challenge.amountNeeded}
                completed={challenge.amountCompleted}
                type={challenge.type}
                condition={challenge.condition}
            />
        ));

    const placeholderCards = placeholders.map((placeholder) => (
        <ChallengeCard
            key={placeholder.id}
            text=""
            needed={0}
            completed={0}
            type={placeholder.type}
            condition={placeholder.condition}
            isPlaceholder={true}
            onPlaceholderClick={() => handlePlaceholderClick(placeholder.id)}
        />
    ));

    const completedChallengesList = userChallenges
        .filter(challenge => challenge.completed)
        .map((challenge) => (
            <ChallengeCard
                key={challenge._id}
                challengeId={challenge._id}
                text={challenge.text}
                needed={challenge.amountNeeded}
                completed={challenge.amountCompleted}
                type={challenge.type}
                condition={challenge.condition}
            />
        ));

    const setPointsRank = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.error('No auth token found');
                return;
            }
            
            const response = await fetch(`${BASE_AUTH_URL}/getUserPoints`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setUserPoints(data.points || 0);

            // Set rank based on points
            if (data.points >= 4000) {
                setUserRank("Master of Flavors");
                setNextUserRank("");
            } else if (data.points >= 3000) {
                setUserRank("Culinary Explorer");
                setNextUserRank("Master of Flavors");
            } else if (data.points >= 2000) {
                setUserRank("Frequent Flyer");
                setNextUserRank("Culinary Explorer");
            } else if (data.points >= 1000) {
                setUserRank("Well Traveled");
                setNextUserRank("Frequent Flyer");
            } else {
                setUserRank("Beginner");
                setNextUserRank("Well Traveled");
            }
        } catch (error) {
            console.error("Error in setPointsRank:", error);
            setUserPoints(0);
            setUserRank("Beginner");
            setNextUserRank("Well Traveled");
        }
    };

    const fetchLeaderboard = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.error('No auth token found');
                return;
            }

            const response = await fetch(`${BASE_AUTH_URL}/getLeaderboard`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.leaderboard && Array.isArray(data.leaderboard)) {
                // Format the leaderboard data to match the expected structure
                const formattedLeaderboard = data.leaderboard.map(user => ({
                    username: user.name || 'Anonymous User',
                    points: user.points || 0
                }));
                
                setTopUsers(formattedLeaderboard);
                
                // Use the userPosition returned from the backend
                if (data.userPosition !== undefined) {
                    setUserPosition(data.userPosition);
                }
            }
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
            // Fallback to default data if API call fails
            setTopUsers([
                { username: 'ChefMaster', points: 4500 },
                { username: 'FoodExplorer', points: 3800 },
                { username: 'CulinaryNomad', points: 3200 },
                { username: 'SpiceAdventurer', points: 2900 },
                { username: 'TasteTraveler', points: 2500 }
            ]);
        }
    };

    useEffect(() => {
        const initializePage = async () => {
            await getUserChallenges();
            await setPointsRank();
            await fetchLeaderboard();
        };
        
        initializePage();

        // Add event listener for browser back button
        const handlePopState = () => {
            window.location.reload();
        };

        // Add event listener for browser reload button
        const handleBeforeUnload = () => {
            // Clear any cached data if needed
            sessionStorage.removeItem("userChallenges");
            sessionStorage.removeItem("userPoints");
            sessionStorage.removeItem("userRank");
        };

        window.addEventListener('popstate', handlePopState);
        window.addEventListener('beforeunload', handleBeforeUnload);
        
        // Clean up function
        return () => {
            window.removeEventListener('popstate', handlePopState);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [getUserChallenges]);

    const handleAccountClick = () => {
        navigate('/account');
    };

    const handlePastRecipesClick = () => {
        navigate('/pastrecipes')
    }

    const handleBrandClick = () => {
        navigate('/home');
    };

    const handleChallengesClick = () => {
        navigate('/challenges');
    };

    const handleLogout = () => {
        // Clear the auth token
        localStorage.removeItem('authToken');
        // Navigate to login page
        navigate('/');
    };

    return (
        <div className="challenges-page">
            <nav className="navbar background">
                <div className='brand' onClick={handleBrandClick} style={{cursor: 'pointer'}}>
                    NomadChef
                    <img src={wisk_icon} alt="Whisk Icon" className="whisk" />
                </div>
                <div className='list-items'>             
                    <ul className="nav-list">
                        <li>
                            <button onClick={handlePastRecipesClick} className='nav-button'>
                                Past Recipes
                            </button>
                        </li>
                        <li>
                            <button onClick={handleChallengesClick} className='nav-button'>
                                Challenges
                            </button>
                        </li>
                        <li>
                            <button onClick={handleAccountClick} className='nav-button'>
                                Account
                            </button>
                        </li>
                        <li>
                            <button onClick={handleLogout} className='nav-button logout-button'>
                                Logout
                            </button>
                        </li>
                    </ul>
                </div>
            </nav>

            <section className="section">
                <Leaderboard 
                    topUsers={topUsers} 
                    userRank={userRank} 
                    userPoints={userPoints}
                    userPosition={userPosition}
                />
            </section>

            <section className="section">
                <div className="rank-section">
                    <h2>Your Rank</h2>
                    <div className="rank-info">
                        <div className="rank-details">
                            <span className="rank-title">{userRank}</span>
                            <span className="rank-points">{userPoints} points</span>
                        </div>
                        <div className="rank-progress">
                            <ProgressBar 
                                bgColor='#0d4725' 
                                width='100%' 
                                completed={(userPoints%1000).toString()}
                                maxCompleted={1000}
                                labelColor='#ffffff'
                                height='15px'
                                labelSize='10px'
                                baseBgColor='#e0e0de'
                            />
                            {(userRank !== "Master of Flavors") && (
                                <div className="next-rank">
                                    <span className="next-rank-label">Next Rank:</span>
                                    <span className="next-rank-value">{nextUserRank}</span>
                                    <span className="progress-label">{(userPoints%1000)}/1000 points</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className="section">
                <div>
                    <h1>Current Challenges</h1>
                </div>
                <div className="challenges-grid">
                    {currentChallengesList}
                    {placeholderCards}
                </div>
            </section>

            <section className="section">
                <div>
                    <h1>Completed Challenges</h1>
                </div>
                <div className="challenges-grid">
                    {completedChallengesList}
                </div>
            </section>

            <footer className="footer">
                <p className="text-footer">
                    Copyright ©-All rights are reserved
                </p>
            </footer>
        </div>
    );
}

export default ChallengesPage;
