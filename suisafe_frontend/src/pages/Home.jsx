import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaWallet,
  FaChartLine,
  FaLock,
  FaUsers,
  FaShieldAlt,
  FaKey,
  FaCoins,
  FaQuoteLeft,
} from "react-icons/fa";

// Assets
import logo from "../assets/logo.svg";
import mark from "../assets/Mark.png";
import lock from "../assets/lock.png";
import nft from "../assets/nft.png";
import yield_token from "../assets/yield.png";
import smart_vesting from "../assets/smart_vesting.png";
import deposit from "../assets/deposit.png";
import earn_withdraw from "../assets/earn_withdraw.png";
import lock_secure from "../assets/lock_secure.png";

// Components
import StepsCarousel from "../components/StepCarousel";

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const steps = [
    {
      title: "Connect & Deposit",
      description:
        "Connect your wallet and deposit or transfer to secure vaults.",
      icon: deposit,
    },
    {
      title: "Lock & Secure",
      description:
        "Choose lock period and our smart contracts secure your assets.",
      icon: lock_secure,
    },
    {
      title: "Earn & Withdraw",
      description: "Earn and withdraw yield generated from market trends.",
      icon: earn_withdraw,
    },
  ];

  return (
    <>
      {/* Navbar */}
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
              aria-controls='navbar-menu'
              aria-expanded={isMenuOpen}
              onClick={toggleMenu}
              className='flex justify-center items-center hover:bg-gray-100 p-2 rounded-lg w-10 h-10 text-blue-900'
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
            id='navbar-menu'
            className={`justify-between w-full md:flex md:w-auto ${
              isMenuOpen ? "block" : "hidden"
            }`}
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
            to='/public_dashboard'
            className={`block bg-[#00076C] hover:bg-[#00076C]/90 md:p-2 px-3 py-2 rounded-sm text-white
            ${isMenuOpen ? "block" : "hidden"} md:block`}
          >
            Launch App
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className='flex flex-col justify-center bg-white font-sans text-gray-800'>
        <section className='flex justify-center bg-gradient-to-br from-white via-white to-[#2b3075]'>
          <div className='justify-center content-center self-center my-28 p-4 w-fit text-left align-center'>
            <h1 className='font-bold text-black text-2xl md:text-3xl lg:text-4xl text-center'>
              Secure Your Future with <br />
              <span className='mb-4 font-bold text-blue-900 text-2xl md:text-3xl lg:text-4xl hero-title-highlight'>
                Sentra Vaults
              </span>
            </h1>
            <p className='mb-6 text-gray-600 text-base md:text-lg text-center hero-description'>
              Lock your tokens and NFTs in our battle-tested vaults. Earn yield{" "}
              while maintaining complete control and security on the Sui
              Blockchain.
            </p>
            <div className='flex md:flex-row flex-col justify-center items-center gap-4 mb-10 hero-buttons'>
              <Link
                to='/public_dashboard'
                className='bg-blue-900 px-6 py-2 rounded text-white connect-button'
              >
                Launch App
              </Link>
              <button className='bg-white hover:bg-gray-100 px-6 py-2 border border-blue-900 rounded text-blue-900 learn-more-button'>
                Learn More
              </button>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section
          id='how-it-works'
          className='mx-auto px-4 py-10 max-w-6xl text-center how-it-works-section'
        >
          <h2 className='mb-4 font-bold text-blue-900 text-xl md:text-2xl section-title'>
            How Sentra Works
          </h2>
          <p className='mb-6 md:mb-10 text-gray-600 section-description'>
            Three simple steps to start earning with our decentralized saving
            vault.
          </p>
          <StepsCarousel steps={steps} />
        </section>

        {/* Features */}
        <section
          id='features'
          className='mx-auto mb-12 px-4 py-2 max-w-6xl text-center'
        >
          <h2 className='mb-4 font-bold text-blue-900 text-xl md:text-2xl section-title'>
            Powerful Features
          </h2>
          <p className='mb-6 md:mb-10 text-gray-600 section-description'>
            Everything you need to maximize DeFi returns while maintaining
            security.
          </p>

          <div className='flex flex-wrap justify-center gap-8'>
            {[
              {
                title: "Token Locking",
                icon: lock,
                items: [
                  "Lock favorite tokens for predetermined periods and earn competitive yields.",
                  "Flexible lock periods.",
                  "Competitive APY.",
                  "Auto compounding.",
                ],
              },
              {
                title: "NFT Locking",
                icon: nft,
                items: [
                  "Safely store valuable NFTs while earning passive income.",
                  "NFT collateral",
                  "Fractionalized yields.",
                  "Secure storage.",
                ],
              },
              {
                title: "Yield Generation",
                icon: yield_token,
                items: [
                  "Multiple yield strategies to maximize your returns across different risk profiles.",
                  "DeFi strategies.",
                  "Risk management",
                  "Transparent returns.",
                ],
              },
              {
                title: "Smart Vesting",
                icon: smart_vesting,
                items: [
                  "Automated vesting schedules with customizable unlock periods.",
                  "Custom schedules.",
                  "Partial unlocks",
                  "Emergency exits.",
                ],
              },
            ].map((feature, index) => (
              <div
                key={index}
                className='flex gap-4 bg-white shadow p-6 rounded-lg min-w-90 max-w-120'
              >
                <img src={feature.icon} alt='' className='w-12 h-12' />
                <div>
                  <div className='mb-3 font-semibold text-xl text-left'>
                    {feature.title}
                  </div>
                  <ul className='space-y-2'>
                    {feature.items.map((item, i) => (
                      <li key={i} className='flex items-center gap-2 text-left'>
                        {i === 0 ? (
                          <div>{item}</div>
                        ) : (
                          <>
                            <img src={mark} alt='mark' className='w-3 h-3' />
                            <div>{item}</div>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
