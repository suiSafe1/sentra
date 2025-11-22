// ============================================================================
// FILE: src/dashboard/Dashboard.jsx
// UPDATED: Integrated with real on-chain data from Sui blockchain
// ============================================================================

import React, { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  Plus,
  DollarSign,
  Lock,
  BarChart2,
  CheckCircle,
} from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useCurrentAccount } from "@mysten/dapp-kit";

// Import our custom hook and helpers
import { useDashboardData } from "../hooks/useDashboardData";
import { formatSuiAmount } from "../utils/suiHelpers";

import TokenLock from "../dashboard/TokenLock.jsx";
import NftLock from "../dashboard/NftLock.jsx";
import Modal from "../components/LockModal.jsx";
import ComingSoon from "../pages/ComingSoon.jsx";

function Dashboard() {
  const [switchLock, setSwitchLock] = useState(false);
  const [status, setStatus] = useState(false);

  const currentAccount = useCurrentAccount();
  const location = useLocation();

  // ✅ FETCH REAL ON-CHAIN DATA
  // This hook automatically fetches data when account changes
  // and refreshes every 30 seconds
  const dashboardData = useDashboardData(currentAccount?.address);

  const handleSwitch = (e) => {
    e.preventDefault();
    if (e.target.id === "tokenLock") setSwitchLock(false);
    else if (e.target.id === "nftLock") setSwitchLock(true);
  };

  const getIcon = (title) => {
    switch (title) {
      case "Total Value Locked":
        return DollarSign;
      case "Yield Earned":
        return Lock;
      case "Active Locks":
        return BarChart2;
      case "Ready for Withdrawal":
        return CheckCircle;
      default:
        return null;
    }
  };

  // ✅ DASHBOARD STAT CARDS DATA
  // Now populated with real on-chain values
  const infos = [
    {
      key: 1,
      title: "Total Value Locked",
      // Convert MIST to SUI and format with 2 decimals
      primary: dashboardData.loading
        ? "Loading..."
        : `${formatSuiAmount(dashboardData.totalValueLocked)} SUI`,
      secondary: dashboardData.loading
        ? ""
        : currentAccount
        ? "Your current locked value"
        : "Connect wallet to view",
      icon: getIcon("Total Value Locked"),
    },
    {
      key: 2,
      title: "Yield Earned",
      // Total yield = realized (claimed) + unrealized (pending)
      primary: dashboardData.loading
        ? "Loading..."
        : `${formatSuiAmount(dashboardData.totalYieldEarned)} SUI`,
      secondary: dashboardData.loading
        ? ""
        : currentAccount
        ? "Claimed + pending yield"
        : "Connect wallet to view",
      icon: getIcon("Yield Earned"),
    },
    {
      key: 3,
      title: "Active Locks",
      // Count of all Lock and YieldLock objects owned by user
      primary: dashboardData.loading
        ? "Loading..."
        : dashboardData.activeLocks.toString(),
      secondary: "Currently generating yield",
      icon: getIcon("Active Locks"),
    },
    {
      key: 4,
      title: "Ready for Withdrawal",
      // Count of locks where current_time >= unlock_time
      primary: dashboardData.loading
        ? "Loading..."
        : dashboardData.readyForWithdrawal.toString(),
      secondary: "Locks expired",
      icon: getIcon("Ready for Withdrawal"),
    },
  ];

  const StatCard = ({ title, primaryText, secondaryText, icon: Icon }) => (
    <div className="flex flex-col gap-2 bg-white shadow-md p-6 border border-gray-200 rounded-xl text-gray-900">
      <div className="flex justify-between items-start">
        <h4 className="font-medium text-gray-500 text-sm">{title}</h4>
        {Icon && <Icon className="w-5 h-5 text-blue-900" />}
      </div>
      <p className="font-blue-900 text-gray-900 text-2xl md:text-3xl">
        {primaryText}
      </p>
      <p className="font-medium text-green-600 text-sm">{secondaryText}</p>
    </div>
  );

  const getSwitchButtonClasses = (isActive) =>
    `px-4 py-1.5 text-sm font-semibold transition-colors duration-150 ease-in-out border rounded-md ${
      isActive
        ? "bg-[#00076C] text-white border-blue-900 shadow-sm"
        : "bg-transparent text-gray-600 border-gray-300 hover:border-blue-900 hover:text-blue-900"
    }`;

  const isLockPage = location.pathname === "/dashboard/lock";

  return (
    <div className="flex flex-col flex-1 bg-gray-50 h-[88vh] overflow-y-scroll text-gray-900">
      <div className="space-y-8 mx-auto p-4 md:p-8 w-full max-w-7xl">
        {isLockPage ? (
          <Outlet />
        ) : (
          <>
            {/* ✅ DASHBOARD STAT CARDS - Now with real data */}
            <section className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {infos.map((data) => (
                <StatCard
                  key={data.key}
                  title={data.title}
                  primaryText={data.primary}
                  secondaryText={data.secondary}
                  icon={data.icon}
                />
              ))}
            </section>

            {/* Error display (if any) */}
            {dashboardData.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">
                  ⚠️ Error loading data: {dashboardData.error}
                </p>
              </div>
            )}

            {/* Your Locks section title */}
            <h2 className="pt-4 font-bold text-gray-800 text-xl">Your Locks</h2>

            <Modal />

            {/* Lock section */}
            <section className="space-y-4">
              {/* Header Bar */}
              <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
                {/* Lock Type Switch */}
                <div className="flex space-x-2">
                  <button
                    className={getSwitchButtonClasses(!switchLock)}
                    disabled={!switchLock}
                    id="tokenLock"
                    onClick={handleSwitch}
                  >
                    Token Locks
                  </button>
                  <button
                    className={getSwitchButtonClasses(switchLock)}
                    disabled={switchLock}
                    id="nftLock"
                    onClick={handleSwitch}
                  >
                    NFT Locks
                  </button>
                </div>

                {/* Filter + Create */}
                <div className="flex items-center space-x-4">
                  {/* Status Filter */}
                  <div className="relative">
                    <button
                      className="flex justify-between items-center bg-white shadow-sm px-3 py-1.5 border border-gray-300 hover:border-blue-500 rounded-md text-gray-600 hover:text-00 text-sm transition-colors"
                      onClick={() => setStatus(!status)}
                    >
                      All Statuses{" "}
                      <span className="ml-2">
                        {status ? (
                          <ChevronUp size={16} className="text-gray-500" />
                        ) : (
                          <ChevronDown size={16} className="text-gray-500" />
                        )}
                      </span>
                    </button>
                    {status && (
                      <div className="right-0 z-10 absolute bg-white shadow-lg mt-2 border border-gray-200 rounded-lg w-40">
                        <p className="hover:bg-gray-100 px-4 py-2 text-gray-800 text-sm cursor-pointer">
                          All
                        </p>
                        <p className="hover:bg-gray-100 px-4 py-2 text-gray-800 text-sm cursor-pointer">
                          Locked
                        </p>
                        <p className="hover:bg-gray-100 px-4 py-2 text-gray-800 text-sm cursor-pointer">
                          Withdraw
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Create New Lock */}
                  <Link
                    to="/dashboard/lock"
                    className="flex items-center space-x-1 bg-[#00076C] hover:bg-[#00076C] shadow-md px-3 py-1.5 rounded-md font-medium text-white text-sm transition-colors duration-200"
                  >
                    <Plus size={16} />
                    <span>Create New Lock</span>
                  </Link>
                </div>
              </div>

              {/* Token/NFT Lock List */}
              <div className="bg-white shadow-lg p-4 border border-gray-200 rounded-xl">
                {!switchLock ? <TokenLock /> : <ComingSoon />}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
