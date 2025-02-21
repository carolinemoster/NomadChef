import React, { useEffect, useState } from 'react';
import './AccountPage.css';
import wisk_icon from '../Components/Assets/wisk.png';
import { useNavigate } from 'react-router-dom';

const AccountPage = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);

        // Use the API URL directly here
        const apiBaseUrl = 'https://b60ih09kxi.execute-api.us-east-2.amazonaws.com/dev';

        // Fetch user data from backend
        const fetchUserData = async () => {
            try {
                console.log("Attempting to get token...");
                const token = localStorage.getItem('authToken'); 
                const response = await fetch(`${apiBaseUrl}/auth/getUserData`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }

                const data = await response.json();
                setUserData(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching user data:', error);
                setError('Failed to load user data.');
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleAccountClick = () => {
        navigate('/account');
    };

    const handleBrandClick = () => {
        navigate('/home');
    };

    return (
        <div className="account-page">
            <nav className="navbar background">
                <div className='brand' onClick={handleBrandClick} style={{cursor: 'pointer'}}>
                    NomadChef
                    <img src={wisk_icon} alt="Whisk Icon" className="whisk" />
                </div>
                <div className='list-items'>             
                    <ul className="nav-list">
                        <li><a href="#courses">About</a></li>
                        <li><a href="#tutorials">Past Recipes</a></li>
                        <li><a href="#jobs">Settings</a></li>
                        <li><a onClick={handleAccountClick} style={{cursor: 'pointer'}}>Account</a></li>
                    </ul>
                </div>
            </nav>

            <div className="account-container">
                <h1>Account Information</h1>

                {loading && <p>Loading...</p>}
                {error && <p className="error">{error}</p>}

                {!loading && userData && (
                    <>
                        <div className="info-section">
                            <h2>Personal Details</h2>
                            <div className="info-item">
                                <label>Name:</label>
                                <span>{userData.name}</span>
                            </div>
                            <div className="info-item">
                                <label>Email:</label>
                                <span>{userData.email}</span>
                            </div>
                        </div>

                        <div className="info-section">
                            <h2>Cooking Preferences</h2>
                            <div className="info-item">
                                <label>Dietary Restrictions:</label>
                                <span>{userData.preferences?.dietaryRestrictions.join(", ")}</span>
                            </div>
                            <div className="info-item">
                                <label>Cooking Skill Level:</label>
                                <span>{userData.preferences?.cookingSkill}</span>
                            </div>
                            <div className="info-item">
                                <label>Preferred Spice Level:</label>
                                <span>{userData.preferences?.spiceLevel}</span>
                            </div>
                            <div className="info-item">
                                <label>Cuisine Interests:</label>
                                <span>{userData.preferences?.cuisineInterests.join(", ")}</span>
                            </div>
                            <div className="info-item">
                                <label>Favorite Ingredients:</label>
                                <span>{userData.preferences?.lovedIngredients.join(", ")}</span>
                            </div>
                            <div className="info-item">
                                <label>Disliked Ingredients:</label>
                                <span>{userData.preferences?.dislikedIngredients.join(", ")}</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AccountPage;
