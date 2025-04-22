import React, { useEffect, useState } from 'react';
import './AccountPage.css';
import wisk_icon from '../Components/Assets/wisk.png';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '@ramonak/react-progress-bar';
import axios from 'axios';

const AccountPage = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const [points, setUserPoints] = useState(0);
    const BASE_AUTH_URL = 'https://b60ih09kxi.execute-api.us-east-2.amazonaws.com/dev/auth';

    useEffect(() => {
        window.scrollTo(0, 0);
        // Use the API URL directly here
        const apiBaseUrl = 'https://b60ih09kxi.execute-api.us-east-2.amazonaws.com/dev';

        // Fetch user data from backend
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('authToken'); 
                
                if (!token) {
                    // If no token, redirect to login
                    navigate('/');
                    return;
                }
                
                const response = await axios.get(`${apiBaseUrl}/auth/getUserData`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                setUserData(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching user data:', error);
                setError('Failed to load user data.');
                setLoading(false);
                
                // If unauthorized, redirect to login
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem('authToken');
                    navigate('/');
                }
            }
        };
        getUserPoints();
        fetchUserData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (userData) {
            setEditedData({
                ...userData,
                preferences: {
                    ...userData.preferences || {},
                    cookingSkill: userData.preferences?.cookingSkill || '',
                    spiceLevel: userData.preferences?.spiceLevel || '',
                    dislikedIngredients: userData.preferences?.dislikedIngredients || [],
                }
            });
        }
    }, [userData]);

    const handleBrandClick = () => {
        navigate('/home');
    };

    const handlePastRecipesClick = () => {
        navigate('/pastrecipes');
    };

    const handleAccountClick = () => {
        navigate('/account');
    };

    const handleChallengesClick = () => {
        navigate('/challenges');
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setEditedData(userData);
        setIsEditing(false);
    };

    const getUserPoints = async () => {
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
        }
        catch(error) {
            console.log(error);
            return;
        }
    };

    const handleInputChange = (field, value) => {
        setEditedData(prev => {
            if (field === 'cookingSkill' || field === 'spiceLevel') {
                return {
                    ...prev,
                    preferences: {
                        ...prev.preferences || {},
                        [field]: value
                    }
                };
            }
            return {
                ...prev,
                [field]: value
            };
        });
    };

    const handleArrayInputChange = (field, value) => {
        const arrayValues = value.split(',').map(item => item.trim());
        setEditedData(prev => ({
            ...prev,
            preferences: {
                ...prev.preferences || {},
                [field]: arrayValues
            }
        }));
    };

    const handleDislikedIngredientsChange = (ingredients) => {
        setEditedData(prev => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                dislikedIngredients: ingredients
            }
        }));
    };

    const handleSave = async () => {
        // Reset errors
        setValidationErrors({});

        // Validate
        const errors = {};
        if (!editedData.name?.trim()) errors.name = "Name cannot be empty";
        if (!editedData.email?.trim()) errors.email = "Email cannot be empty";

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        try {
            const payload = {
                name: editedData.name,
                email: editedData.email,
                preferences: {
                    dietaryRestrictions: editedData.preferences?.dietaryRestrictions || [],
                    cookingSkill: editedData.preferences?.cookingSkill || '',
                    spiceLevel: editedData.preferences?.spiceLevel || '',
                    cuisineInterests: editedData.preferences?.cuisineInterests || [],
                    lovedIngredients: editedData.preferences?.lovedIngredients || [],
                    dislikedIngredients: editedData.preferences?.dislikedIngredients || []
                }
            };
    
            // Log the data to see what you're sending
            console.log('Sending editedData:', payload);
    
            const apiBaseUrl = 'https://b60ih09kxi.execute-api.us-east-2.amazonaws.com/dev';
            const token = localStorage.getItem('authToken');
            const response = await axios.post(`${apiBaseUrl}/auth/updateUserData`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
    
            setUserData(response.data);
            setIsEditing(false);
        }
        catch (error) {
            console.error('Error updating user data:', error);
            console.error('Error details:', error.response?.data || error.message);
            console.error('Status Code:', error.response?.status);
            console.error('Headers:', error.response?.headers);
            setError('Failed to update user data.');
        }
        
        
    };
    
    const handleLogout = () => {
        // Clear the auth token
        localStorage.removeItem('authToken');
        // Navigate to login page
        navigate('/');
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

            <div className="account-container">
                <h1>Account Information</h1>
                <ProgressBar 
                    bgColor='#0d4725' 
                    width='100%' 
                    className='progress-bar' 
                    completed={points.toString()}
                    labelColor='#ffffff'
                    maxCompleted={1000}
                    height='12px'
                    labelSize='10px'
                    baseBgColor='#e0e0de'
                />
                {!isEditing && (
                    <button className="edit-button" onClick={handleEdit}>
                        Edit Profile
                    </button>
                )}

                {loading && <p>Loading...</p>}
                {error && <p className="error">{error}</p>}

                {!loading && editedData && (
                    <>
                        <div className="info-section">
                            <h2>Personal Details</h2>
                            <div className="info-item">
                                <label>Name:</label>
                                {isEditing ? (
                                    <>
                                        <input
                                            type="text"
                                            value={editedData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                        />
                                        {validationErrors.name && <div className="error-message">{validationErrors.name}</div>}
                                    </>
                                ) : (
                                    <span>{editedData.name}</span>
                                )}
                            </div>
                            <div className="info-item">
                                <label>Email:</label>
                                <span>{editedData.email}</span>
                            </div>
                        </div>

                        <div className="info-section">
                            <h2>Cooking Preferences</h2>
                            <div className="info-item">
                                <label>Dietary Restrictions:</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedData.preferences?.dietaryRestrictions?.join(", ") || ""}
                                        onChange={(e) => handleArrayInputChange('dietaryRestrictions', e.target.value)}
                                        placeholder="Separate with commas"
                                    />
                                ) : (
                                    <span>{editedData.preferences?.dietaryRestrictions?.join(", ") || "None specified"}</span>
                                )}
                            </div>
                            <div className="info-item">
                                <label>Cooking Skill Level:</label>
                                {isEditing ? (
                                    <div className="radio-group">
                                        <label className="radio-label">
                                            <input
                                                type="radio"
                                                name="cookingSkill"
                                                value="Beginner"
                                                checked={editedData.preferences?.cookingSkill === "Beginner"}
                                                onChange={(e) => handleInputChange('cookingSkill', e.target.value)}
                                            />
                                            Beginner
                                        </label>
                                        <label className="radio-label">
                                            <input
                                                type="radio"
                                                name="cookingSkill"
                                                value="Intermediate"
                                                checked={editedData.preferences?.cookingSkill === "Intermediate"}
                                                onChange={(e) => handleInputChange('cookingSkill', e.target.value)}
                                            />
                                            Intermediate
                                        </label>
                                        <label className="radio-label">
                                            <input
                                                type="radio"
                                                name="cookingSkill"
                                                value="Advanced"
                                                checked={editedData.preferences?.cookingSkill === "Advanced"}
                                                onChange={(e) => handleInputChange('cookingSkill', e.target.value)}
                                            />
                                            Advanced
                                        </label>
                                    </div>
                                ) : (
                                    <span>{editedData.preferences?.cookingSkill || "Not specified"}</span>
                                )}
                            </div>
                            <div className="info-item">
                                <label>Preferred Spice Level:</label>
                                {isEditing ? (
                                    <div className="radio-group">
                                        <label className="radio-label">
                                            <input
                                                type="radio"
                                                name="spiceLevel"
                                                value="Mild"
                                                checked={editedData.preferences?.spiceLevel === "Mild"}
                                                onChange={(e) => handleInputChange('spiceLevel', e.target.value)}
                                            />
                                            Mild
                                        </label>
                                        <label className="radio-label">
                                            <input
                                                type="radio"
                                                name="spiceLevel"
                                                value="Medium"
                                                checked={editedData.preferences?.spiceLevel === "Medium"}
                                                onChange={(e) => handleInputChange('spiceLevel', e.target.value)}
                                            />
                                            Medium
                                        </label>
                                        <label className="radio-label">
                                            <input
                                                type="radio"
                                                name="spiceLevel"
                                                value="Spicy"
                                                checked={editedData.preferences?.spiceLevel === "Spicy"}
                                                onChange={(e) => handleInputChange('spiceLevel', e.target.value)}
                                            />
                                            Spicy
                                        </label>
                                    </div>
                                ) : (
                                    <span>{editedData.preferences?.spiceLevel || "Not specified"}</span>
                                )}
                            </div>
                            <div className="info-item">
                                <label>Cuisine Interests:</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedData.preferences?.cuisineInterests?.join(", ") || ""}
                                        onChange={(e) => handleArrayInputChange('cuisineInterests', e.target.value)}
                                        placeholder="Separate with commas"
                                    />
                                ) : (
                                    <span>{editedData.preferences?.cuisineInterests?.join(", ") || "None specified"}</span>
                                )}
                            </div>
                            <div className="info-item">
                                <label>Favorite Ingredients:</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedData.preferences?.lovedIngredients?.join(", ") || ""}
                                        onChange={(e) => handleArrayInputChange('lovedIngredients', e.target.value)}
                                        placeholder="Separate with commas"
                                    />
                                ) : (
                                    <span>{editedData.preferences?.lovedIngredients?.join(", ") || "None specified"}</span>
                                )}
                            </div>
                            <div className="info-item">
                                <label>Disliked Ingredients:</label>
                                {isEditing ? (
                                    <div className="ingredients-list">
                                        {editedData.preferences?.dislikedIngredients?.map((ingredient, index) => (
                                            <div key={index} className="ingredient-item">
                                                <span>{ingredient}</span>
                                                <button 
                                                    onClick={() => {
                                                        const newIngredients = editedData.preferences.dislikedIngredients.filter((_, i) => i !== index);
                                                        handleDislikedIngredientsChange(newIngredients);
                                                    }}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                        <input
                                            type="text"
                                            placeholder="Add new ingredient"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' && e.target.value.trim()) {
                                                    const newIngredients = [...(editedData.preferences?.dislikedIngredients || []), e.target.value.trim()];
                                                    handleDislikedIngredientsChange(newIngredients);
                                                    e.target.value = '';
                                                }
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <span>
                                        {editedData.preferences?.dislikedIngredients?.join(', ') || 'None specified'}
                                    </span>
                                )}
                            </div>
                        </div>

                        {isEditing && (
                            <div className="button-group">
                                <button className="save-button" onClick={handleSave}>
                                    Save Changes
                                </button>
                                <button className="cancel-button" onClick={handleCancel}>
                                    Cancel
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AccountPage;

