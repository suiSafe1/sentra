import React, { useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  Outlet,
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";

// Wallet & Icons
import { useConnectWallet, useCurrentAccount } from "@mysten/dapp-kit";
// --- Updated Lucide Icons ---
import {
  X,
  TrendingUp, // For TVL & APY
  LayoutDashboard, // For Dashboard
  Lock, // For Vest Tokens
  GitCompareArrows, // For Swap
  HelpCircle, // For Support
} from "lucide-react";

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
import WalletModal from "./routes/Connect";
import SwapTokens from "./components/SwapToken";

// Assets (Only logo remains as it's a fixed image)
import sentra from "./assets/sentra_dashboard.png";

// Zustand store
import { useMenuStore } from "./store/useMenuStore";

// Styles
import "flowbite";

// ===============================
// Layout Component
// ===============================
const Layout = () => {
  const { menuOpen, closeMenu } = useMenuStore();
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
    <div className='flex h-screen'>
      {/* Sidebar */}
      <aside
        className={`flex-none bg-[#00076C] text-white p-6 space-y-6 fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 w-64 md:w-64 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static`}
      >
        <div className='flex justify-between items-center mb-8 md:mb-12'>
          <img src={sentra} alt='The sentra logo' className='h-[60px]' />
          <X className='md:hidden w-6 h-6 cursor-pointer' onClick={closeMenu} />
        </div>

        {/* Sidebar Nav */}
        <nav className='flex flex-col justify-between space-y-6 h-[calc(80%-30px)]'>
          <div className='flex flex-col gap-8'>
            {/* TVL & APY (TrendingUp Icon) */}
            <NavLink
              to='/tvl'
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-2 rounded-xl w-full ${
                  isActive
                    ? "bg-white text-blue-900" // Active: Icon becomes Blue
                    : "text-white hover:bg-blue-200/20" // Inactive: Icon remains White
                }`
              }
            >
              <TrendingUp className='w-5 h-5' />
              <span>TVL & APY</span>
            </NavLink>

            {/* Dashboard (LayoutDashboard Icon) */}
            <NavLink
              to='/dashboard'
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-2 rounded-xl w-full ${
                  isActive
                    ? "bg-white text-blue-900"
                    : "text-white hover:bg-blue-200/20"
                }`
              }
            >
              <LayoutDashboard className='w-5 h-5' />
              <span>Dashboard</span>
            </NavLink>

            {/* Vest Tokens (Lock Icon) */}
            <NavLink
              to='/lock'
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-2 rounded-xl w-full ${
                  isActive
                    ? "bg-white text-blue-900"
                    : "text-white hover:bg-blue-200/20"
                }`
              }
            >
              <Lock className='w-5 h-5' />
              <span>Vest Tokens</span>
            </NavLink>

            {/* Swap (GitCompareArrows Icon) */}
            <NavLink
              to='/swap'
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-2 rounded-xl w-full ${
                  isActive
                    ? "bg-white text-blue-900"
                    : "text-white hover:bg-blue-200/20"
                }`
              }
            >
              <GitCompareArrows className='w-5 h-5' />
              <span>Swap</span>
            </NavLink>
          </div>

          {/* Support (HelpCircle Icon) */}
          <NavLink
            to='/support'
            className={({ isActive }) =>
              `flex items-center space-x-2 px-3 py-2 rounded-xl w-full ${
                isActive
                  ? "bg-white text-blue-900"
                  : "text-white hover:bg-blue-200/20"
              }`
            }
          >
            <HelpCircle className='w-5 h-5' />
            <span>Support</span>
          </NavLink>
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

// ===============================
// App Component
// ===============================
function App() {
  const account = useCurrentAccount();

  return (
    <Routes>
      {/* Public */}
      <Route path='/public_dashboard' element={<PublicDashboard />} />
      <Route
        path='/'
        element={account ? <Navigate to='/dashboard' /> : <Home />}
      />

      {/* Layout-protected routes */}
      <Route element={<Layout />}>
        <Route path='/connect' element={<WalletConnect />} />

        <Route
          path='/dashboard'
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path='/tvl'
          element={
            <ProtectedRoute>
              <div>TVL & APY Page</div>
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
        <Route
          path='/swap'
          element={
            <ProtectedRoute>
              <SwapTokens />
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
          path='/create'
          element={
            <ProtectedRoute>
              <CreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/support'
          element={
            <ProtectedRoute>
              <div>Support Page</div>
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path='/*' element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
