import React, { useState, useEffect } from "react";
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
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";

import TokenLock from "../dashboard/TokenLock.jsx";
import NftLock from "../dashboard/NftLock.jsx";
import Modal from "../components/LockModal.jsx";

const PACKAGE_ID =
  "0x690cc8f7277cbb2622de286387fc3bec5b6de4bdbb155d0ae2a0852d154ab194";
const REGISTRY_ID =
  "0xa92e808ecf2e5a129b7a801719d8299528c644ae0f609054fa17f902610aa93a";
const PLATFORM_ID =
  "0x07a716a59b9a44fa761e417ef568367cb2ed3a9cf7cfcf1c281c1ad257d806bc";

const client = new SuiClient({ url: getFullnodeUrl("mainnet") });

function Dashboard() {
  const [switchLock, setSwitchLock] = useState(false);
  const [status, setStatus] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalValueLocked: "0.00",
    totalYieldEarned: "0.00",
    activeLocks: 0,
    readyForWithdrawal: 3,
    loading: true,
  });

  const currentAccount = useCurrentAccount();
  const location = useLocation(); // detect current path

  const handleSwitch = (e) => {
    e.preventDefault();
    if (e.target.id === "tokenLock") setSwitchLock(false);
    else if (e.target.id === "nftLock") setSwitchLock(true);
  };

  const fetchDashboardStats = async () => {
    try {
      setDashboardData((prev) => ({ ...prev, loading: true }));

      // Mocked data (replace with real fetch logic)
      setDashboardData({
        totalValueLocked: "12,450.75",
        totalYieldEarned: "402.12",
        activeLocks: 7,
        readyForWithdrawal: 3,
        loading: false,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    const interval = setInterval(fetchDashboardStats, 30000);
    return () => clearInterval(interval);
  }, [currentAccount]);

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

  const infos = [
    {
      key: 1,
      title: "Total Value Locked",
      primary: dashboardData.loading
        ? "Loading..."
        : `$${dashboardData.totalValueLocked}`,
      secondary: dashboardData.loading ? "" : "+5.2% from last month",
      icon: getIcon("Total Value Locked"),
    },
    {
      key: 2,
      title: "Yield Earned",
      primary: dashboardData.loading
        ? "Loading..."
        : `${dashboardData.totalYieldEarned} SUI`,
      secondary: dashboardData.loading
        ? ""
        : `+$1,204.64 (+5.2% from last month)`,
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
    <div className='flex flex-col gap-2 bg-white shadow-md p-6 border border-gray-200 rounded-xl text-gray-900'>
      <div className='flex justify-between items-start'>
        <h4 className='font-medium text-gray-500 text-sm'>{title}</h4>
        {Icon && <Icon className='w-5 h-5 text-blue-600' />}
      </div>
      <p className='font-black text-gray-900 text-2xl md:text-3xl'>
        {primaryText}
      </p>
      <p className='font-medium text-green-600 text-sm'>{secondaryText}</p>
    </div>
  );

  const getSwitchButtonClasses = (isActive) =>
    `px-4 py-1.5 text-sm font-semibold transition-colors duration-150 ease-in-out border rounded-md ${
      isActive
        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
        : "bg-transparent text-gray-600 border-gray-300 hover:border-blue-500 hover:text-blue-600"
    }`;

  // 🧭 Detect if user is in /dashboard/lock
  const isLockPage = location.pathname === "/dashboard/lock";

  return (
    <div className='flex flex-col flex-1 bg-gray-50 h-[88vh] overflow-y-scroll text-gray-900'>
      <div className='space-y-8 mx-auto p-4 md:p-8 w-full max-w-7xl'>
        {/* ✅ If /dashboard/lock → show nested route content */}
        {isLockPage ? (
          <Outlet />
        ) : (
          <>
            {/* Dashboard info section (Stat Cards) */}
            <section className='gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
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

            {/* Your Locks section title */}
            <h2 className='pt-4 font-bold text-gray-800 text-xl'>Your Locks</h2>

            <Modal />

            {/* Lock section */}
            <section className='space-y-4'>
              {/* Header Bar */}
              <div className='flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4'>
                {/* Lock Type Switch */}
                <div className='flex space-x-2'>
                  <button
                    className={getSwitchButtonClasses(!switchLock)}
                    disabled={!switchLock}
                    id='tokenLock'
                    onClick={handleSwitch}
                  >
                    Token Locks
                  </button>
                  <button
                    className={getSwitchButtonClasses(switchLock)}
                    disabled={switchLock}
                    id='nftLock'
                    onClick={handleSwitch}
                  >
                    NFT Locks
                  </button>
                </div>

                {/* Filter + Create */}
                <div className='flex items-center space-x-4'>
                  {/* Status Filter */}
                  <div className='relative'>
                    <button
                      className='flex justify-between items-center bg-white shadow-sm px-3 py-1.5 border border-gray-300 hover:border-blue-500 rounded-md text-gray-600 hover:text-blue-600 text-sm transition-colors'
                      onClick={() => setStatus(!status)}
                    >
                      All Statuses{" "}
                      <span className='ml-2'>
                        {status ? (
                          <ChevronUp size={16} className='text-gray-500' />
                        ) : (
                          <ChevronDown size={16} className='text-gray-500' />
                        )}
                      </span>
                    </button>
                    {status && (
                      <div className='right-0 z-10 absolute bg-white shadow-lg mt-2 border border-gray-200 rounded-lg w-40'>
                        <p className='hover:bg-gray-100 px-4 py-2 text-gray-800 text-sm cursor-pointer'>
                          All
                        </p>
                        <p className='hover:bg-gray-100 px-4 py-2 text-gray-800 text-sm cursor-pointer'>
                          Locked
                        </p>
                        <p className='hover:bg-gray-100 px-4 py-2 text-gray-800 text-sm cursor-pointer'>
                          Withdraw
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Create New Lock */}
                  <Link
                    to='/dashboard/lock'
                    className='flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 shadow-md px-3 py-1.5 rounded-md font-medium text-white text-sm transition-colors duration-200'
                  >
                    <Plus size={16} />
                    <span>Create New Lock</span>
                  </Link>
                </div>
              </div>

              {/* Token/NFT Lock List */}
              <div className='bg-white shadow-lg p-4 border border-gray-200 rounded-xl'>
                {!switchLock ? <TokenLock /> : <NftLock />}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
