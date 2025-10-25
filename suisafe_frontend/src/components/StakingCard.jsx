import React from "react";
import { useModalStore } from "../store/useModalStore";
import sui_logo from "../assets/sui_logo.png";



// Placeholder for Icons (replace with actual SVGs or a proper Icon component)
const Icons = {
  // Icons are rendered in a light blue color to match the image's aesthetic
  calendar: (
    <svg
      width='1em'
      height='1em'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <rect x='3' y='4' width='18' height='18' rx='2' ry='2' />
      <line x1='16' y1='2' x2='16' y2='6' />
      <line x1='8' y1='2' x2='8' y2='6' />
      <line x1='3' y1='10' x2='21' y2='10' />
    </svg>
  ),
  clock: (
    <svg
      width='1em'
      height='1em'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <circle cx='12' cy='12' r='10' />
      <polyline points='12 6 12 12 16 14' />
    </svg>
  ),
  trending: (
    <svg
      width='1em'
      height='1em'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <polyline points='23 6 13.5 15.5 8.5 10.5 1 18' />
      <polyline points='17 6 23 6 23 12' />
    </svg>
  ),
  sui: (
    <svg
      width='1em'
      height='1em'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5H12v-3.5c2.49 0 4.5 2.01 4.5 4.5S14.49 16.5 12 16.5z' />
    </svg>
  ),
};

// Component that displays the status badge
const StatusPill = ({ isExpired }) => {
  const statusColor = isExpired
    ? "bg-red-100 text-red-700"
    : "bg-green-200 text-green-700";
  const statusLabel = isExpired ? "Expired" : "Active";

  return (
    <span
      className={`px-3 hidden sm:block py-1 text-xs font-semibold rounded-full text-center ${statusColor}`}
    >
      {statusLabel}
    </span>
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
  isExpired,
  isLocked = true,
  memo,
  percentElapsed,
  withdrawLock,
  isWithdrawing,
}) {
    const { toggleModal } = useModalStore();
  const timeRemainingDays = `${timeLeft} days left`;

  // Logic to determine button state and content
  const actionButton = isLocked ? (
    <button
      className='bg-white disabled:opacity-80 px-4 py-2 border border-blue-600 rounded-lg focus:outline-none h-10 font-medium text-blue-600 text-sm'
      disabled={!isExpired || isWithdrawing}
      onClick={() => isExpired && withdrawLock()} // Only allow click if expired
    >
      {isExpired ? (isWithdrawing ? "Withdrawing..." : "Withdraw") : "Locked"}
    </button>
  ) : (
    <button
      className='bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 border border-blue-600 rounded-lg focus:outline-none h-10 font-medium text-white text-sm'
      onClick={() => withdrawLock()}
      disabled={isWithdrawing || !isExpired}
    >
      {isWithdrawing ? "Withdrawing..." : "Withdraw"}
    </button>
  );

  return (
    // Main Card Container: Uses Flexbox for responsiveness
    // Mobile (<md): flex-wrap allows elements to stack/wrap with defined mobile widths.
    // Desktop (>=md): md:flex-nowrap sets the 5-column horizontal layout using md:w-*
    <div
      className='flex md:flex-nowrap justify-between items-center gap-8 bg-white shadow-lg mb-3 p-4 border-2 border-blue-700/50 rounded-xl'
      onClick={toggleModal}
    >
      {/* 1. Token Info Block (SUI, 1,000 tokens) */}
      <div className='flex items-center space-x-3 gap'>
        <img src={sui_logo} alt="Sui Logo" className="h-8"/>
        <div className='flex flex-col min-w-0'>
          <h3 className='font-semibold text-blue-900 text-base truncate'>
            {tokenName}
          </h3>
          <p className='text-gray-500 text-sm truncate'>{tokenAmount} tokens</p>
          {memo && (
            <p className='mt-1 text-gray-500 text-xs truncate italic'>
              "{memo}"
            </p>
          )}
        </div>
      </div>

      {/* 2. Duration Block (Dates) */}
      <div className=''>
        <p className='flex items-center space-x-1 mb-1 text-gray-500 text-xs'>
          <span className='w-3 h-3 text-gray-400'>{Icons.calendar}</span>
          <span className='hidden sm:inline'>Duration</span>
        </p>
        {/* Dates use YYYY-MM-DD from the useSuiLocks hook */}
        <p className='font-semibold text-blue-800 text-sm leading-tight'>
          {startDate}
        </p>
        <p className='font-normal text-gray-500 text-xs'>to {endDate}</p>
      </div>

      {/* 3. Time Remaining & Progress Block - HIDDEN ON MOBILE */}
      <div className='hidden lg:flex flex-col flex-shrink-0 justify-center md:w-1/5'>
        <p className='flex items-center space-x-1 mb-1 text-gray-500 text-xs'>
          <span className='w-3 h-3 text-gray-400'>{Icons.clock}</span>
          <span>Time Remaining</span>
        </p>

        {/* Progress Bar */}
        <div className='flex-grow bg-gray-200 rounded-full h-1.5 overflow-hidden'>
          <div
            className={`h-full ${isExpired ? "bg-red-500" : "bg-blue-700"}`}
            style={{ width: `${isExpired ? 100 : percentElapsed}%` }}
          />
        </div>

        {/* Days left text */}
        <p className='mt-1 text-gray-500 text-xs'>
          {isExpired ? "Expired" : timeRemainingDays}
        </p>
      </div>

      {/* 4. Yield Earned Block - HIDDEN ON MOBILE */}
      <div className='hidden md:block'>
        <p className='flex items-center space-x-1 mb-1 text-gray-500 text-xs'>
          <span className='w-3 h-3 text-gray-400'>{Icons.trending}</span>
          <span>Yield Earned</span>
        </p>
        <p className='font-semibold text-green-700 text-base'>
          {yieldEarned}{" "}
          <span className='font-medium text-gray-700 text-sm'>SUI</span>
        </p>
      </div>

      {/* 5. Status Pill & Action Button Block - Takes remaining space on mobile, 20% on desktop */}
      <div className='flex flex-col md:items-end space-y-2 ml-auto md:ml-0'>
        <div className='md:hidden'>
          {/* Status on mobile: takes up space next to Duration */}
          <StatusPill isExpired={isExpired} />
        </div>
        <div className='hidden md:block'>
          {/* Status on desktop: ensures pill alignment with button */}
          <StatusPill isExpired={isExpired} />
        </div>

        {/* Action Button */}
      </div>
      <div>{actionButton}</div>
    </div>
  );
}
