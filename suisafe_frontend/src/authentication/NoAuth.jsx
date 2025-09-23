import logo from "../assets/logo.svg";
import React, { useState } from "react";
import { Link } from "react-router-dom";

function NoAuth() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className='flex justify-between items-center bg-white shadow-md px-6 py-4'>
      <div className='flex items-center space-x-4'>
        <Link to='/' className='flex items-center'>
          <img src={logo} alt='SuiSafe Logo' className='h-8' />
        </Link>
        <div
          className='md:hidden cursor-pointer'
          onClick={toggleMenu}
          aria-label='Toggle navigation menu'
        >
          <svg
            className='w-6 h-6 text-blue-900'
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
                isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
              }
            />
          </svg>
        </div>
      </div>
      <nav className='flex gap-12'>
        <Link to='#how-it-works' className=''>
          How It Works
        </Link>
        <Link to='#features'>Features</Link>
      </nav>
      <Link to='/connect' className='bg-[#00076C] px-4 py-2 rounded ring-2'>
        <p
          className='text-white'
        >
          {" "}
          Launch App
        </p>
      </Link>
    </header>
  );
}
export default NoAuth;
