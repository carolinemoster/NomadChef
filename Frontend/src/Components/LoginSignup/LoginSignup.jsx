import React from 'react';
import './LoginSignup.css'
import user_icon from '../Assets/person.png'
import email_icon from '../Assets/email.png'
import password_icon from '../Assets/password.png'
import wisk_icon from '../Assets/wisk.png'
import { useState } from 'react';

const LoginSignup = () => {
    const [action, setAction] = useState("Sign In"); 

  return (
    <div className = 'container'>
        <div className='brand'>
            NomadChef
            <img src={wisk_icon} alt="Whisk Icon" className="whisk" />
        </div>
        <div className = 'header'>
            <div className = 'text'>{action}</div>
            <div className="underline"></div>
        </div>
        <div className="inputs">
        {action === "Sign In"?<div></div>:
        <div className="input">
            <img src={user_icon} alt="" />
            <input type="text" placeholder='Name'/>
        </div>}
        <div className="input">
            <img src={email_icon} alt="" />
            <input type="text" placeholder='Email'/>
        </div>
        <div className="input">
            <img src={password_icon} alt="" />
            <input type="password" placeholder='Password'/>
        </div>
      </div>
      {action === "Sign In" ? (<div> <div className="forgot-password"><span>Forgot Password?</span></div>
        <div className="create-account">New to NomadChef? <span onClick={() => setAction("Create Account")}>Create Account</span>
        </div></div>) : null}
        {action === "Create Account" ? (<div className="sign-in">Back to <span onClick={() => setAction("Sign In")}>Sign In</span>
        </div>) : null}
      <div className="submit-container">
        {action === "Sign In" ? (
                    <div className="submit" onClick={() => setAction("Sign In")}>Sign In</div>
                ) : (
                    <div className="submit" onClick={() => setAction("Create Account")}>Create Account</div>
                )}
        
      </div>
    </div>
  );
};

export default LoginSignup;
