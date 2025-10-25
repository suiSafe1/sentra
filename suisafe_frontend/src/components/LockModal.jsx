import React, { useState } from "react"; // 1. Import useState
import { useModalStore } from "../store/useModalStore";
import sui_logo from "../assets/sui_logo.png";

const TopUpLockModal = ({ closeModal, goToMain }) => {
  // 2. State for the amount to add
  const [amountToAdd, setAmountToAdd] = useState("");
  // Assuming the Current Amount is a hardcoded value for calculation
  const currentAmount = 1000;

  const handleAmountChange = (e) => {
    // Basic validation to only allow numbers and an empty string
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmountToAdd(value);
    }
  };

  // 3. Calculate New Total
  const newTotal = currentAmount + (parseFloat(amountToAdd) || 0);

  // 4. Determine if the New Total div should be shown
  const shouldShowNewTotal = parseFloat(amountToAdd) > 0;

  const CurrentLockDetail = ({ label, value }) => (
    <div className='flex flex-col items-start'>
      <span className='mb-1 text-gray-500 text-sm'>{label}</span>
      <span className='font-medium text-base'>{value}</span>
    </div>
  );

  // 5. Component for the New Total display
  const NewTotalDisplay = () => (
    <div className='bg-blue-50 p-4 border border-blue-200 rounded-xl transition-all duration-300 ease-in-out'>
      <div className='flex justify-between items-center'>
        <div className='flex flex-col'>
          <span className='mb-1 text-gray-600 text-sm'>New Total</span>
          {/* Use toLocaleString for number formatting */}
          <span className='font-bold text-blue-600 text-xl'>
            {newTotal.toLocaleString("en-US", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}{" "}
            SUI
          </span>
        </div>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='w-6 h-6 text-blue-600'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
          strokeWidth={2}
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M17 8l4 4m0 0l-4 4m4-4H3'
          />
        </svg>
      </div>
    </div>
  );

  return (
    <div className='relative bg-white shadow-xl mx-4 p-6 rounded-xl w-full max-w-md'>
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <h2 className='font-semibold text-xl'>Top Up Lock</h2>
        <button
          onClick={closeModal}
          className='text-gray-400 hover:text-gray-600'
        >
          {/* ... Close SVG ... */}
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='w-6 h-6'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </button>
      </div>

      {/* Current Lock Details */}
      <div className='bg-gray-50 mb-6 p-4 border border-gray-200 rounded-lg'>
        <h3 className='mb-4 font-medium text-gray-600'>Current Lock</h3>
        <div className='gap-4 grid grid-cols-3 mb-4'>
          <CurrentLockDetail label='Token' value='SUI' />
          <CurrentLockDetail label='Duration' value='6 months' />
          {/* Updated Current Amount value to use currentAmount variable for clarity */}
          <CurrentLockDetail
            label='Current Amount'
            value={currentAmount.toLocaleString("en-US")}
          />
        </div>
        <div className='flex items-center'>
          <span className='mr-2 text-gray-500 text-sm'>Yield (APY)</span>
          <span className='font-bold text-green-600 text-lg'>12.5%</span>
        </div>
      </div>

      {/* Form */}
      <div className='space-y-6'>
        {/* Select Token (unchanged) */}
        <div>
          <label
            htmlFor='token-select'
            className='block mb-2 font-medium text-gray-700 text-sm'
          >
            Select Token
          </label>
          <div className='relative'>
            <select
              id='token-select'
              value='SUI'
              className='block bg-white shadow-sm px-3 py-2 border border-gray-300 focus:border-blue-500 rounded-lg focus:outline-none focus:ring-blue-500 w-full appearance-none'
            >
              <option value='SUI'>SUI</option>
            </select>
            <div className='right-0 absolute inset-y-0 flex items-center px-2 text-gray-700 pointer-events-none'>
              {/* ... Dropdown SVG ... */}
              <svg
                className='fill-current w-4 h-4'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 20 20'
              >
                <path d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z' />
              </svg>
            </div>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <div className='flex justify-between items-center mb-2'>
            <label
              htmlFor='amount-input'
              className='block font-medium text-gray-700 text-sm'
            >
              Amount to Add
            </label>
            <span className='text-gray-500 text-sm'>Available: 5,000 SUI</span>
          </div>
          <div className='flex items-center p-2 border border-gray-300 focus-within:border-blue-500 rounded-lg'>
            <input
              id='amount-input'
              type='text' // Change to 'text' to better handle intermediate number inputs
              placeholder='0.00'
              value={amountToAdd} // 6. Bind value to state
              onChange={handleAmountChange} // 7. Add change handler
              className='p-1 focus:outline-none w-full text-lg'
            />
            <button className='px-2 font-semibold text-blue-600 hover:text-blue-700 text-sm'>
              MAX
            </button>
          </div>
        </div>

        {/* 8. Conditionally Render New Total Display */}
        {shouldShowNewTotal && <NewTotalDisplay />}
      </div>

      {/* Buttons */}
      <div className='flex gap-3 mt-8'>
        <button
          onClick={closeModal}
          className='flex-1 hover:bg-gray-100 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 transition'
        >
          Cancel
        </button>
        <button
          onClick={goToMain}
          className='flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-semibold text-white transition'
          disabled={!shouldShowNewTotal} // Optional: Disable button if no amount is entered
        >
          Confirm Top Up
        </button>
      </div>
    </div>
  );
};

const Modal = () => {
  const { isOpen, view, closeModal, goToInner, goToMain } = useModalStore();

  if (!isOpen) return null;

  const lockData = {
    token: "SUI",
    amount: 1000,
    lockPeriodStart: "2025-06-16",
    lockPeriodEnd: "2025-12-15",
    apy: "12.5%",
    timeRemaining: "127 days left",
    status: "Active",
    tokenIcon: sui_logo,
  };

  return (
    <div className='z-50 fixed inset-0 flex justify-center items-center bg-black/50'>
      {view === "main" && (
        <div className='relative bg-white shadow-xl mx-4 p-6 rounded-2xl w-full max-w-sm'>
          {/* Header */}
          <div className='flex justify-between items-center mb-6'>
            <h1 className='font-semibold text-gray-900 text-xl'>
              Lock Details
            </h1>
            <button
              onClick={closeModal}
              className='text-gray-400 hover:text-gray-600 transition'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='w-6 h-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth={2}
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>

          {/* Token Info */}
          <div className='flex justify-between items-center mb-6'>
            <div className='flex items-center space-x-2'>
              <img src={sui_logo} alt='The sui logo' />
              <div>
                <p className='font-medium text-gray-900 text-lg'>
                  {lockData.token}
                </p>
                <p className='text-gray-500 text-sm'>
                  {lockData.amount.toLocaleString()} tokens
                </p>
              </div>
            </div>
            <div className='bg-green-100 px-3 py-1 rounded-full font-semibold text-green-700 text-sm'>
              {lockData.status}
            </div>
          </div>

          {/* Details */}
          <div className='gap-4 grid grid-cols-2 mb-8'>
            <div className='bg-gray-50 p-4 border border-gray-100 rounded-lg'>
              <div className='flex items-center space-x-1 mb-1'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='w-4 h-4 text-gray-500'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                  />
                </svg>
                <p className='font-medium text-gray-500 text-sm'>Lock Period</p>
              </div>
              <p className='font-medium text-gray-800 text-base leading-tight'>
                {lockData.lockPeriodStart}
              </p>
              <p className='font-medium text-gray-800 text-base leading-tight'>
                to {lockData.lockPeriodEnd}
              </p>
            </div>

            <div className='bg-gray-50 p-4 border border-gray-100 rounded-lg'>
              <div className='flex items-center space-x-1 mb-1'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='w-4 h-4 text-gray-500'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
                <p className='font-medium text-gray-500 text-sm'>
                  Time Remaining
                </p>
              </div>
              <p className='font-bold text-gray-900 text-xl'>
                {lockData.timeRemaining}
              </p>
            </div>

            <div className='bg-gray-50 p-4 border border-gray-100 rounded-lg'>
              <p className='mb-1 font-medium text-gray-500 text-sm'>APY</p>
              <p className='font-bold text-blue-600 text-xl'>{lockData.apy}</p>
            </div>
          </div>

          {/* Buttons */}
          <div className='gap-4 grid grid-cols-2'>
            <button
              onClick={goToInner}
              className='bg-blue-800 hover:bg-blue-900 py-3 rounded-xl font-semibold text-white transition'
            >
              Top Up
            </button>
            <button
              disabled
              className='py-3 border border-gray-300 rounded-xl font-semibold text-gray-500 cursor-not-allowed'
            >
              Locked
            </button>
          </div>
        </div>
      )}

      {view === "inner" && (
        <TopUpLockModal closeModal={closeModal} goToMain={goToMain} />
      )}
    </div>
  );
};

export default Modal;
