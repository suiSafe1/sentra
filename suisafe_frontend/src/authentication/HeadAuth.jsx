import { Bell, Menu } from "lucide-react";
import Badge from "../components/Badge";
import logo from "../assets/suisafe-logo.svg";
import Button from "../components/Button";
import { Link } from "react-router-dom";
import { useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit";
import { useNavigate } from "react-router-dom";

function HeadAuth() {
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const navigate = useNavigate();

  // Helper: shorten wallet address
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleLogout = () => {
    disconnect(); // disconnect wallet
    localStorage.removeItem("sui_session");
    localStorage.removeItem("sui_session_proof");
    navigate("/connect"); // go back to connect page
  };

  return (
    <header className='flex justify-between items-center bg-white shadow-md px-6 py-4'>
      <Link to='/dashboard' className='flex items-center space-x-2'>
        <img src={logo} alt='SuiSafe Logo' className='h-8' />
        <span className='font-bold text-blue-900 text-xl'>suiSafe</span>
      </Link>

      <div className='flex items-center space-x-4'>
        <Badge
          className='cursor-pointer network-badge'
          onClick={handleLogout}
          title='Click to logout'
        >
          <div className='bg-green-500 mr-2 rounded-full w-2 h-2'></div>Sui
        </Badge>

        <span className='text-gray-600'>
          {account ? formatAddress(account.address) : "Not connected"}
        </span>

        <div className='relative'>
          <Bell className='w-6 h-6 text-gray-600' />
          <div className='top-0 right-0 absolute bg-red-500 rounded-full w-2 h-2'></div>
        </div>

        <Button variant='ghost' size='sm' className='md:hidden'>
          <Menu className='w-6 h-6 text-gray-600' />
        </Button>
      </div>
    </header>
  );
}

export default HeadAuth;
