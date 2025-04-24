import React, { useState, useEffect } from 'react';
import './PastRecipesPage.css';
import wisk_icon from '../Components/Assets/wisk.png';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaStar } from 'react-icons/fa';

const BASE_USER_RECIPES = "https://b60ih09kxi.execute-api.us-east-2.amazonaws.com/dev/user-recipe";
const API_BASE_URL = "https://b60ih09kxi.execute-api.us-east-2.amazonaws.com/dev";

function PastRecipesPage() {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [currentPage, setCurrentPage] = useState(-1);
    const [isFlipping, setIsFlipping] = useState(false);
    const [userName, setUserName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredHistory, setFilteredHistory] = useState([]);

    const getHistory = async () => {  
        try {
            const token = localStorage.getItem('authToken'); 
            if (!token) {
                navigate('/');
                return;
            }
            const response = await fetch(BASE_USER_RECIPES, {
                method: "GET",  
                headers: {
                  "Authorization": `Bearer ${token}`, 
                  "Content-Type": "application/json" 
                }});
            const data = await response.json();
            console.log('Full recipe history data:', data);
            console.log('First recipe example:', data.recipes?.[0]);
            if(data) {
                // Filter for completed recipes (those with rating or wouldCookAgain)
                const completedRecipes = data.recipes.filter(recipe => 
                    recipe.rating || recipe.personalRating || recipe.wouldCookAgain
                );
                setHistory(completedRecipes || []);
                setFilteredHistory(completedRecipes || []);
            }
        } catch (error) {
            console.error('Error fetching recipes:', error);
            setHistory([]);
            setFilteredHistory([]);
        }
    }

    const getUserInfo = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                navigate('/');
                return;
            }
            const response = await axios.get(`${API_BASE_URL}/auth/getUserData`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.data && response.data.name) {
                setUserName(response.data.name);
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
            setUserName('Nomad Chef');
        }
    }

    useEffect(() => {
        window.scrollTo(0, 0);
        getHistory();
        getUserInfo();
    }, []); // Add comment to explain why we're ignoring the dependency warning
    // eslint-disable-next-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (searchQuery) {
            const filtered = history.filter(recipe => 
                recipe.recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredHistory(filtered);
            setCurrentPage(filtered.length > 0 ? 0 : -1);
        } else {
            setFilteredHistory(history);
            setCurrentPage(-1);
        }
    }, [searchQuery, history]);

    const handleBrandClick = () => {
        navigate('/home');
    };

    const handlePastRecipesClick = () => {
        navigate('/pastrecipes');
    };

    const handleAccountClick = () => {
        navigate('/account');
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/');
    };

    const recipeClicked = (recipeID) => {
        navigate('/Recipe', {state: {recipeID}});
    };

    const nextPage = () => {
        if (currentPage < filteredHistory.length - 1) {
            setIsFlipping(true);
            setTimeout(() => {
                setCurrentPage(currentPage + 1);
                setIsFlipping(false);
            }, 300);
        }
    };

    const prevPage = () => {
        const minPage = searchQuery ? 0 : -1;
        if (currentPage > minPage) {
            setIsFlipping(true);
            setTimeout(() => {
                setCurrentPage(currentPage - 1);
                setIsFlipping(false);
            }, 300);
        }
    };

    const renderPassportContent = () => {
        if (currentPage === -1 && !searchQuery) {
            return (
                <div className="passport-cover">
                    <div className="passport-emblem"></div>
                    <h1>{userName}'s</h1>
                    <h2>NomadChef Passport</h2>
                    <div className="passport-subtitle">Culinary Adventures</div>
                    <div className="passport-decoration"></div>
                </div>
            );
        }

        if (filteredHistory.length === 0) {
            return (
                <div className="recipe-content">
                    <h2>No recipes found</h2>
                    <p>{searchQuery ? 'Try a different search term.' : 'Start cooking to build your recipe passport.'}</p>
                </div>
            );
        }

        if (currentPage >= 0 && currentPage < filteredHistory.length) {
            const currentRecipe = filteredHistory[currentPage];
            return (
                <div className="recipe-content" onClick={() => recipeClicked(currentRecipe.recipeId)}>
                    <h2>{currentRecipe.recipe.title}</h2>
                    <div className="recipe-image">
                        <img src={currentRecipe.recipe.image} alt={currentRecipe.recipe.title} />
                    </div>
                    <div className="recipe-rating" style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        gap: '4px',
                        margin: '10px 0'
                    }}>
                        {[...Array(5)].map((_, index) => (
                            <FaStar
                                key={index}
                                size={20}
                                style={{
                                    color: index < (currentRecipe.rating || currentRecipe.personalRating || 0) ? '#ffc107' : '#e4e5e9'
                                }}
                            />
                        ))}
                        {currentRecipe.wouldCookAgain && (
                            <span style={{ 
                                marginLeft: '10px', 
                                fontSize: '14px',
                                color: '#0d4725'
                            }}>
                                • Would cook again: {currentRecipe.wouldCookAgain}
                            </span>
                        )}
                    </div>
                    <div className="recipe-origin" style={{
                        textAlign: 'center',
                        color: '#0d4725',
                        fontSize: '14px',
                        marginBottom: '10px'
                    }}>
                        {currentRecipe.recipe.origin ? (
                            <div>
                                <strong>Origin:</strong> {[
                                    currentRecipe.recipe.origin.locality,
                                    currentRecipe.recipe.origin.region,
                                    currentRecipe.recipe.origin.country
                                ].filter(Boolean).join(', ')}
                            </div>
                        ) : (
                            "Origin: Not specified"
                        )}
                    </div>
                    <div className="recipe-details">
                        {currentRecipe.recipe.culturalContext ? (
                            <p>{currentRecipe.recipe.culturalContext}</p>
                        ) : (
                            <p>No cultural context available for this recipe.</p>
                        )}
                    </div>
                    <div className="page-number">
                        Recipe {currentPage + 1} of {filteredHistory.length}
                    </div>
                </div>
            );
        }

        return (
            <div className="recipe-content">
                <h2>No recipes yet</h2>
                <p>Start cooking to build your recipe passport.</p>
            </div>
        );
    };

    return (
        <div className="front-page">
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

            <section className="section">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search your recipes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="passport-container">
                    <div className={`passport-book ${currentPage === -1 && !searchQuery ? 'cover-page' : ''}`}>
                        <div className={`passport-page ${isFlipping ? 'flipping' : ''}`}>
                            {renderPassportContent()}
                        </div>
                    </div>
                    <div className="passport-controls">
                        <button 
                            onClick={prevPage} 
                            className="control-button"
                            disabled={currentPage === (searchQuery ? 0 : -1) || filteredHistory.length === 0}
                        >
                            Previous
                        </button>
                        <button 
                            onClick={nextPage} 
                            className="control-button"
                            disabled={currentPage === filteredHistory.length - 1 || filteredHistory.length === 0}
                        >
                            Next
                        </button>
                    </div>
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

export default PastRecipesPage;
