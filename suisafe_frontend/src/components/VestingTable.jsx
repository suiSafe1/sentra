// VestingTable.jsx
import React from "react";
import sui_logo from "../assets/sui_logo.png";

const VestingRow = ({
  token,
  totalAmount,
  startDate,
  duration,
  claimAmount,
}) => {
  const isClaimable = claimAmount > 0;

  return (
    <div className='flex flex-nowrap justify-between items-center gap-6 hover:bg-gray-100 px-4 py-4 border-gray-300 border-b text-black text-sm transition-colors'>
      {/* Token */}
      <div className='flex flex-shrink-0 items-center space-x-2 min-w-[120px]'>
        <img src={sui_logo} alt='SUI Logo' className='h-8' />
        <div className='flex flex-col'>
          <span className='font-semibold text-black'>{token}</span>
          <span className='text-black text-xs'>{token}</span>
        </div>
      </div>

      {/* Total Amount */}
      <div className='flex-shrink-0 min-w-[100px] text-black'>
        {totalAmount}
      </div>

      {/* Start Date */}
      <div className='flex-shrink-0 min-w-[120px] text-black'>{startDate}</div>

      {/* Cliff/Duration */}
      <div className='flex-shrink-0 min-w-[100px] text-black'>{duration}</div>

      {/* Available to Claim */}
      <div
        className={`font-bold min-w-[140px] flex-shrink-0 ${
          isClaimable ? "text-green-700" : "text-black"
        }`}
      >
        {claimAmount.toLocaleString()}{" "}
        <span className='font-normal text-black text-xs'>SUI</span>
      </div>

      {/* Status */}
      <div className='flex-shrink-0 min-w-[100px]'>
        <div className='bg-green-200 px-2 py-1 border-2 border-green-500 rounded-full w-fit font-semibold text-xs'>
          Active
        </div>
      </div>

      {/* Actions */}
      <div className='flex flex-shrink-0 space-x-2 min-w-[160px]'>
        <button
          className='bg-[#00076C] hover:bg-blue-800 disabled:opacity-50 px-3 py-1 rounded-md font-semibold text-white text-sm transition-colors'
          disabled={!isClaimable}
        >
          Claim
        </button>
        <button className='bg-white hover:bg-gray-100 px-3 py-1 border rounded-md font-semibold text-black text-sm transition-colors'>
          Cancel
        </button>
      </div>
    </div>
  );
};

export const VestingTable = () => {
  const data = [
    {
      token: "SUI",
      totalAmount: "10,000 SUI",
      startDate: "Jan 15, 2025",
      duration: "3M / 12M",
      claimAmount: 2500,
    },
    {
      token: "SUI",
      totalAmount: "5,000 SUI",
      startDate: "Feb 1, 2025",
      duration: "1M / 6M",
      claimAmount: 0,
    },
  ];

  return (
    <div className='bg-white shadow-lg rounded-xl w-full text-black'>
      <h1 className='mb-8 font-semibold text-black text-xl'>
        Current Vesting Schedules
      </h1>

      {/* Scrollable Wrapper */}
      <div className='overflow-x-auto'>
        {/* Header */}
        <div className='flex flex-nowrap justify-between items-center gap-6 px-4 py-3 border-gray-300 border-b min-w-max font-medium text-black text-xs uppercase'>
          <div className='min-w-[120px]'>Token</div>
          <div className='min-w-[100px]'>Total Amount</div>
          <div className='min-w-[120px]'>Start Date</div>
          <div className='min-w-[100px]'>Cliff/Duration</div>
          <div className='min-w-[140px]'>Available to Claim</div>
          <div className='min-w-[100px]'>Status</div>
          <div className='min-w-[160px]'>Actions</div>
        </div>

        {/* Rows */}
        {data.map((row, index) => (
          <VestingRow key={index} {...row} />
        ))}
      </div>
    </div>
  );
};
