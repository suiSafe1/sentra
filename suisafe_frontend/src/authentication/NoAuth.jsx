import logo from "../assets/logo.svg";
import React, { useState } from "react";
import { Link } from "react-router-dom";

function NoAuth() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className='bg-white shadow-md border-gray-200'>
      <div className='flex flex-wrap justify-between items-center p-4 w-full'>
        {/* Logo */}
        <Link to='/' className='flex items-center space-x-3'>
          <img src={logo} alt='SuiSafe Logo' className='h-8' />
        </Link>

        {/* Hamburger */}
        <div className='md:hidden flex items-center'>
          <button
            type='button'
            className='justify-center items-center hover:bg-gray-100 p-2 rounded-lg focus:outline-none focus:ring-gray-200 w-10 h-10 text-blue-900 text-sm focus:'
            aria-controls='navbar-menu'
            aria-expanded={isMenuOpen}
            onClick={toggleMenu}
          >
            <span className='sr-only'>Open main menu</span>
            <svg
              className='w-5 h-5'
              aria-hidden='true'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 17 14'
            >
              <path
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M1 1h15M1 7h15M1 13h15'
              />
            </svg>
          </button>
        </div>

        {/* Menu */}
        <div
          className={` justify-between w-full md:flex md:w-auto ${
            isMenuOpen ? "block" : "hidden"
          }`}
          id='navbar-menu'
        >
          <ul className='flex md:flex-row flex-col md:space-x-8 bg-gray-50 md:bg-white mt-4 md:mt-0 p-4 md:p-0 border border-gray-100 md:border-0 rounded-lg font-medium'>
            <li>
              <Link
                to='#how-it-works'
                className='block md:hover:bg-transparent hover:bg-gray-100 md:p-0 px-3 py-2 rounded-sm text-blue-900 md:hover:text-blue-700'
              >
                How It Works
              </Link>
            </li>
            <li>
              <Link
                to='#features'
                className='block md:hover:bg-transparent hover:bg-gray-100 md:p-0 px-3 py-2 rounded-sm text-blue-900 md:hover:text-blue-700'
              >
                Features
              </Link>
            </li>
          </ul>
        </div>

        {/* Launch App Button */}
        <Link
          to='/connect'
          className={`block bg-[#00076C] hover:bg-[#00076C]/90 md:p-2 px-3 py-2 rounded-sm text-white
            ${isMenuOpen ? "block" : "hidden"} md:block`}
        >
          Launch App
        </Link>
      </div>
    </nav>
  );
}

export default NoAuth;
