import logo from "../assets/Logo.png";
import React, { useState } from "react";
import { Link } from "react-router";


function NoAuth() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };


  return (
    <header className='header'>
      <div className='header-logo-container'>
        <Link to="/" className="logo-container">
          <img src={logo} alt="SuiSafe Logo" className="logo-image" />
        </Link>

        <div
          className='menu-toggle'
          onClick={toggleMenu}
          aria-label='Toggle navigation menu'
        >
          <svg
            className='menu-icon'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d={
                isMenuOpen
                  ? "M6 18L18 6M6 6l12 12"
                  : "M4 6h16M4 12h16M4 18h16"
              }
            />
          </svg>
        </div>
      </div>
      <nav className={`nav ${isMenuOpen ? "nav-open" : ""}`}>
        <a href='#how-it-works' className='nav-link'>
          How It Works
        </a>
        <a href='#features' className='nav-link'>
          Features
        </a>
        <a href='#security' className='nav-link'>
          Security
        </a>
        <a href='#testimonials' className='nav-link'>
          Trusted
        </a>
      </nav>
      <Link to='/connect' className='launch-button'>
        Connect Wallet
      </Link>
    </header>
  );
}
export default NoAuth;
