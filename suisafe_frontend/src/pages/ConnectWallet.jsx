import React, { useState } from "react";

const WalletConnect = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className='flex justify-center items-center bg-gray-50 min-h-screen'>
      <div className='text-center'>
        <h1 className='mb-4 font-bold text-blue-900 text-2xl'>sentra</h1>
        <p className='mb-6 text-gray-600'>
          Experience secure wallet connections with our intuitive modal
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
                <div className='flex justify-between items-center'>
                  <div className='flex items-center'>
                    <div className='flex justify-center items-center bg-blue-200 mr-3 rounded-full w-10 h-10'>
                      <span className='font-bold text-blue-800'>S</span>
                    </div>
                    <span className='text-blue-900'>Slush</span>
                  </div>
                  <button className='text-blue-900 hover:underline'>
                    Connect
                  </button>
                </div>
                <div className='flex justify-between items-center'>
                  <div className='flex items-center'>
                    <div className='flex justify-center items-center bg-blue-200 mr-3 rounded-full w-10 h-10'>
                      <span className='font-bold text-blue-800'>S</span>
                    </div>
                    <span className='text-blue-900'>Suinet</span>
                  </div>
                  <button className='text-blue-900 hover:underline'>
                    Connect
                  </button>
                </div>
                <div className='flex justify-between items-center'>
                  <div className='flex items-center'>
                    <div className='flex justify-center items-center bg-purple-200 mr-3 rounded-full w-10 h-10'>
                      <span className='text-purple-800'>✨</span>
                    </div>
                    <span className='text-blue-900'>Ethos</span>
                  </div>
                  <button className='text-blue-900 hover:underline'>
                    Connect
                  </button>
                </div>
                <div className='flex justify-between items-center'>
                  <div className='flex items-center'>
                    <div className='flex justify-center items-center bg-gray-200 mr-3 rounded-full w-10 h-10'>
                      <span className='text-gray-800'>👻</span>
                    </div>
                    <span className='text-blue-900'>Phantom</span>
                  </div>
                  <button className='text-blue-900 hover:underline'>
                    Connect
                  </button>
                </div>
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
