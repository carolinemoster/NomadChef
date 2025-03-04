import React, { useState, useEffect } from 'react';
import './LoginSignup.css'
import user_icon from '../Assets/person.png'
import email_icon from '../Assets/email.png'
import password_icon from '../Assets/password.png'
import wisk_icon from '../Assets/wisk.png'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginSignup = () => {
    const apiBaseUrl = 'https://b60ih09kxi.execute-api.us-east-2.amazonaws.com/dev';
    const navigate = useNavigate();
    //const { setUser, setToken } = useAuth();
    // State for controlling which form to show (Sign In or Create Account)
    const [action, setAction] = useState("Sign In");
    // State for multi-step form (page 1: basic info, page 2: preferences)
    const [page, setPage] = useState(1);

    // States for user preferences
    const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
    const [otherRestriction, setOtherRestriction] = useState('');
    const [cookingSkill, setCookingSkill] = useState('');
    const [spiceLevel, setSpiceLevel] = useState('');
    const [ingredientPreferences, setIngredientPreferences] = useState('');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const [lovedIngredient, setLovedIngredient] = useState('');
    const [lovedIngredients, setLovedIngredients] = useState([]);
    const [dislikedIngredient, setDislikedIngredient] = useState('');
    const [dislikedIngredients, setDislikedIngredients] = useState([]);
    const [cuisineInterest, setCuisineInterest] = useState('');
    const [cuisineInterestsList, setCuisineInterestsList] = useState([]);

    // Add new state for validation errors
    const [loginErrors, setLoginErrors] = useState({});
    const [signupErrors, setSignupErrors] = useState({});

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleBack = () => {
        setPage(1);
    };

    const addLovedIngredient = (e) => {
      e.preventDefault();
      if (lovedIngredient.trim()) {
          setLovedIngredients([...lovedIngredients, lovedIngredient.trim()]);
          setLovedIngredient("");
      }
    };

    const removeLovedIngredient = (index) => {
        setLovedIngredients(lovedIngredients.filter((_, i) => i !== index));
    };

    const addDislikedIngredient = (e) => {
      e.preventDefault();
      if (dislikedIngredient.trim()) {
          setDislikedIngredients([...dislikedIngredients, dislikedIngredient.trim()]);
          setDislikedIngredient("");
      }
    };

    const removeDislikedIngredient = (index) => {
        setDislikedIngredients(dislikedIngredients.filter((_, i) => i !== index));
    };

    const addCuisineInterest = (e) => {
      e.preventDefault();
      if (cuisineInterest.trim() !== '') {
          setCuisineInterestsList([...cuisineInterestsList, cuisineInterest.trim()]);
          setCuisineInterest('');
      }
    };
    
    const removeCuisineInterest = (index) => {
        const newList = cuisineInterestsList.filter((_, i) => i !== index);
        setCuisineInterestsList(newList);
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
    const handleSignInClick = async () => {
        setLoginErrors({});
        
        // Validate
        const errors = {};
        if (!email.trim()) errors.email = "Email is required";
        if (!password.trim()) errors.password = "Password is required";
        
        if (Object.keys(errors).length > 0) {
            setLoginErrors(errors);
            return;
        }

        try {
            const loginData = {
                email,   
                password
            };

            const response = await axios.post(`${apiBaseUrl}/auth/login`, loginData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const token = response.data.token;
            localStorage.setItem('authToken', token);
            navigate('/home');
        } catch (error) {
            console.error('Login error:', error);
            if (error.response) {
                switch (error.response.status) {
                    case 400:
                        setLoginErrors({ general: 'Please check your email and password format' });
                        break;
                    case 401:
                        setLoginErrors({ general: 'Invalid email or password' });
                        break;
                    case 404:
                        setLoginErrors({ general: 'Account not found' });
                        break;
                    default:
                        setLoginErrors({ general: 'An error occurred during login. Please try again.' });
                }
            } else {
                setLoginErrors({ general: 'Unable to connect to the server. Please try again later.' });
            }
        }
    };
  
    const handleCreateAccountClick = async () => {
        setSignupErrors({});
        
        const errors = {};
        if (!name.trim()) errors.name = "Name is required";
        if (!email.trim()) errors.email = "Email is required";
        if (!password.trim()) errors.password = "Password is required";
        if (password.length < 5) errors.password = "Password must be at least 5 characters";
        if (password.length > 72) errors.password = "Password must be less than 72 characters";
        
        if (Object.keys(errors).length > 0) {
            setSignupErrors(errors);
            setPage(1);
            return;
        }

        try {
            const userData = {
                name,
                email,
                password,
                preferences: {}
            };

            const response = await axios.post(`${apiBaseUrl}/auth/signup`, userData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const token = response.data.token;
            localStorage.setItem('authToken', token);
            navigate('/home');
        } catch (error) {
            console.error('Signup error:', error);
            if (error.response) {
                switch (error.response.status) {
                    case 400:
                        if (error.response.data.error === 'Invalid input length') {
                            setSignupErrors({ general: 'Please check the length of your inputs' });
                        } else {
                            setSignupErrors({ general: 'Please check your input format' });
                        }
                        break;
                    case 409:
                        setSignupErrors({ email: 'This email is already registered' });
                        break;
                    case 422:
                        setSignupErrors({ general: 'Invalid email format' });
                        break;
                    default:
                        setSignupErrors({ general: 'An error occurred during signup. Please try again.' });
                }
            } else {
                setSignupErrors({ general: 'Unable to connect to the server. Please try again later.' });
            }
            setPage(1);
        }
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
                            <div className="input-container">
                                <div className="input">
                                    <img src={email_icon} alt="" />
                                    <input 
                                        type="text" 
                                        placeholder='Email' 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                {loginErrors.email && <div className="error-message">{loginErrors.email}</div>}
                            </div>
                            <div className="input-container">
                                <div className="input">
                                    <img src={password_icon} alt="" />
                                    <input 
                                        type="password" 
                                        placeholder='Password' 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                {loginErrors.password && <div className="error-message">{loginErrors.password}</div>}
                            </div>
                            {loginErrors.general && <div className="error-message">{loginErrors.general}</div>}
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
                                    <div className="input-container">
                                        <div className="input">
                                            <img src={user_icon} alt="" />
                                            <input 
                                                type="text" 
                                                placeholder='Name' 
                                                value={name} 
                                                onChange={(e) => setName(e.target.value)}
                                            />
                                        </div>
                                        {signupErrors.name && <div className="error-message">{signupErrors.name}</div>}
                                    </div>
                                    <div className="input-container">
                                        <div className="input">
                                            <img src={email_icon} alt="" />
                                            <input 
                                                type="text" 
                                                placeholder='Email' 
                                                value={email} 
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                        {signupErrors.email && <div className="error-message">{signupErrors.email}</div>}
                                    </div>
                                    <div className="input-container">
                                        <div className="input">
                                            <img src={password_icon} alt="" />
                                            <input 
                                                type="password" 
                                                placeholder='Password' 
                                                value={password} 
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                        </div>
                                        {signupErrors.password && <div className="error-message">{signupErrors.password}</div>}
                                    </div>
                                    {signupErrors.general && <div className="error-message">{signupErrors.general}</div>}
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
                                      <form className="input" onSubmit={addCuisineInterest}>
                                          <input 
                                              type="text"
                                              placeholder="Enter a cuisine"
                                              value={cuisineInterest}
                                              onChange={(e) => setCuisineInterest(e.target.value)}
                                          />
                                          <button type="submit">Add</button>
                                      </form>
                                      <ul className="ingredient-list">
                                          {cuisineInterestsList.map((item, index) => (
                                              <li key={index}>
                                                  {item} 
                                                  <button onClick={() => removeCuisineInterest(index)}>Remove</button>
                                              </li>
                                          ))}
                                      </ul>
                                  </div>
                                    <div className="ingredient-preferences">
                                      <p>What ingredients do you love?</p>
                                      <form className="input" onSubmit={addLovedIngredient}>
                                          <input 
                                              type="text"
                                              placeholder="Enter an ingredient"
                                              value={lovedIngredient}
                                              onChange={(e) => setLovedIngredient(e.target.value)}
                                          />
                                          <button type="submit">Add</button>
                                      </form>
                                      <ul className="ingredient-list">
                                          {lovedIngredients.map((item, index) => (
                                              <li key={index}>
                                                  {item} 
                                                  <button onClick={() => removeLovedIngredient(index)}>Remove</button>
                                              </li>
                                          ))}
                                      </ul>
                                    </div>
                                    <div className="ingredient-preferences">
                                      <p>What ingredients do you dislike?</p>
                                      <form className="input" onSubmit={addDislikedIngredient}>
                                          <input 
                                              type="text"
                                              placeholder="Enter an ingredient"
                                              value={dislikedIngredient}
                                              onChange={(e) => setDislikedIngredient(e.target.value)}
                                          />
                                          <button type="submit">Add</button>
                                      </form>
                                      <ul className="ingredient-list">
                                          {dislikedIngredients.map((item, index) => (
                                              <li key={index}>
                                                  {item} 
                                                  <button onClick={() => removeDislikedIngredient(index)}>Remove</button>
                                              </li>
                                          ))}
                                      </ul>
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
            </div>
        </div>
    );
};

export default LoginSignup;
