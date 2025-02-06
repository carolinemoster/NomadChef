import React from 'react';
import './LoginSignup.css'
import user_icon from '../Assets/person.png'
import email_icon from '../Assets/email.png'
import password_icon from '../Assets/password.png'
import wisk_icon from '../Assets/wisk.png'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginSignup = () => {
    const navigate = useNavigate();
    const [action, setAction] = useState("Sign In");
    const [page, setPage] = useState(1);
    const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
    const [otherRestriction, setOtherRestriction] = useState('');
    const [cookingSkill, setCookingSkill] = useState('');
    const [spiceLevel, setSpiceLevel] = useState('');
    const [cuisineInterests, setCuisineInterests] = useState('');
    const [ingredientPreferences, setIngredientPreferences] = useState('');

    const handleNext = () => {
        setPage(2);
    };

    const handleBack = () => {
        setPage(1);
    };

    const handleDietaryChange = (restriction) => {
        if (dietaryRestrictions.includes(restriction)) {
            setDietaryRestrictions(dietaryRestrictions.filter(item => item !== restriction));
        } else {
            setDietaryRestrictions([...dietaryRestrictions, restriction]);
        }
    };

    const handleSignInClick = () => {
        navigate('/home');
    };

    return (
        <div className="login-page">
            <div className="brand">
                NomadChef
                <img src={wisk_icon} alt="" className="whisk" />
            </div>
            <div className="container">
                <div className = 'header'>
                    <div className = 'text'>
                        {action === "Sign In" ? "Sign In" : 
                         (page === 1 ? "Create Account" : "Personal Preferences")}
                    </div>
                    <div className={`underline ${action === "Sign In" ? "sign-in-underline" : 
                        (page === 1 ? "create-account-underline" : "preferences-underline")}`}>
                    </div>
                </div>
                <div className="inputs">
                    {action === "Sign In" ? (
                        <>
                            <div className="input">
                                <img src={email_icon} alt="" />
                                <input type="text" placeholder='Email'/>
                            </div>
                            <div className="input">
                                <img src={password_icon} alt="" />
                                <input type="password" placeholder='Password'/>
                            </div>
                        </>
                    ) : (
                        page === 1 ? (
                            <>
                                <div className="input">
                                    <img src={user_icon} alt="" />
                                    <input type="text" placeholder='Name'/>
                                </div>
                                <div className="input">
                                    <img src={email_icon} alt="" />
                                    <input type="text" placeholder='Email'/>
                                </div>
                                <div className="input">
                                    <img src={password_icon} alt="" />
                                    <input type="password" placeholder='Password'/>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="dietary-restrictions">
                                    <p>Do you have any dietary restrictions or allergies?</p>
                                    <div className="checkbox-group">
                                        <label>
                                            <input 
                                                type="checkbox"
                                                checked={dietaryRestrictions.includes('vegetarian')}
                                                onChange={() => handleDietaryChange('vegetarian')}
                                            /> Vegetarian
                                        </label>
                                        <label>
                                            <input 
                                                type="checkbox"
                                                checked={dietaryRestrictions.includes('vegan')}
                                                onChange={() => handleDietaryChange('vegan')}
                                            /> Vegan
                                        </label>
                                        <label>
                                            <input 
                                                type="checkbox"
                                                checked={dietaryRestrictions.includes('gluten-free')}
                                                onChange={() => handleDietaryChange('gluten-free')}
                                            /> Gluten-Free
                                        </label>
                                        <label>
                                            <input 
                                                type="checkbox"
                                                checked={dietaryRestrictions.includes('dairy-free')}
                                                onChange={() => handleDietaryChange('dairy-free')}
                                            /> Dairy-Free
                                        </label>
                                        <label>
                                            <input 
                                                type="checkbox"
                                                checked={dietaryRestrictions.includes('nut-allergy')}
                                                onChange={() => handleDietaryChange('nut-allergy')}
                                            /> Nut Allergy
                                        </label>
                                        <label>
                                            <input 
                                                type="checkbox"
                                                checked={dietaryRestrictions.includes('other')}
                                                onChange={() => handleDietaryChange('other')}
                                            /> Other
                                        </label>
                                        {dietaryRestrictions.includes('other') && (
                                            <input 
                                                type="text"
                                                className="other-input"
                                                placeholder="Please specify other restrictions or allergies"
                                                value={otherRestriction}
                                                onChange={(e) => setOtherRestriction(e.target.value)}
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="cooking-skills">
                                    <p>How would you rate your cooking skills?</p>
                                    <div className="radio-group">
                                        <label>
                                            <input 
                                                type="radio"
                                                name="cookingSkill"
                                                value="beginner"
                                                checked={cookingSkill === 'beginner'}
                                                onChange={(e) => setCookingSkill(e.target.value)}
                                            /> Beginner
                                        </label>
                                        <label>
                                            <input 
                                                type="radio"
                                                name="cookingSkill"
                                                value="intermediate"
                                                checked={cookingSkill === 'intermediate'}
                                                onChange={(e) => setCookingSkill(e.target.value)}
                                            /> Intermediate
                                        </label>
                                        <label>
                                            <input 
                                                type="radio"
                                                name="cookingSkill"
                                                value="advanced"
                                                checked={cookingSkill === 'advanced'}
                                                onChange={(e) => setCookingSkill(e.target.value)}
                                            /> Advanced
                                        </label>
                                    </div>
                                </div>
                                <div className="spice-preference">
                                    <p>What is your preferred spice level?</p>
                                    <div className="radio-group">
                                        <label>
                                            <input 
                                                type="radio"
                                                name="spiceLevel"
                                                value="mild"
                                                checked={spiceLevel === 'mild'}
                                                onChange={(e) => setSpiceLevel(e.target.value)}
                                            /> Mild
                                        </label>
                                        <label>
                                            <input 
                                                type="radio"
                                                name="spiceLevel"
                                                value="medium"
                                                checked={spiceLevel === 'medium'}
                                                onChange={(e) => setSpiceLevel(e.target.value)}
                                            /> Medium
                                        </label>
                                        <label>
                                            <input 
                                                type="radio"
                                                name="spiceLevel"
                                                value="spicy"
                                                checked={spiceLevel === 'spicy'}
                                                onChange={(e) => setSpiceLevel(e.target.value)}
                                            /> Spicy
                                        </label>
                                    </div>
                                </div>
                                <div className="cuisine-interests">
                                    <p>Are there any specific cultures you are particularly interested in exploring through cooking?</p>
                                    <div className="input">
                                        <input 
                                            type="text"
                                            placeholder="Enter cuisines you're interested in exploring"
                                            value={cuisineInterests}
                                            onChange={(e) => setCuisineInterests(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="ingredient-preferences">
                                    <p>Are there any ingredients you love or dislike?</p>
                                    <div className="input">
                                        <input 
                                            type="text"
                                            placeholder="Enter ingredients you love or dislike"
                                            value={ingredientPreferences}
                                            onChange={(e) => setIngredientPreferences(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </>
                        )
                    )}
                </div>

                {action === "Sign In" ? (
                    <>
                        <div className="forgot-password">
                            <span>Forgot Password?</span>
                        </div>
                        <div className="create-account">
                            New to NomadChef? <span onClick={() => setAction("Create Account")}>Create Account</span>
                        </div>
                        <div className="submit-container">
                            <div className="submit" onClick={handleSignInClick}>Sign In</div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="sign-in">
                            Back to <span onClick={() => {setAction("Sign In"); setPage(1);}}>Sign In</span>
                        </div>
                        <div className="submit-container">
                            {page === 1 ? (
                                <div className="submit" onClick={handleNext}>Next</div>
                            ) : (
                                <div className="navigation-buttons">
                                    <div className="submit gray" onClick={handleBack}>Back</div>
                                    <div className="submit" onClick={() => setAction("Create Account")}>Create Account</div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default LoginSignup;
