import React, { useEffect } from 'react';
import './AccountPage.css';
import wisk_icon from '../Components/Assets/wisk.png';
import { useNavigate } from 'react-router-dom';

const AccountPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleAccountClick = () => {
        navigate('/account');
    };

    const handleBrandClick = () => {
        navigate('/home');
    };

    // Mock user data matching survey structure
    const userData = {
        name: "John Doe",
        email: "john@example.com",
        preferences: {
            dietaryRestrictions: ["Vegetarian", "Dairy-Free"],
            cookingSkill: "Intermediate",
            spiceLevel: "Medium",
            cuisineInterests: ["Italian", "Mexican", "Thai", "Indian"],
            ingredients: {
                loves: ["Garlic", "Mushrooms", "Bell Peppers"],
                dislikes: ["Cilantro", "Olives"]
            }
        }
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
                        <span>{userData.preferences.dietaryRestrictions.join(", ")}</span>
                    </div>
                    <div className="info-item">
                        <label>Cooking Skill Level:</label>
                        <span>{userData.preferences.cookingSkill}</span>
                    </div>
                    <div className="info-item">
                        <label>Preferred Spice Level:</label>
                        <span>{userData.preferences.spiceLevel}</span>
                    </div>
                    <div className="info-item">
                        <label>Cuisine Interests:</label>
                        <span>{userData.preferences.cuisineInterests.join(", ")}</span>
                    </div>
                    <div className="info-item">
                        <label>Favorite Ingredients:</label>
                        <span>{userData.preferences.ingredients.loves.join(", ")}</span>
                    </div>
                    <div className="info-item">
                        <label>Disliked Ingredients:</label>
                        <span>{userData.preferences.ingredients.dislikes.join(", ")}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountPage;
