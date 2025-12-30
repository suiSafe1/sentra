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
import {
  X,
  TrendingUp,
  LayoutDashboard,
  Lock,
  GitCompareArrows,
  HelpCircle,
} from "lucide-react";

// Pages & Routes
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import ComingSoon from "./pages/ComingSoon";
import CreatePage from "./routes/CreatePage";
import WithdrawalPage from "./routes/WithdrawalPage";
import Dashboard from "./routes/Dashboard";
import CreateLockToken from "./routes/CreateLockToken";
import WalletConnect from "./routes/Connect";

// Components
import Header from "./components/Header";
import ProtectedRoute from "./authentication/ProtectedRoute";
import WalletModal from "./routes/Connect";
import SwapTokens from "./components/SwapToken";

// Assets
import sentra from "./assets/sentra_dashboard.png";

// Zustand store
import { useMenuStore } from "./store/useMenuStore";

import { ActivityProvider } from "../src/context/ActivityContext";
import TVL from "./routes/TVL";

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
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside
        className={`flex-none bg-[#00076C] text-white p-6 space-y-6 fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 w-64 md:w-64 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static`}
      >
        <div className="flex justify-between items-center mb-8 md:mb-12">
          <img src={sentra} alt="The sentra logo" className="h-[60px]" />
          <X className="md:hidden w-6 h-6 cursor-pointer" onClick={closeMenu} />
        </div>

        {/* Sidebar Nav */}
        <nav className="flex flex-col justify-between space-y-6 h-[calc(80%-30px)]">
          <div className="flex flex-col gap-8">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-2 rounded-xl w-full ${
                  isActive
                    ? "bg-white text-blue-900"
                    : "text-white hover:bg-[#00076C]/20"
                }`
              }
            >
              <TrendingUp className="w-5 h-5" />
              <span>TVL & APY</span>
            </NavLink>

            <NavLink
              to="/my-locks"
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-2 rounded-xl w-full ${
                  isActive
                    ? "bg-white text-blue-900"
                    : "text-white hover:bg-[#00076C]/20"
                }`
              }
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>My Locks</span>
            </NavLink>

            <NavLink
              to="/swap"
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-2 rounded-xl w-full ${
                  isActive
                    ? "bg-white text-blue-900"
                    : "text-white hover:bg-[#00076C]/20"
                }`
              }
            >
              <GitCompareArrows className="w-5 h-5" />
              <span>Swap</span>
            </NavLink>

            <NavLink
              to="/vest"
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-2 rounded-xl w-full ${
                  isActive
                    ? "bg-white text-blue-900"
                    : "text-white hover:bg-[#00076C]/20"
                }`
              }
            >
              <Lock className="w-5 h-5" />
              <span>Vest Tokens</span>
            </NavLink>
          </div>

          <NavLink
            to="/support"
            className={({ isActive }) =>
              `flex items-center space-x-2 px-3 py-2 rounded-xl w-full ${
                isActive
                  ? "bg-white text-blue-900"
                  : "text-white hover:bg-[#00076C]/20"
              }`
            }
          >
            <HelpCircle className="w-5 h-5" />
            <span>Support</span>
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="w-full">
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
  return (
    <ActivityProvider>
      <Routes>
        {/* Landing Page - NO LAYOUT */}
        <Route path="/" element={<Home />} />

        {/* All app routes use Layout */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<TVL />}>
            <Route path="lock" element={<CreateLockToken />} />
          </Route>

          <Route
            path="/my-locks"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route path="lock" element={<CreateLockToken />} />
          </Route>

          {/* Other Protected Routes */}
          <Route
            path="/vest"
            element={
              <ProtectedRoute>
                <ComingSoon />
              </ProtectedRoute>
            }
          />
          <Route
            path="/swap"
            element={
              <ProtectedRoute>
                <SwapTokens />
              </ProtectedRoute>
            }
          />
          <Route
            path="/withdraw"
            element={
              <ProtectedRoute>
                <WithdrawalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/support"
            element={
              <ProtectedRoute>
                <ComingSoon />
              </ProtectedRoute>
            }
          />

          {/* Redirect /connect to dashboard */}
          <Route
            path="/connect"
            element={<Navigate to="/dashboard" replace />}
          />

          {/* Catch-all - redirect to dashboard instead of 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </ActivityProvider>
  );
}

export default App;
