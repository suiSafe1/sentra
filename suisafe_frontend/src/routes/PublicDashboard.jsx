import React, { useState, useEffect } from "react";
import { Menu, Search, X, Filter, Plus } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useConnectWallet, useCurrentAccount } from "@mysten/dapp-kit";
import SearchBar from "../components/Search";
import WalletModal from "./Connect"; // Import WalletModal
import sui from "../assets/sui.png";
import trendup from "../assets/TrendUp.png";
import vest from "../assets/vest.png";
import swap from "../assets/swap.png";
import question from "../assets/Question.png";
import sentra from "../assets/sentra_dashboard.png";

export default function PublicDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTokens, setShowTokens] = useState(true);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false); // State for modal visibility
  const navigate = useNavigate();
  const location = useLocation();
  const { mutate: connect } = useConnectWallet();
  const account = useCurrentAccount();

  // Redirect to /dashboard if connected and not already there
  useEffect(() => {
    try {
      const existingSession =
        typeof window !== "undefined" && localStorage.getItem("sui_session");
      if (existingSession && location.pathname !== "/dashboard") {
        navigate("/dashboard", { replace: true });
      }
    } catch (e) {
      console.warn("Could not check session:", e);
    }
  }, [navigate, location.pathname]);

  // Persist session and redirect on successful connection
  useEffect(() => {
    if (!account || location.pathname === "/dashboard") return;

    const session = {
      address: account.address,
      connectedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem("sui_session", JSON.stringify(session));
      navigate("/dashboard", { replace: true });
    } catch (e) {
      console.warn("Could not persist session:", e);
    }
  }, [account, navigate, location.pathname]);

  // Handle wallet selection from WalletModal
  const handleSelectWallet = (adapter) => {
    connect({ wallet: adapter });
    setIsWalletModalOpen(false); // Close modal after selection
  };

  return (
    <div className='flex bg-gray-50 min-h-screen'>
      {/* Sidebar (desktop visible, mobile toggle) */}
      <aside
        className={`h-[100vh] bg-[#00076C] text-white p-6 space-y-6 fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 w-64 md:w-64 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static`}
      >
        <div className='flex justify-between items-center mb-8 md:mb-12'>
          <img src={sentra} alt='The sentra logo' className='h-[60px]' />
          <X
            className='md:hidden w-6 h-6 cursor-pointer'
            onClick={() => setMenuOpen(false)}
          />
        </div>
        <nav className='flex flex-col justify-between space-y-6 h-[calc(80%-30px)]'>
          <div className='flex flex-col gap-8'>
            <button className='flex items-center space-x-2 bg-white px-3 py-2 rounded-xl w-full text-blue-900'>
              <Menu className='w-5 h-5' />
              <span>Dashboard</span>
            </button>
            <div className='flex items-center space-x-2 cursor-pointer'>
              <img src={trendup} alt='The trend going up' />
              <span>TVL & APY</span>
            </div>
            <div className='flex items-center space-x-2 cursor-pointer'>
              <img src={vest} alt='Lock icon' />
              <span>Vest Tokens</span>
            </div>
            <div className='flex items-center space-x-2 cursor-pointer'>
              <img src={swap} alt='Swap icon' />
              <span>Swap</span>
            </div>
            <button
              className='md:hidden block bg-white px-3 py-1 rounded-md font-medium text-[#00076C]'
              onClick={() => setIsWalletModalOpen(true)}
            >
              Connect Wallet
            </button>
          </div>
          <div className='flex items-center space-x-2 mt-10 cursor-pointer'>
            <img src={question} alt='Question mark' />
            <span>Support</span>
          </div>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {menuOpen && (
        <div
          className='md:hidden z-40 fixed inset-0 bg-black/40'
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className='flex flex-col flex-1'>
        {/* Navbar (content area header) */}
        <header className='flex justify-between items-center bg-white px-4 py-3 md:pl-8 text-[#00076C]'>
          <div className='flex justify-between space-x-3 w-full'>
            <SearchBar />
            <button
              className='hidden md:block bg-[#00076C] px-3 py-1 rounded-md font-medium text-white'
              onClick={() => setIsWalletModalOpen(true)}
            >
              Connect Wallet
            </button>
            <button className='md:hidden' onClick={() => setMenuOpen(true)}>
              <Menu className='w-6 h-6' />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className='space-y-8 p-4 md:p-8'>
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
        <div className='bg-gray-100 bg-white mx-6 p-6'>
          <div className='flex lg:flex-row flex-col justify-between items-center items-start mb-4'>
            <div className='flex lg:flex-row flex-col mb-2 lg:mb-0 text-gray-500 text-sm'>
              <div className='mb-2 lg:mb-0'> Toggle for tokens and NFTs</div>
              <label className='flex items-center lg:ml-12 cursor-pointer'>
                <span className='mr-8 text-gray-700'>Tokens</span>
                <input
                  checked={!showTokens}
                  onChange={() => setShowTokens(!showTokens)}
                  type='checkbox'
                  value=''
                  className='sr-only peer'
                />
                <div class="peer after:top-[2px] after:absolute relative bg-gray-200 after:bg-white dark:bg-gray-700 dark:peer-checked:bg-blue-600 peer-checked:bg-blue-600 after:border after:border-gray-300 dark:border-gray-600 peer-checked:after:border-white rounded-full after:rounded-full peer-focus:outline-none dark:peer-focus:ring-blue-800 peer-focus:ring-4 peer-focus:ring-blue-300 w-11 after:w-5 h-6 after:h-5 after:content-[''] after:transition-all rtl:peer-checked:after:-translate-x-full peer-checked:after:translate-x-full after:start-[2px]"></div>

                <span className='ml-8 text-gray-700'>NFTs</span>
              </label>
            </div>
            <div className='flex space-x-2'>
              <button className='flex items-center bg-white px-3 py-1 border border-blue-600 rounded-md text-blue-600 text-sm'>
                <Filter className='mr-1 w-4 h-4' /> Filter
              </button>
              <button className='flex items-center bg-blue-600 px-3 py-1 rounded-md text-white text-sm'>
                <Plus className='mr-1 w-4 h-4' /> Create Lock
              </button>
            </div>
          </div>
          <div className=''>
            {showTokens ? (
              <>
                <SuiItem
                  tokenName='SUI'
                  tokenIcon={sui}
                  status='Available'
                  amount='2,000'
                  usdValue='6,000+'
                />

                <SuiItem
                  tokenName='WAL'
                  tokenIcon={sui} // replace with actual WAL icon
                  status='Locked'
                  amount='10,000'
                  usdValue='30,000+'
                />

                <SuiItem
                  tokenName='USDC'
                  tokenIcon={sui}
                  status='Available'
                  amount='10,000'
                  usdValue='9,999'
                />

                <SuiItem
                  tokenName='sETH'
                  tokenIcon={sui}
                  status='Staked'
                  amount='1'
                  usdValue='4,000'
                />
              </>
            ) : (
              <p className='text-gray-500'>NFTs content goes here.</p> // Placeholder for NFTs
            )}
          </div>
        </div>
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

const SuiItem = ({ tokenName, tokenIcon, status, amount, usdValue }) => {
  // Define color mapping for statuses
  const statusColors = {
    Available: "bg-green-100 text-green-700 border-green-700 border-2",
    Locked: "bg-yellow-100 text-yellow-700 border-yellow-700 border-2",
    Staked: "bg-purple-100 text-purple-700 border-purple-700 border-2",
  };

  return (
    <div className='flex justify-between items-center bg-white p-2'>
      {/* Token Info */}
      <div className='flex items-center space-x-2'>
        {tokenIcon && (
          <img src={tokenIcon} alt={`${tokenName} icon`} className='h-14' />
        )}
        <span className='font-medium text-gray-700'>{tokenName}</span>
      </div>

      {/* Right Side */}
      <div className='space-y-2 text-right'>
        <div className='font-bold text-blue-800'>
          {amount} {tokenName}
        </div>
        <div className='flex justify-end items-center gap-2'>
          {/* Status Badge */}
          <div
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}
          >
            {status}
          </div>
          <div className='text-gray-500 text-sm'>${usdValue}</div>
        </div>
      </div>
    </div>
  );
};

