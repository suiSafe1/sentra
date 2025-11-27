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
import { useGlobalAnalytics } from "../hooks/useGlobalAnalytics";

export default function TVL() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTokens, setShowTokens] = useState(true);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { mutate: connect } = useConnectWallet();
  const account = useCurrentAccount();
  const location = useLocation();

  // Fetch global analytics data
  const {
    totalTVL,
    supportedAssets,
    topPerformingAssets,
    isLoading: analyticsLoading,
    apys,
    tvlByToken,
    prices,
  } = useGlobalAnalytics();

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

  // Token configuration with real data
  const tokenIcons = {
    SUI: sui,
    WAL: wal,
    USDC: usdc,
    DEEP: deep,
    SCA: scal,
  };

  // Build tokens array from real data
  const tokens = Object.entries(tvlByToken || {}).map(([symbol, data]) => {
    const price = prices[symbol] || 0;
    const tokenAmount = price > 0 ? data.total / price : 0;

    return {
      tokenName: symbol,
      status: data.count > 0 ? "Available" : "Available",
      amount: tokenAmount.toFixed(2),
      usdValue: data.total.toFixed(2),
      apy: apys[symbol] || 0,
      icon: tokenIcons[symbol] || sui,
      tvl: data.total,
      count: data.count,
    };
  });

  const filteredTokens = tokens.filter((t) =>
    t.tokenName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topAsset =
    topPerformingAssets && topPerformingAssets.length > 0
      ? topPerformingAssets[0]
      : null;

  const formatTVL = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    } else if (value >= 1) {
      return `$${value.toFixed(2)}`;
    } else {
      return `$${value.toFixed(4)}`;
    }
  };

  return (
    <div className="flex bg-gray-50 h-[90vh]">
      {/* Overlay for mobile */}
      {menuOpen && (
        <div
          className="md:hidden z-40 fixed inset-0 bg-black/40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-y-scroll">
        {isLockPage ? (
          // ✅ Only show nested lock page when at /tvl/lock
          <Outlet />
        ) : (
          <>
            {/* Page Content */}
            <main className="p-4 md:p-8">
              <div className="gap-6 grid grid-cols-1 sm:grid-cols-3">
                {/* Total Value Locked Card */}
                <div className="flex flex-col gap-4 bg-white shadow-md p-6 rounded-xl text-center">
                  <p className="text-gray-500">TVL</p>
                  {analyticsLoading ? (
                    <div className="font-black text-blue-900 text-3xl animate-pulse">
                      Loading...
                    </div>
                  ) : (
                    <p className="font-black text-blue-900 text-3xl">
                      {formatTVL(totalTVL)}
                    </p>
                  )}
                  <p className="text-gray-400">Total Value Locked</p>
                </div>

                {/* Total Assets Card */}
                <div className="flex flex-col gap-4 bg-white shadow-md p-6 rounded-xl text-center">
                  <p className="text-gray-500">Total Assets</p>
                  {analyticsLoading ? (
                    <div className="font-black text-blue-900 text-3xl animate-pulse">
                      ...
                    </div>
                  ) : (
                    <p className="font-black text-blue-900 text-3xl">
                      {supportedAssets}
                    </p>
                  )}
                  <p className="text-gray-400">Supported Tokens</p>
                </div>

                {/* Highest Performing Asset Card */}
                <div className="flex flex-col items-center gap-4 bg-white shadow-md p-6 rounded-xl text-center">
                  <p className="text-gray-500">Highest Performing Asset</p>
                  {analyticsLoading ? (
                    <div className="w-14 h-14 bg-gray-200 rounded-full animate-pulse" />
                  ) : topAsset ? (
                    <>
                      <img
                        src={tokenIcons[topAsset.symbol] || sui}
                        alt={`${topAsset.symbol} icon`}
                        className="w-14 h-14"
                      />
                      <div className="text-sm text-gray-600">
                        {topAsset.symbol} - {topAsset.apy.toFixed(1)}% APY
                      </div>
                    </>
                  ) : (
                    <img src={sui} alt="sui icon" className="w-14 h-14" />
                  )}
                </div>
              </div>
            </main>

            {/* Tokens / NFTs Section */}
            <div className="bg-white mx-6 p-6">
              {/* Header Row */}
              <div className="flex justify-around items-center mb-2 pb-2 font-semibold text-blue-900 text-sm">
                <span className="w-32">TOKEN</span>
                <span className="w-24 text-center">APY</span>
                <span className="w-24 text-right">TVL</span>
              </div>

              <div>
                {analyticsLoading ? (
                  <div className="flex justify-center items-center bg-white shadow-md p-6 rounded-xl font-medium text-gray-500">
                    Loading tokens...
                  </div>
                ) : showTokens ? (
                  filteredTokens.length > 0 ? (
                    filteredTokens.map((t) => (
                      <Link key={t.tokenName} to="/tvl/lock">
                        <SuiItem
                          tokenName={t.tokenName}
                          tokenIcon={t.icon}
                          status={t.status}
                          amount={t.amount}
                          usdValue={t.usdValue}
                          apy={t.apy}
                          count={t.count}
                        />
                      </Link>
                    ))
                  ) : (
                    <div className="flex justify-center items-center bg-white shadow-md p-6 rounded-xl font-medium text-gray-500">
                      No tokens found.
                    </div>
                  )
                ) : (
                  <p className="text-gray-500">NFTs content goes here.</p>
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
const SuiItem = ({
  tokenName,
  tokenIcon,
  status,
  amount,
  usdValue,
  apy,
  count,
}) => {
  const statusColors = {
    Available: "bg-green-100 text-green-700 border-green-700 border-2",
    Locked: "bg-yellow-100 text-yellow-700 border-yellow-700 border-2",
    Staked: "bg-purple-100 text-purple-700 border-purple-700 border-2",
  };

  return (
    <div className="flex justify-between items-center bg-white m-2 p-4 border-2 border-black/10 rounded-xl hover:border-blue-300 transition-colors">
      <div className="flex items-center space-x-2 w-32">
        {tokenIcon && (
          <img src={tokenIcon} alt={`${tokenName} icon`} className="h-14" />
        )}
        <div className="flex flex-col">
          <span className="font-medium text-gray-700">{tokenName}</span>
          <span className="text-xs text-gray-400">{count} locks</span>
        </div>
      </div>
      <p className="font-bold text-blue-900 w-24 text-center">
        {apy ? `${apy.toFixed(1)}%` : "N/A"}
      </p>
      <div className="space-y-1 w-24 text-right">
        <div className="font-bold text-blue-900">
          {amount} {tokenName}
        </div>
        <div className="text-gray-500 text-sm">${usdValue}</div>
      </div>
    </div>
  );
};
