// import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginSignup from './Components/LoginSignup/LoginSignup';
import FrontPage from './Pages/FrontPage';
import RecipePage from './Pages/RecipePage';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<LoginSignup />} />
          <Route path="/login" element={<LoginSignup />} />
          <Route path="/home" element={<FrontPage />} />
          <Route path="/Recipe" element={<RecipePage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
