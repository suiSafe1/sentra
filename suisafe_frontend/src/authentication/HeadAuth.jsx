import { Bell, Menu, X } from "lucide-react";
import Badge from "../components/Badge";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import { useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit";
import SearchBar from "../components/Search";
import { useMenuStore } from "../store/useMenuStore"; // 👈 import store

function HeadAuth() {
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const navigate = useNavigate();

  const { menuOpen, toggleMenu } = useMenuStore(); // 👈 state from store

  // Helper: shorten wallet address
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleLogout = () => {
    disconnect();
    localStorage.removeItem("sui_session");
    localStorage.removeItem("sui_session_proof");
    navigate("/connect");
  };

  return (
    <header className='flex justify-between items-center bg-white shadow-md px-6 py-4 w-full'>
      <SearchBar />

      <div className='flex items-center space-x-4'>
        <div
          className='bg-[#F3F4F6] hover:bg-red-500 px-4 py-2 rounded-md font-black text-black/60 hover:text-white transition-colors duration-200 ease-in-out hover:cursor-pointer'
          onClick={handleLogout}
          title='Click to logout'
        >
          Disconnect
        </div>

        {/* <span className='text-gray-600'>
          {account ? formatAddress(account.address) : "Not connected"}
        </span> */}

        <div className='relative'>
          <Bell className='w-6 h-6 text-gray-600' />
          <div className='top-0 right-0 absolute bg-red-500 rounded-full w-2 h-2'></div>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={toggleMenu} // 👈 toggle via store
          className='md:hidden flex items-center p-2'
        >
          {menuOpen ? (
            <X className='w-6 h-6 text-gray-600' />
          ) : (
            <Menu className='w-6 h-6 text-gray-600' />
          )}
        </button>
      </div>
    </header>
  );
}

export default HeadAuth;
