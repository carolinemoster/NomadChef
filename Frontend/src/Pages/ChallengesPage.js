import React, { useState, useEffect, useRef } from 'react';
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
    const [points, setUserPoints] = useState(0);
    const [rank, setUserRank] = useState("Beginner");
    const [nextrank, setNextUserRank] = useState("Well Traveled");
    const [challenges, setUserChallenges] = useState([]);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [topUsers, setTopUsers] = useState([]);
    const [userPosition, setUserPosition] = useState(0);

    const handleMouseMove = (e) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const getRandomChallenges = (number) => {
        const shuffled = [...challengesSet].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, number);
    };

    const newUserChallenges = async (amount) => {
        const newChallenges = getRandomChallenges(amount);
        try {
            const token = localStorage.getItem('authToken');
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
                throw new Error('Failed to update user points');
            }
            const data = await response.json();
            if(data.insertedCount == amount) {
                console.log("challenges initialized successfully: ", data);
            }
        }
        catch {
            console.log("Error initializing challenges");
            return;
        }
    }

    const getUserChallenges = async () => {
        try {
            const token = localStorage.getItem('authToken'); 
            const response = await fetch(`${BASE_AUTH_URL}/getUserChallenges`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}, ${response.statusText}`);
            }
    
            const data = await response.json();
            
            if(data.challenges.length == 0) { //if challenges have not been initialized yet
                newUserChallenges(3);
                if(!challenges) {
                    throw new Error('Error initializing challenges');
                }
                return;
            }
            else {
                const incompleteChallenges = data.challenges.filter(challenge => !challenge.completed); //get array of incompleted/current challenges

                if (incompleteChallenges.length < 3) {
                    newUserChallenges((3-incompleteChallenges.length)) //add new challenges if completed
                }
                setUserChallenges(data.challenges) //set the challenges
                return;
            }

        }
        catch {
            console.log("Error getting user challenges");
        }
    }

    const currentChallengesList = challenges.filter(challenge => !(challenge.completed)).map((challenge, index) => (
        <ChallengeCard
            key={index}
            text={challenge.text}
            needed={challenge.amountNeeded}
            completed={challenge.amountCompleted}
            type={challenge.type}
            condition={challenge.condition}
        />
    ));

    const completedChallengesList = challenges
        .filter(challenge => challenge.completed)
        .map((challenge, index) => (
            <ChallengeCard
                key={index}
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
            const response = await fetch(`${BASE_AUTH_URL}/getUserPoints`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}, ${response.statusText}`);
            }
    
            const data = await response.json();
            setUserPoints(data.points);
            if(parseInt(data.points) >= 1000 && parseInt(data.points) < 2000) {
                setUserRank("Well Traveled");
                setNextUserRank("Frequent Flyer");
            }
            else if(parseInt(data.points) >= 2000 && parseInt(data.points) < 3000) {
                setUserRank("Frequent Flyer");
                setNextUserRank("Culinary Explorer");
            }
            else if(parseInt(data.points) >= 3000 && parseInt(data.points) < 4000) {
                setUserRank("Culinary Explorer");
                setNextUserRank("Master of Flavors");
            }
            else if(parseInt(data.points) >= 4000) {
                setUserRank("Master of Flavors");
            }
            else {
                setUserRank("Beginner");
                setNextUserRank("Well Traveled")
            }
            
        }
        catch(error) {
            console.log(error);
            return;
        }
    };
    
    const fetchLeaderboard = async () => {
        try {
            const response = await fetch(`${BASE_AUTH_URL}/getLeaderboard`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
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
                
                // Find user's position in leaderboard if they're not in top 5
                // This would require an additional API endpoint to get user's rank
                // For now, we'll use a placeholder value
                setUserPosition(15); // This should be replaced with actual position
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
        window.scrollTo(0, 0);
        setPointsRank();
        getUserChallenges();
        fetchLeaderboard();
    }, []);

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
                    userRank={rank} 
                    userPoints={points}
                    userPosition={userPosition}
                />
            </section>

            <section className="section">
                <div className="rank-section">
                    <h2>Your Rank</h2>
                    <div className="rank-info">
                        <div className="rank-details">
                            <span className="rank-title">{rank}</span>
                            <span className="rank-points">{points} points</span>
                        </div>
                        <div className="rank-progress">
                            <ProgressBar 
                                bgColor='#0d4725' 
                                width='100%' 
                                completed={(points%1000).toString()}
                                maxCompleted={1000}
                                labelColor='#ffffff'
                                height='15px'
                                labelSize='10px'
                                baseBgColor='#e0e0de'
                            />
                            {(rank !== "Master of Flavors") && (
                                <div className="next-rank">
                                    <span className="next-rank-label">Next Rank:</span>
                                    <span className="next-rank-value">{nextrank}</span>
                                    <span className="progress-label">{(points%1000)}/1000 points</span>
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
