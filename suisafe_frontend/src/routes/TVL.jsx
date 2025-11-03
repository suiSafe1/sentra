import React, { useState } from "react";
import { Filter, Plus } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useConnectWallet, useCurrentAccount } from "@mysten/dapp-kit";
import WalletModal from "./Connect";
import sui from "../assets/sui.png";

export default function TVL() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTokens, setShowTokens] = useState(true);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { mutate: connect } = useConnectWallet();
  const account = useCurrentAccount();
  const location = useLocation();

  // Check if we are currently on /tvl/lock
  const isLockPage = location.pathname === "/tvl/lock";

  // Handle wallet selection from WalletModal
  const handleSelectWallet = (adapter) => {
    connect({ wallet: adapter });
    setIsWalletModalOpen(false);
  };

  // Handle Connect Wallet button click
  const handleConnectWallet = () => {
    if (!account) {
      setIsWalletModalOpen(true);
    }
  };

  const tokens = [
    {
      tokenName: "SUI",
      status: "Available",
      amount: "2,000",
      usdValue: "6,000+",
      icon: sui,
    },
    {
      tokenName: "WAL",
      status: "Locked",
      amount: "10,000",
      usdValue: "30,000+",
      icon: sui,
    },
    {
      tokenName: "USDC",
      status: "Available",
      amount: "10,000",
      usdValue: "9,999",
      icon: sui,
    },
    {
      tokenName: "sETH",
      status: "Staked",
      amount: "1",
      usdValue: "4,000",
      icon: sui,
    },
  ];

  const filteredTokens = tokens.filter((t) =>
    t.tokenName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='flex bg-gray-50 min-h-screen'>
      {/* Overlay for mobile */}
      {menuOpen && (
        <div
          className='md:hidden z-40 fixed inset-0 bg-black/40'
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className='flex flex-col flex-1 h-[100vh] overflow-y-scroll'>
        {isLockPage ? (
          // ✅ Only show nested lock page when at /tvl/lock
          <Outlet />
        ) : (
          <>
            {/* Page Content */}
            <main className='space-y-8 p-4 md:p-8 h-[80vh]'>
              <div className='gap-6 grid md:grid-cols-3'>
                <div className='flex flex-col gap-4 bg-white shadow-md p-6 rounded-xl text-center'>
                  <p className='text-gray-500'>TVL</p>
                  <p className='font-black text-blue-900 text-3xl'>$2.4M</p>
                  <p className='text-gray-400'>Total Value Locked</p>
                </div>
                <div className='flex flex-col gap-4 bg-white shadow-md p-6 rounded-xl text-center'>
                  <p className='text-gray-500'>Total Assets</p>
                  <p className='font-black text-blue-900 text-3xl'>156</p>
                  <p className='text-gray-400'>Supported Tokens</p>
                </div>
                <div className='flex flex-col items-center gap-4 bg-white shadow-md p-6 rounded-xl text-center'>
                  <p className='text-gray-500'>Highest Performing Asset</p>
                  <img src={sui} alt='sui icon' />
                </div>
              </div>
            </main>

            {/* Tokens / NFTs Section */}
            <div className='bg-gray-100 bg-white mx-6 p-6'>
              <div className='flex lg:flex-row flex-col justify-between items-center mb-4'>
                <div className='flex lg:flex-row flex-col mb-2 lg:mb-0 text-gray-500 text-sm'>
                  <div className='mb-2 lg:mb-0'>Toggle for tokens and NFTs</div>
                  <label className='flex items-center lg:ml-12 cursor-pointer'>
                    <span className='mr-8 text-gray-700'>Tokens</span>
                    <input
                      checked={!showTokens}
                      onChange={() => setShowTokens(!showTokens)}
                      type='checkbox'
                      className='sr-only peer'
                    />
                    <div className="peer after:top-[2px] after:absolute relative bg-gray-200 after:bg-white peer-checked:bg-blue-600 after:border after:border-gray-300 rounded-full after:rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 w-11 after:w-5 h-6 after:h-5 after:content-[''] after:transition-all peer-checked:after:translate-x-full after:start-[2px]"></div>
                    <span className='ml-8 text-gray-700'>NFTs</span>
                  </label>
                </div>

                {/* Filter + Create Lock Buttons */}
                <div className='flex space-x-2'>
                  <button className='flex items-center bg-white px-3 py-1 border border-blue-600 rounded-md text-blue-600 text-sm'>
                    <Filter className='mr-1 w-4 h-4' /> Filter
                  </button>

                  {/* ✅ Go to /tvl/lock */}
                  <Link
                    to='lock'
                    className='flex items-center bg-blue-600 px-3 py-1 rounded-md text-white text-sm'
                  >
                    <Plus className='mr-1 w-4 h-4' /> Create Lock
                  </Link>
                </div>
              </div>

              <div>
                {showTokens ? (
                  filteredTokens.length > 0 ? (
                    filteredTokens.map((t) => (
                      <SuiItem
                        key={t.tokenName}
                        tokenName={t.tokenName}
                        tokenIcon={t.icon}
                        status={t.status}
                        amount={t.amount}
                        usdValue={t.usdValue}
                      />
                    ))
                  ) : (
                    <div className='flex justify-center items-center bg-white shadow-md p-6 rounded-xl font-medium text-gray-500'>
                      No tokens found.
                    </div>
                  )
                ) : (
                  <p className='text-gray-500'>NFTs content goes here.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Wallet Modal */}
      {isWalletModalOpen && (
        <WalletModal
          onSelectWallet={handleSelectWallet}
          onClose={() => setIsWalletModalOpen(false)}
        />
      )}
    </div>
  );
}

// =========================
// Subcomponent
// =========================
const SuiItem = ({ tokenName, tokenIcon, status, amount, usdValue }) => {
  const statusColors = {
    Available: "bg-green-100 text-green-700 border-green-700 border-2",
    Locked: "bg-yellow-100 text-yellow-700 border-yellow-700 border-2",
    Staked: "bg-purple-100 text-purple-700 border-purple-700 border-2",
  };

  return (
    <div className='flex justify-between items-center bg-white m-2 p-4 border-2 border-black/10 rounded-xl'>
      <div className='flex items-center space-x-2'>
        {tokenIcon && (
          <img src={tokenIcon} alt={`${tokenName} icon`} className='h-14' />
        )}
        <span className='font-medium text-gray-700'>{tokenName}</span>
      </div>
      <div className='space-y-2 text-right'>
        <div className='font-bold text-blue-800'>
          {amount} {tokenName}
        </div>
        <div className='flex justify-end items-center gap-2'>
          <div className='text-gray-500 text-sm'>${usdValue}</div>
        </div>
      </div>
    </div>
  );
};
