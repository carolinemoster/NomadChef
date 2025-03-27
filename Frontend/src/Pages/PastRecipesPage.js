import React, { useState, useEffect } from 'react';
import './PastRecipesPage.css';
import wisk_icon from '../Components/Assets/wisk.png';
import { useNavigate } from 'react-router-dom';
import RecipeCard from '../Components/RecipeCard/RecipeCard';
import axios from 'axios';

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
            if(data) {
                setHistory(data.recipes || []);
                setFilteredHistory(data.recipes || []);
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
    }, []);

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
                    <div className="recipe-details">
                        <p>{currentRecipe.recipe.summary?.replace(/<\/?[^>]+(>|$)/g, "")}</p>
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
                        <li><a href="#courses">About</a></li>
                        <li><button onClick={handlePastRecipesClick} className='nav-button'>Past Recipes</button></li>
                        <li><a href="#jobs">Settings</a></li>
                        <li>
                            <button 
                                onClick={handleAccountClick} 
                                className="nav-button"
                            >
                                Account
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
