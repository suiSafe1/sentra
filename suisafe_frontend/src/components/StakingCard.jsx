import React from "react";
import { useModalStore } from "../store/useModalStore";
import sui_logo from "../assets/sui.png";
import wal_logo from "../assets/wal.png";
import deep_logo from "../assets/deep.png";
import usdc_logo from "../assets/usdc.png";
import scal_logo from "../assets/scal.png";

// Token icon mapping
const TOKEN_ICONS = {
  SUI: sui_logo,
  WAL: wal_logo,
  DEEP: deep_logo,
  USDC: usdc_logo,
  SCA: scal_logo,
};

// Reusable SVG for the arrow icon
const arrowIcon = (
  <svg
    width="13"
    height="13"
    viewBox="0 0 13 13"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block"
  >
    <path
      d="M9.92722 3.17676V8.33899C9.92722 8.44431 9.88539 8.54531 9.81092 8.61978C9.73645 8.69425 9.63544 8.73608 9.53013 8.73608C9.42481 8.73608 9.32381 8.69425 9.24934 8.61978C9.17487 8.54531 9.13303 8.44431 9.13303 8.33899V4.13525L3.45756 9.81122C3.38305 9.88573 3.28199 9.92759 3.17661 9.92759C3.07124 9.92759 2.97018 9.88573 2.89567 9.81122C2.82116 9.73671 2.7793 9.63565 2.7793 9.53027C2.7793 9.4249 2.82116 9.32384 2.89567 9.24933L8.57164 3.57385H4.3679C4.26258 3.57385 4.16158 3.53202 4.08711 3.45755C4.01264 3.38308 3.9708 3.28207 3.9708 3.17676C3.9708 3.07144 4.01264 2.97044 4.08711 2.89597C4.16158 2.8215 4.26258 2.77966 4.3679 2.77966H9.53013C9.63544 2.77966 9.73645 2.8215 9.81092 2.89597C9.88539 2.97044 9.92722 3.07144 9.92722 3.17676Z"
      fill="currentColor"
    />
  </svg>
);

// Placeholder for Icons
const Icons = {
  calendar: (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  clock: (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  trending: (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  sui: (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5H12v-3.5c2.49 0 4.5 2.01 4.5 4.5S14.49 16.5 12 16.5z" />
    </svg>
  ),
};

// Component that displays the status badge
export const StatusPill = ({ isExpired }) => {
  const statusColor = isExpired
    ? "bg-[#EFECEC] text-[#505A6B]"
    : "bg-[#CEFFD4] ring-[#3C7E44]";
  const statusLabel = isExpired ? "Expired" : "Active";

  return (
    <span
      className={`px-2 rounded-2xl ring-2 w-fit h-fit text-xs py ${statusColor}`}
    >
      {statusLabel}
    </span>
  );
};

// WithdrawButton component
export const WithdrawButton = ({ isExpired, isWithdrawing, withdrawLock }) => {
  return (
    <div className="flex flex-col items-start gap-1">
      <button
        className={`${
          isExpired
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border border-yellow-400"
        } px-4 py-2 rounded-lg focus:outline-none font-medium text-sm disabled:opacity-60`}
        onClick={(e) => {
          e.stopPropagation();
          withdrawLock();
        }}
        disabled={isWithdrawing}
      >
        {isWithdrawing ? "Withdrawing..." : "Withdraw"}
      </button>

      {!isExpired && (
        <p className="mx-auto font-medium text-black/70 text-xs">
          Penalty applies.
        </p>
      )}
    </div>
  );
};

export function StakingCard({
  yieldLockId,
  icon,
  tokenName,
  tokenAmount,
  startDate,
  endDate,
  timeLeft,
  yieldEarned,
  yieldEarnedUsd,
  principalUsd,
  apy,
  isExpired,
  isLocked = true,
  memo,
  percentElapsed,
  withdrawLock,
  isWithdrawing,
}) {
  const { openModal } = useModalStore();
  const timeRemainingDays = `${timeLeft} days left`;

  // Get the correct token icon based on tokenName
  const tokenIcon = TOKEN_ICONS[tokenName] || sui_logo;

  // Use memo as description, fallback to default
  const lockDescription = memo || "No description";

  return (
    <div
      className="flex md:flex-nowrap justify-between items-center gap-8 bg-white shadow-md hover:shadow-xl mb-3 p-4 border-2 border-blue-700/50 rounded-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer transform"
      onClick={() =>
        openModal("VIEW_LOCK", {
          yieldLockId,
          tokenName,
          tokenAmount,
          startDate,
          endDate,
          timeLeft,
          yieldEarned,
          yieldEarnedUsd,
          principalUsd,
          apy,
          isExpired,
          memo,
          percentElapsed,
          isLocked,
          tokenIcon: tokenIcon,
          withdrawLock: withdrawLock,
          isWithdrawing: isWithdrawing,
        })
      }
    >
      {/* 1. Token Info Block */}
      <div className="flex flex-2 items-center space-x-3 gap">
        <img src={tokenIcon} alt={`${tokenName} Logo`} className="h-8" />
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-blue-900 text-base truncate">{tokenName}</h3>
            <StatusPill isExpired={isExpired} />
          </div>
          <h3 className="text-black/60 text-sm truncate">{lockDescription}</h3>
          <p className="text-gray-500 text-sm truncate">
            {tokenAmount} tokens
            <span className="ml-2 text-gray-400">(${principalUsd})</span>
          </p>
        </div>
      </div>

      {/* Withdraw Button Block */}
      <div>
        <WithdrawButton
          isExpired={isExpired}
          isWithdrawing={isWithdrawing}
          withdrawLock={withdrawLock}
        />
      </div>

      {/* Yield Display */}
      <div className="flex flex-col flex-1 items-end gap-1">
        <p className="flex items-center space-x-1 mb-1 w-fit text-gray-500 text-xs">
          <span className="w-3 h-3 text-gray-400">{Icons.trending}</span>
          <span>Yield Earned</span>
        </p>
        <p className="w-fit font-semibold text-green-700 text-base">
          {yieldEarned}{" "}
          <span className="font-medium text-gray-700 text-sm">{tokenName}</span>
        </p>
        <p className="text-gray-500 text-xs">${yieldEarnedUsd}</p>
        <p className="text-blue-600 text-xs font-medium">{apy}% APY</p>
        <div className="flex items-center gap-1 px-2 py-1 rounded-sm ring ring-blue-600 w-fit h-fit text-sm">
          <span>View</span>
          {arrowIcon}
        </div>
      </div>
    </div>
  );
}
