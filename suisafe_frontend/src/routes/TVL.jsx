import React, { useState } from "react";
import { Filter, Plus } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useConnectWallet, useCurrentAccount } from "@mysten/dapp-kit";
import WalletModal from "./Connect";
import sui from "../assets/sui.png";
import wal from "../assets/wal.png";
import deep from "../assets/deep.png";
import usdc from "../assets/usdc.png";
import scal from "../assets/scal.png";

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
      icon: wal,
    },
    {
      tokenName: "USDC",
      status: "Available",
      amount: "10,000",
      usdValue: "9,999",
      icon: usdc,
    },
    {
      tokenName: "DEEP",
      status: "Staked",
      amount: "1",
      usdValue: "4,000",
      icon: deep,
    },
    {
      tokenName: "SCA",
      status: "Staked",
      amount: "1",
      usdValue: "2,500",
      icon: scal,
    },
  ];

  const filteredTokens = tokens.filter((t) =>
    t.tokenName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='flex bg-gray-50 h-[90vh]'>
      {/* Overlay for mobile */}
      {menuOpen && (
        <div
          className='md:hidden z-40 fixed inset-0 bg-black/40'
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className='flex flex-col flex-1 overflow-y-scroll'>
        {isLockPage ? (
          // ✅ Only show nested lock page when at /tvl/lock
          <Outlet />
        ) : (
          <>
            {/* Page Content */}
            <main className='p-4 md:p-8'>
              <div className='gap-6 grid grid-cols-1 sm:grid-cols-3'>
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
            <div className='bg-white mx-6 p-6'>
              {/* Header Row */}
              <div className='flex justify-around items-center mb-2 pb-2 font-semibold text-blue-900 text-sm'>
                <span className='w-32'>TOKEN</span>
                <span className='w-24 text-center'>APY</span>
                <span className='w-24 text-right'>TVL</span>
              </div>

              <div>
                {showTokens ? (
                  filteredTokens.length > 0 ? (
                    filteredTokens.map((t) => (
                      <Link key={t.tokenName} to='/tvl/lock'>
                        <SuiItem
                          tokenName={t.tokenName}
                          tokenIcon={t.icon}
                          status={t.status}
                          amount={t.amount}
                          usdValue={t.usdValue}
                        />
                      </Link>
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
      <div className='flex items-center space-x-2 w-32'>
        {tokenIcon && (
          <img src={tokenIcon} alt={`${tokenName} icon`} className='h-14' />
        )}
        <span className='font-medium text-gray-700'>{tokenName}</span>
      </div>
      <p className="font-bold text-blue-900">12.5%</p>
      <div className='space-y-2 w-24 text-right'>
        <div className='font-bold text-blue-900'>
          {amount} {tokenName}
        </div>
        <div className='flex justify-end items-center gap-2'>
          <div className='text-gray-500 text-sm'>${usdValue}</div>
        </div>
      </div>
    </div>
  );
};
