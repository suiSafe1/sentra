// src/pages/Dashboard.jsx
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

import TokenLock from "../dashboard/TokenLock.jsx";
import NftLock from "../dashboard/NftLock.jsx";
import Modal from "../components/LockModal.jsx";
import ComingSoon from "../pages/ComingSoon.jsx";
import { useDashboardStats } from "../hooks/useDashboardStats";

function Dashboard() {
  const [switchLock, setSwitchLock] = useState(false);
  const [status, setStatus] = useState(false);

  const dashboardData = useDashboardStats();

  const currentAccount = useCurrentAccount();
  const location = useLocation();

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

  //  Stats cards data
  const infos = [
    {
      key: 1,
      title: "Total Value Locked",
      primary: dashboardData.loading
        ? "Loading..."
        : `$${dashboardData.totalValueLocked}`,
      secondary: dashboardData.loading,
      icon: getIcon("Total Value Locked"),
    },
    {
      key: 2,
      title: "Yield Earned",
      primary: dashboardData.loading
        ? "Loading..."
        : `$${dashboardData.totalYieldEarned}`,
      secondary: dashboardData.loading,
      icon: getIcon("Yield Earned"),
    },
    {
      key: 3,
      title: "Active Locks",
      primary: dashboardData.loading
        ? "Loading..."
        : dashboardData.activeLocks.toString(),
      secondary: "Currently generating yield",
      icon: getIcon("Active Locks"),
    },
    {
      key: 4,
      title: "Ready for Withdrawal",
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
      <p className="font-bold text-gray-900 text-2xl md:text-3xl">
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

  // Check if we're on the lock creation page
  const isLockPage = location.pathname === "/dashboard/lock";

  return (
    <div className="flex flex-col flex-1 bg-gray-50 h-[88vh] overflow-y-scroll text-gray-900">
      <div className="space-y-8 mx-auto p-4 md:p-8 w-full max-w-7xl">
        {/* If on /dashboard/lock, show nested route */}
        {isLockPage ? (
          <Outlet />
        ) : (
          <>
            {/* Dashboard Stats Cards */}
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

            {/* Your Locks Section Title */}
            <h2 className="pt-4 font-bold text-gray-800 text-xl">Your Locks</h2>

            <Modal />

            {/* Lock Section */}
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
                      className="flex justify-between items-center bg-white shadow-sm px-3 py-1.5 border border-gray-300 hover:border-blue-500 rounded-md text-gray-600 hover:text-blue-900 text-sm transition-colors"
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
                      <div className="left-0 z-10 absolute bg-white shadow-lg mt-2 border border-gray-200 rounded-lg w-40">
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
