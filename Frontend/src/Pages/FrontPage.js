import React from 'react';
import './FrontPage.css';
import World from '@react-map/world';
import PromptBox from '../Components/PromptingBox/PromptBox';
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import wisk_icon from '../Components/Assets/wisk.png'


function FrontPage() {
    const responsive = {
        superLargeDesktop: {
          // the naming can be any, depends on you.
          breakpoint: { max: 4000, min: 3000 },
          items: 5
        },
        desktop: {
          breakpoint: { max: 3000, min: 1024 },
          items: 3
        },
        tablet: {
          breakpoint: { max: 1024, min: 464 },
          items: 2
        },
        mobile: {
          breakpoint: { max: 464, min: 0 },
          items: 1
        }
      };
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

          <section class="section">
              <div class="box-main">
                  <div class="firstHalf">
                    <World size={800} hoverColor="orange" type = 'select-single'/>
                     
                  </div>
              </div>
          </section>
          <section class="section">
              <div class="box-main">
                    <PromptBox/>
              </div>
          </section>
          <section class="section">
          <div class="slider">
                <Carousel responsive={responsive}>
                <div class="product-box">Item 1</div>
                <div class="product-box">Item 2</div>
                <div>Item 3</div>
                <div>Item 4</div>
                </Carousel>
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

export default FrontPage;
