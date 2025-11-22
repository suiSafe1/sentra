// src/components/Modal.jsx
import React, { useState } from "react";
import { useModalStore } from "../store/useModalStore";
import sui_logo from "../assets/sui_logo.png";
import { StatusPill, WithdrawButton } from "./StakingCard";

/* -------------------------------------------------------------------------- */
/* Top Up Inner Modal                                                         */
/* -------------------------------------------------------------------------- */
const TopUpLockModal = () => {
  const { modalData, closeModal } = useModalStore();
  const {
    tokenName = "SUI",
    tokenAmount = "0",
    tokenIcon = sui_logo,
  } = modalData || {};
  const [amountToAdd, setAmountToAdd] = useState("");

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmountToAdd(value);
    }
  };

  const newTotal = parseFloat(tokenAmount) + (parseFloat(amountToAdd) || 0);
  const shouldShowNewTotal = parseFloat(amountToAdd) > 0;

  const CurrentLockDetail = ({ label, value }) => (
    <div className='flex flex-col items-start'>
      <span className='mb-1 text-gray-500 text-sm'>{label}</span>
      <span className='font-medium text-base'>{value}</span>
    </div>
  );

  const NewTotalDisplay = () => (
    <div className='bg-blue-50 p-4 border border-blue-200 rounded-xl'>
      <div className='flex justify-between items-center'>
        <div className='flex flex-col'>
          <span className='mb-1 text-gray-600 text-sm'>New Total</span>
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
          <CurrentLockDetail label='Token' value={tokenName} />
          <CurrentLockDetail label='Duration' value='6 months' />
          <CurrentLockDetail
            label='Current Amount'
            value={parseFloat(tokenAmount).toLocaleString("en-US")}
          />
        </div>
        <div className='flex items-center'>
          <span className='mr-2 text-gray-500 text-sm'>Yield (APY)</span>
          <span className='font-bold text-green-600 text-lg'>12.5%</span>
        </div>
      </div>

      {/* Form */}
      <div className='space-y-6'>
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
              value={tokenName}
              className='block bg-white shadow-sm px-3 py-2 border border-gray-300 focus:border-blue-500 rounded-lg focus:outline-none w-full appearance-none'
            >
              <option value='SUI'>SUI</option>
            </select>
            <div className='right-0 absolute inset-y-0 flex items-center px-2 text-gray-700 pointer-events-none'>
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
              type='text'
              placeholder='0.00'
              value={amountToAdd}
              onChange={handleAmountChange}
              className='p-1 focus:outline-none w-full text-lg'
            />
            <button className='px-2 font-semibold text-blue-600 hover:text-blue-700 text-sm'>
              MAX
            </button>
          </div>
        </div>

        {shouldShowNewTotal && <NewTotalDisplay />}
      </div>

      {/* Buttons */}
      <div className='flex gap-3 mt-8'>
        <button
          onClick={closeModal}
          className='flex-1 hover:bg-gray-100 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700'
        >
          Cancel
        </button>
        <button
          disabled={!shouldShowNewTotal}
          className='flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-semibold text-white'
        >
          Confirm Top Up
        </button>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Outer Modal                                                               */
/* -------------------------------------------------------------------------- */
const Modal = () => {
  const { isOpen, view, modalData, closeModal, goToInner } = useModalStore();

  if (!isOpen) return null;

  const {
    tokenName = "SUI",
    tokenAmount = "0",
    tokenIcon = sui_logo,
    startDate = "N/A",
    endDate = "N/A",
    timeLeft = 0,
    isExpired: modalIsExpired,
    withdrawLock,
    isWithdrawing,
  } = modalData || {};

  const isExpired = modalIsExpired ?? false;
  const amount = parseFloat(tokenAmount) || 0;
  const timeRemaining = timeLeft ? `${timeLeft} days` : "0 days";
  const apy = "12.5%";

  // ---------------------- ACTION BUTTONS ----------------------
  const ActionButtons = () => {
    // Only render WithdrawButton if withdrawLock exists
    if (isExpired) {
      return (
        <div className='flex gap-4'>
          <WithdrawButton
            className='ring-2 w-full'
            isExpired={isExpired}
            isWithdrawing={isWithdrawing}
            withdrawLock={withdrawLock}
          />
        </div>
      );
    }

    // Default Top Up + Locked buttons
    return (
      <div className='gap-4 grid grid-cols-2'>
        <button
          onClick={goToInner}
          className='bg-blue-800 hover:bg-blue-900 py-3 rounded-xl font-semibold text-white'
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
    );
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
              className='text-gray-400 hover:text-gray-600'
            >
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

          {/* Token Info */}
          <div className='flex justify-between items-center mb-6'>
            <div className='flex items-center space-x-2'>
              <img src={tokenIcon} alt='Token logo' className='w-8 h-8' />
              <div>
                <p className='font-medium text-gray-900 text-lg'>{tokenName}</p>
                <p className='text-gray-500 text-sm'>
                  {amount.toLocaleString()} tokens
                </p>
              </div>
            </div>
            <StatusPill isExpired={isExpired} />
          </div>

          {/* Details */}
          <div className='gap-4 grid grid-cols-2 mb-8'>
            <div className='bg-gray-50 p-4 border rounded-lg'>
              <p className='text-gray-500 text-sm'>Lock Period</p>
              <p className='font-medium text-gray-800'>{startDate}</p>
              <p className='font-medium text-gray-800'>to {endDate}</p>
            </div>

            <div className='bg-gray-50 p-4 border rounded-lg'>
              <p className='text-gray-500 text-sm'>Time Remaining</p>
              <p className='font-bold text-gray-900 text-xl'>{timeRemaining}</p>
            </div>

            <div className='bg-gray-50 p-4 border rounded-lg'>
              <p className='mb-1 text-gray-500 text-sm'>APY</p>
              <p className='font-bold text-blue-600 text-xl'>{apy}</p>
            </div>

            <div className='bg-gray-50 p-4 border rounded-lg'>
              <p className='text-gray-500 text-sm'>Additional Description</p>
            </div>
          </div>

          <ActionButtons />
        </div>
      )}

      {view === "inner" && <TopUpLockModal />}
    </div>
  );
};

export default Modal;
