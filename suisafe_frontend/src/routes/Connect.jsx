import React, { useState } from "react";
import ethos from "../assets/ethos.png";
import slush from "../assets/slush.png";
import phantom from "../assets/Metamask.png";
import logo from "../assets/logo.svg";

const WalletConnect = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null); // Track selected wallet

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedWallet(null); // Reset selection when closing modal
  };

  // Handle wallet selection and connect button click
  const handleSelect = (wallet) => {
    setSelectedWallet(wallet);
  };

  // Handle connect action
  const handleConnect = (wallet) => {
    console.log(`Connecting to ${wallet}...`); // Replace with actual connection logic
  };

  return (
    <div className='flex justify-center items-center bg-gray-50 min-h-screen'>
      <div className='text-center'>
          <img src={logo} alt='' className="mx-auto"/>
        <p className='mb-6 text-gray-600'>
          Experience secure wallet connections with our <br /> intuitive modal
          interface
        </p>
        <button
          className='bg-blue-900 hover:bg-blue-800 px-6 py-2 rounded text-white'
          onClick={openModal}
        >
          Connect Wallet
        </button>
        {isModalOpen && (
          <div className='z-50 fixed inset-0 flex justify-center items-center bg-gray-600 bg-opacity-50'>
            <div className='bg-white shadow-lg p-6 rounded-lg w-96'>
              <h2 className='mb-4 font-bold text-blue-900 text-2xl'>
                Select a wallet
              </h2>
              <p className='mb-6 text-gray-600'>
                By connecting your wallet, you agree to our Terms of Service and
                our Privacy Policy
              </p>
              <div className='space-y-4'>
                {[
                  { name: "Slush", img: slush, bg: "bg-blue-200" },
                  { name: "Suinet", img: slush, bg: "bg-blue-200" },
                  { name: "Ethos", img: ethos, bg: "bg-purple-200" },
                  { name: "Phantom", img: phantom, bg: "bg-gray-200" },
                ].map((wallet) => (
                  <div
                    key={wallet.name}
                    className={`flex justify-between items-center p-2 rounded cursor-pointer ${
                      selectedWallet === wallet.name
                        ? "border-l-4 border-blue-500"
                        : ""
                    }`} // Add blue left border when selected
                    onClick={() => handleSelect(wallet.name)} // Select wallet on click
                  >
                    <div className='flex items-center'>
                      <div
                        className={`flex justify-center items-center ${wallet.bg} mr-3 rounded-full w-10 h-10`}
                      >
                        <img src={wallet.img} alt={wallet.name} />
                      </div>
                      <span className='text-blue-900'>{wallet.name}</span>
                    </div>
                    {selectedWallet === wallet.name && (
                      <button
                        className='text-blue-900 hover:underline'
                        onClick={() => handleConnect(wallet.name)}
                      >
                        Connect
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                className='mt-6 text-gray-600 hover:underline'
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletConnect;
