import React, { useState, useEffect } from 'react';
import './LoginSignup.css'
import user_icon from '../Assets/person.png'
import email_icon from '../Assets/email.png'
import password_icon from '../Assets/password.png'
import wisk_icon from '../Assets/wisk.png'
import { useNavigate } from 'react-router-dom';

const LoginSignup = () => {
    const navigate = useNavigate();
    // State for controlling which form to show (Sign In or Create Account)
    const [action, setAction] = useState("Sign In");
    // State for multi-step form (page 1: basic info, page 2: preferences)
    const [page, setPage] = useState(1);

    // States for user preferences
    const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
    const [otherRestriction, setOtherRestriction] = useState('');
    const [cookingSkill, setCookingSkill] = useState('');
    const [spiceLevel, setSpiceLevel] = useState('');
    const [cuisineInterests, setCuisineInterests] = useState('');
    const [ingredientPreferences, setIngredientPreferences] = useState('');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const [lovedIngredients, setLovedIngredients] = useState('');
    const [dislikedIngredients, setDislikedIngredients] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleBack = () => {
        setPage(1);
    };

    // Handle checkbox changes for dietary restrictions
    const handleDietaryChange = (restriction) => {
        if (dietaryRestrictions.includes(restriction)) {
            setDietaryRestrictions(dietaryRestrictions.filter(item => item !== restriction));
        } else {
            setDietaryRestrictions([...dietaryRestrictions, restriction]);
        }
    };

    // Navigation handlers
    const handleSignInClick = () => {
        console.log("Sign in clicked");
        navigate('/home');
    };

    const handleCreateAccountClick = () => {
        console.log("Create account clicked");
        navigate('/home');
    };

    return (
        <div className="login-page">
            <div className="brand">
                NomadChef
                <img src={wisk_icon} alt="" className="whisk" />
            </div>
            <div className="container">
                {action === "Sign In" ? (
                    <>
                        <div className="header">
                            <div className="text">{action}</div>
                            <div className="underline"></div>
                        </div>
                        <div className="inputs">
                            <div className="input">
                                <img src={email_icon} alt="" />
                                <input type="text" placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)}/>
                            </div>
                            <div className="input">
                                <img src={password_icon} alt="" />
                                <input type="password" placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)}/>
                            </div>
                        </div>
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
                        <div className="header">
                            <div className="text">{action === "Sign In" ? "Sign In" : 
                                (page === 1 ? "Create Account" : "Personal Preferences")}</div>
                            <div className={`underline ${action === "Sign In" ? "sign-in-underline" : 
                                (page === 1 ? "create-account-underline" : "preferences-underline")}`}>
                            </div>
                        </div>
                        <div className="inputs">
                            {page === 1 ? (
                                <>
                                    <div className="input">
                                        <img src={user_icon} alt="" />
                                        <input type="text" placeholder='Name' value={name} onChange={(e) => setName(e.target.value)}/>
                                    </div>
                                    <div className="input">
                                        <img src={email_icon} alt="" />
                                        <input type="text" placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)}/>
                                    </div>
                                    <div className="input">
                                        <img src={password_icon} alt="" />
                                        <input type="password" placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)}/>
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
                            )}
                        </div>
                        <div className="sign-in">
                            Back to <span onClick={() => {setAction("Sign In"); setPage(1);}}>Sign In</span>
                        </div>
                        <div className="submit-container">
                            {page === 1 ? (
                                <div className="submit" onClick={() => setPage(2)}>Next</div>
                            ) : (
                                <div className="navigation-buttons">
                                    <div className="submit gray" onClick={handleBack}>Back</div>
                                    <div className="submit" onClick={handleCreateAccountClick}>Create Account</div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {page === 5 && (
                    <div className="survey-page">
                        <h2>What ingredients do you love?</h2>
                        <input
                            type="text"
                            value={lovedIngredients}
                            onChange={(e) => setLovedIngredients(e.target.value)}
                            placeholder="Enter ingredients you love"
                        />
                        <div className="button-container">
                            <button onClick={() => setPage(4)}>Back</button>
                            <button onClick={() => setPage(6)}>Next</button>
                        </div>
                    </div>
                )}

                {page === 6 && (
                    <div className="survey-page">
                        <h2>What ingredients do you dislike?</h2>
                        <input
                            type="text"
                            value={dislikedIngredients}
                            onChange={(e) => setDislikedIngredients(e.target.value)}
                            placeholder="Enter ingredients you dislike"
                        />
                        <div className="button-container">
                            <button onClick={() => setPage(5)}>Back</button>
                            <button onClick={handleCreateAccountClick}>Create Account</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginSignup;
