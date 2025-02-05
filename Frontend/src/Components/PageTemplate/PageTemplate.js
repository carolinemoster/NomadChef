import React from 'react';
import './PageTemplate.css';
import wisk_icon from '../Components/Assets/wisk.png'


function PageTemplate() {
    
  return (
      <div>
          <nav class="navbar background">
                <div className='brand'>
                              NomadChef
                              <img src={wisk_icon} alt="Whisk Icon" className="whisk" />
                </div>
                <div className='list-items'>             
              <ul class="nav-list">

                  <li>
                      <a href="#courses">About</a>
                  </li>
                  <li>
                      <a href="#tutorials">Past Recipes</a>
                  </li>
                  <li>
                      <a href="#jobs">Settings</a>
                  </li>
                  <li>
                      <a href="#student">Account</a>
                  </li>
              </ul>
            </div>
              <div class="rightNav">
                  
              </div>
          </nav>

          
          <footer className="footer">
              <p className="text-footer">
                  Copyright ©-All rights are reserved
              </p>
          </footer>
      </div>
  );
}

export default PageTemplate;
