import React, { useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";

// Pages & Routes
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import CreatePage from "./routes/CreatePage";
import WithdrawalPage from "./routes/WithdrawalPage";
import Dashboard from "./routes/Dashboard";
import CreateLockToken from "./routes/CreateLockToken";
import WalletConnect from "./routes/Connect";
import PublicDashboard from "./routes/PublicDashboard";

// Components
import Header from "./components/Header";
import ProtectedRoute from "./authentication/ProtectedRoute";

// Wallet & Icons
import { useConnectWallet, useCurrentAccount } from "@mysten/dapp-kit";
import { Menu, X } from "lucide-react";
import WalletModal from "./routes/Connect";

// Assets
import trendup from "./assets/TrendUp.png";
import vest from "./assets/vest.png";
import swap from "./assets/swap.png";
import question from "./assets/Question.png";
import sentra from "./assets/sentra_dashboard.png";

// Zustand store
import { useMenuStore } from "./store/useMenuStore";

// Styles
import "flowbite";

// Layout Component
const Layout = () => {
  const { menuOpen, closeMenu } = useMenuStore(); // 👈 Zustand global state
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { mutate: connect } = useConnectWallet();
  const account = useCurrentAccount();

  const handleConnectWallet = () => {
    setIsWalletModalOpen(true);
    connect();
  };

  return (
    <div className='flex h-[100vh]'>
      {/* Sidebar */}
      <aside
        className={` flex-none bg-[#00076C] text-white p-6 space-y-6 fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 w-64 md:w-64 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static`}
      >
        <div className='flex justify-between items-center mb-8 md:mb-12'>
          <img src={sentra} alt='The sentra logo' className='h-[60px]' />
          <X
            className='md:hidden w-6 h-6 cursor-pointer'
            onClick={closeMenu} // 👈 close from Zustand
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

            {/* <button
              className='md:hidden block bg-white px-3 py-1 rounded-md font-medium text-[#00076C]'
              onClick={handleConnectWallet}
            >
              Connect Wallet
            </button> */}
          </div>

          <div className='flex items-center space-x-2 mt-10 cursor-pointer'>
            <img src={question} alt='Question mark' />
            <span>Support</span>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className='w-full'>
        <Header />
        <Outlet />
      </div>

      {isWalletModalOpen && (
        <WalletModal onClose={() => setIsWalletModalOpen(false)} />
      )}
    </div>
  );
};

// App Component
function App() {
  const account = useCurrentAccount();

  return (
    <Routes>
      <Route path='/public_dashboard' element={<PublicDashboard />} />

      <Route
        path='/'
        element={account ? <Navigate to='/dashboard' /> : <Home />}
      />
      <Route element={<Layout />}>
        <Route path='/*' element={<NotFound />} />
        <Route path='/connect' element={<WalletConnect />} />
        <Route
          path='/create'
          element={
            <ProtectedRoute>
              <CreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/withdraw'
          element={
            <ProtectedRoute>
              <WithdrawalPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/dashboard'
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path='/lock'
          element={
            <ProtectedRoute>
              <CreateLockToken />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
