import React, { useEffect, useState } from 'react';
import './AccountPage.css';
import wisk_icon from '../Components/Assets/wisk.png';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AccountPage = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        window.scrollTo(0, 0);

        // Use the API URL directly here
        const apiBaseUrl = 'https://b60ih09kxi.execute-api.us-east-2.amazonaws.com/dev';

        // Fetch user data from backend
    const fetchUserData = async () => {
        try {
            console.log("Attempting to get token...");
                const token = localStorage.getItem('authToken'); 
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
        }
    };


        fetchUserData();
    }, []);

    useEffect(() => {
        if (userData) {
            setEditedData(userData);
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

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setEditedData(userData);
        setIsEditing(false);
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
                ...prev.preferences || {}, // Initialize preferences if it doesn't exist
                [field]: arrayValues
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
                                    <input
                                        type="text"
                                        value={editedData.preferences?.dislikedIngredients?.join(", ") || ""}
                                        onChange={(e) => handleArrayInputChange('dislikedIngredients', e.target.value)}
                                        placeholder="Separate with commas"
                                    />
                                ) : (
                                    <span>{editedData.preferences?.dislikedIngredients?.join(", ") || "None specified"}</span>
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

