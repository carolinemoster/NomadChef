// import logo from './logo.svg';
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginSignup from './Components/LoginSignup/LoginSignup';
import FrontPage from './Pages/FrontPage';
import RecipePage from './Pages/RecipePage';
import AccountPage from './Pages/AccountPage';
import PastRecipesPage from './Pages/PastRecipesPage';
import ChallengesPage from './Pages/ChallengesPage';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<LoginSignup />} />
          <Route path="/home" element={<FrontPage />} />
          <Route path="/Recipe" element={<RecipePage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path='/pastrecipes' element={<PastRecipesPage />} />
          <Route path='/challenges' element={<ChallengesPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
