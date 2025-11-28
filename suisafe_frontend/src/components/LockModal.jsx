import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useModalStore } from "../store/useModalStore";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useAddToYieldLock } from "../hooks/useAddToYieldLock";
import { useWithdrawYieldLock } from "../hooks/useWithdrawYieldLock";
import { client } from "../constants/Constants";
import { PiCheckSquareOffsetBold } from "react-icons/pi";
import ConfettiExplosion from "react-confetti-explosion";
import { useWindowSize } from "react-use";
import sui_logo from "../assets/sui.png";
import wal_logo from "../assets/wal.png";
import deep_logo from "../assets/deep.png";
import usdc_logo from "../assets/usdc.png";
import scal_logo from "../assets/scal.png";
import { StatusPill } from "./StakingCard";

const TOKEN_ICONS = {
  SUI: sui_logo,
  WAL: wal_logo,
  DEEP: deep_logo,
  USDC: usdc_logo,
  SCA: scal_logo,
};

/* -------------------------------------------------------------------------- */
/* Success Modal Component                                                    */
/* -------------------------------------------------------------------------- */
const SuccessModal = ({ isOpen, onClose, title, message, showConfetti }) => {
  const { width, height } = useWindowSize();

  if (!isOpen) return null;

  const confettiPortal = showConfetti
    ? createPortal(
        <div className="z-2000 fixed inset-0 flex justify-center items-center overflow-hidden pointer-events-none">
          <ConfettiExplosion
            force={0.8}
            duration={3000}
            particleCount={450}
            width={width > 0 ? width : 1600}
            height={height > 0 ? height : 1600}
            colors={["#00076C", "#00D1FF", "#FFD700", "#FF6B6B", "#4ECDC4"]}
          />
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <div className="z-1100 fixed inset-0 flex justify-center items-center bg-black/50 p-3 sm:p-4 font-sans">
        <div className="relative bg-white shadow-lg mx-auto p-6 sm:p-8 rounded-lg w-full max-w-[90vw] sm:max-w-md text-center">
          <div className="flex flex-col items-center">
            <div className="bg-green-100 p-2.5 sm:p-3 rounded-full">
              <PiCheckSquareOffsetBold className="text-green-600 text-4xl sm:text-5xl" />
            </div>
            <h2 className="mt-3 sm:mt-4 font-extrabold text-[#00076C] text-xl sm:text-2xl px-2">
              {title}
            </h2>
            <p className="mt-2 text-[#4D5562] text-sm sm:text-base px-2">
              {message}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="bg-[#00076C] hover:opacity-90 mt-5 sm:mt-6 py-2.5 sm:py-3 rounded-lg w-full font-semibold text-white text-base sm:text-lg transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
      {confettiPortal}
    </>
  );
};

/* -------------------------------------------------------------------------- */
/* WithdrawButton Component with Success Modal                                */
/* -------------------------------------------------------------------------- */
const WithdrawButton = ({
  className,
  isExpired,
  lockData,
  onWithdrawSuccess,
}) => {
  const { withdrawYieldLock, isWithdrawing: isWithdrawingYield } =
    useWithdrawYieldLock();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleWithdraw = async () => {
    if (!lockData) {
      console.error("Lock data not available");
      return;
    }

    try {
      const result = await withdrawYieldLock(
        lockData.yieldLockId,
        lockData.platform,
        lockData.registry,
        lockData.clock,
        lockData.coinType,
        lockData.sCoinType,
        lockData.scoinInfo
      );

      if (result) {
        setShowConfetti(true);
        setShowSuccess(true);

        setTimeout(() => setShowConfetti(false), 3000);
      }
    } catch (error) {
      console.error("❌ Withdrawal error:", error);
      alert(`Withdrawal failed: ${error.message || error}`);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    setShowConfetti(false);

    if (onWithdrawSuccess) {
      onWithdrawSuccess();
    }

    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const isProcessing = isWithdrawingYield;

  return (
    <>
      <button
        onClick={handleWithdraw}
        disabled={!isExpired || isProcessing}
        className={`font-semibold text-white py-2.5 sm:py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base ${
          isExpired ? "bg-green-600 hover:bg-green-700" : "bg-gray-400"
        } ${className}`}
      >
        {isProcessing ? "Processing..." : isExpired ? "Withdraw" : "Locked"}
      </button>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={handleSuccessClose}
        title="Withdrawal Successful!"
        message="Your funds have been unlocked and transferred to your wallet. They are now available for use."
        showConfetti={showConfetti}
      />
    </>
  );
};

/* -------------------------------------------------------------------------- */
/* Top Up Inner Modal                                                         */
/* -------------------------------------------------------------------------- */
const TopUpLockModal = () => {
  const { modalData, closeModal, goToMain } = useModalStore();
  const currentAccount = useCurrentAccount();
  const { addToYieldLock, isLoading: isAdding } = useAddToYieldLock();
  const { width, height } = useWindowSize();

  const {
    yieldLockId,
    tokenName = "SUI",
    tokenAmount = "0",
    tokenIcon,
    apy = "12.5",
    coinType,
    scoinInfo,
    decimals = 9,
  } = modalData || {};

  const [amountToAdd, setAmountToAdd] = useState("");
  const [availableBalance, setAvailableBalance] = useState("0");
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const displayIcon = tokenIcon || TOKEN_ICONS[tokenName] || sui_logo;

  React.useEffect(() => {
    const fetchBalance = async () => {
      if (!currentAccount || !coinType) return;

      setLoadingBalance(true);
      try {
        if (tokenName === "SUI") {
          const balance = await client.getBalance({
            owner: currentAccount.address,
            coinType: "0x2::sui::SUI",
          });
          const balanceInTokens = (
            Number(balance.totalBalance) / Math.pow(10, decimals)
          ).toFixed(2);
          setAvailableBalance(balanceInTokens);
        } else {
          const coins = await client.getCoins({
            owner: currentAccount.address,
            coinType: coinType,
          });

          const totalBalance = coins.data.reduce(
            (sum, coin) => sum + BigInt(coin.balance),
            BigInt(0)
          );

          const balanceInTokens = (
            Number(totalBalance) / Math.pow(10, decimals)
          ).toFixed(2);
          setAvailableBalance(balanceInTokens);
        }
      } catch (error) {
        console.error("Failed to fetch balance:", error);
        setAvailableBalance("0");
      } finally {
        setLoadingBalance(false);
      }
    };

    fetchBalance();
  }, [currentAccount, coinType, tokenName, decimals]);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmountToAdd(value);
    }
  };

  const handleMaxClick = () => {
    setAmountToAdd(availableBalance);
  };

  const handleConfirmTopUp = async () => {
    if (!currentAccount) {
      alert("Please connect your wallet");
      return;
    }

    if (!amountToAdd || parseFloat(amountToAdd) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (parseFloat(amountToAdd) > parseFloat(availableBalance)) {
      alert("Insufficient balance");
      return;
    }

    try {
      const tokenConfig = {
        tokenName,
        coinType,
        decimals,
        scoinInfo,
        userAddress: currentAccount.address,
      };

      const result = await addToYieldLock(
        yieldLockId,
        amountToAdd,
        tokenConfig
      );

      if (result.success) {
        setShowConfetti(true);
        setShowSuccess(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    } catch (error) {
      console.error("Top up failed:", error);
      alert(`Top up failed: ${error.message || error}`);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    setShowConfetti(false);
    closeModal();
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const newTotal = parseFloat(tokenAmount) + (parseFloat(amountToAdd) || 0);
  const shouldShowNewTotal = parseFloat(amountToAdd) > 0;

  const CurrentLockDetail = ({ label, value }) => (
    <div className="flex flex-col items-start">
      <span className="mb-1 text-gray-500 text-xs sm:text-sm">{label}</span>
      <span className="font-medium text-sm sm:text-base break-words">
        {value}
      </span>
    </div>
  );

  const NewTotalDisplay = () => (
    <div className="bg-blue-50 p-3 sm:p-4 border border-blue-200 rounded-xl">
      <div className="flex justify-between items-center gap-2">
        <div className="flex flex-col min-w-0 flex-1">
          <span className="mb-1 text-gray-600 text-xs sm:text-sm">
            New Total
          </span>
          <span className="font-bold text-blue-600 text-lg sm:text-xl break-words">
            {newTotal.toLocaleString("en-US", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}{" "}
            {tokenName}
          </span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 8l4 4m0 0l-4 4m4-4H3"
          />
        </svg>
      </div>
    </div>
  );

  return (
    <>
      <div className="relative bg-white shadow-xl mx-3 sm:mx-4 p-4 sm:p-6 rounded-xl w-full max-w-[90vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="font-semibold text-lg sm:text-xl">Top Up Lock</h2>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Current Lock Details */}
        <div className="bg-gray-50 mb-4 sm:mb-6 p-3 sm:p-4 border border-gray-200 rounded-lg">
          <h3 className="mb-3 sm:mb-4 font-medium text-gray-600 text-sm sm:text-base">
            Current Lock
          </h3>
          <div className="gap-3 sm:gap-4 grid grid-cols-3 mb-3 sm:mb-4">
            <CurrentLockDetail label="Token" value={tokenName} />
            <CurrentLockDetail label="Duration" value="6 months" />
            <CurrentLockDetail
              label="Current Amount"
              value={parseFloat(tokenAmount).toLocaleString("en-US")}
            />
          </div>
          <div className="flex items-center flex-wrap">
            <span className="mr-2 text-gray-500 text-xs sm:text-sm">
              Yield (APY)
            </span>
            <span className="font-bold text-green-600 text-base sm:text-lg">
              {apy}%
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4 sm:space-y-6">
          <div>
            <label
              htmlFor="token-select"
              className="block mb-2 font-medium text-gray-700 text-xs sm:text-sm"
            >
              Select Token
            </label>
            <div className="relative">
              <select
                id="token-select"
                value={tokenName}
                disabled
                className="block bg-gray-100 shadow-sm px-3 py-2 border border-gray-300 rounded-lg w-full appearance-none cursor-not-allowed text-sm sm:text-base"
              >
                <option value={tokenName}>{tokenName}</option>
              </select>
              <div className="right-0 absolute inset-y-0 flex items-center px-2 text-gray-700 pointer-events-none">
                <svg
                  className="fill-current w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <div className="flex justify-between items-center gap-2 mb-2">
              <label
                htmlFor="amount-input"
                className="block font-medium text-gray-700 text-xs sm:text-sm"
              >
                Amount to Add
              </label>
              <span className="text-gray-500 text-xs sm:text-sm text-right">
                {loadingBalance ? (
                  "Loading..."
                ) : (
                  <>
                    Available: {availableBalance} {tokenName}
                  </>
                )}
              </span>
            </div>
            <div className="flex items-center p-2 border border-gray-300 focus-within:border-blue-500 rounded-lg">
              <input
                id="amount-input"
                type="text"
                placeholder="0.00"
                value={amountToAdd}
                onChange={handleAmountChange}
                className="p-1 focus:outline-none w-full text-base sm:text-lg"
              />
              <button
                onClick={handleMaxClick}
                className="px-2 font-semibold text-blue-600 hover:text-blue-700 text-xs sm:text-sm flex-shrink-0"
              >
                MAX
              </button>
            </div>
          </div>

          {shouldShowNewTotal && <NewTotalDisplay />}
        </div>

        {/* Buttons */}
        <div className="flex gap-2 sm:gap-3 mt-6 sm:mt-8">
          <button
            onClick={closeModal}
            disabled={isAdding}
            className="flex-1 hover:bg-gray-100 py-2.5 sm:py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 disabled:opacity-50 text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmTopUp}
            disabled={!shouldShowNewTotal || isAdding || loadingBalance}
            className="flex-1 bg-blue-600 hover:bg-blue-700 py-2.5 sm:py-3 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isAdding ? "Processing..." : "Confirm Top Up"}
          </button>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccess}
        onClose={handleSuccessClose}
        title="Top Up Successful!"
        message={`Successfully added ${amountToAdd} ${tokenName} to your lock. Your new total is ${newTotal.toLocaleString()} ${tokenName}.`}
        showConfetti={showConfetti}
      />
    </>
  );
};

/* -------------------------------------------------------------------------- */
/* Outer Modal                                                               */
/* -------------------------------------------------------------------------- */
const Modal = () => {
  const { isOpen, view, modalData, closeModal, goToInner } = useModalStore();

  const {
    tokenName = "SUI",
    tokenAmount = "0",
    tokenIcon,
    startDate = "N/A",
    endDate = "N/A",
    timeLeft = 0,
    isExpired: modalIsExpired,
    memo,
    apy = "12.5",
    lockId,
    yieldLockId,
    isYieldLock,
    platform,
    registry,
    clock,
    coinType,
    sCoinType,
    scoinInfo,
  } = modalData || {};

  const isExpired = modalIsExpired ?? false;
  const amount = parseFloat(tokenAmount) || 0;
  const timeRemaining = timeLeft ? `${timeLeft} days` : "0 days";

  const displayIcon = tokenIcon || TOKEN_ICONS[tokenName] || sui_logo;
  const lockDescription = memo || "No description";

  const handleWithdrawSuccess = () => {
    closeModal();
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  // ---------------------- ACTION BUTTONS ----------------------
  const ActionButtons = () => {
    if (isExpired) {
      return (
        <div className="flex gap-3 sm:gap-4">
          <WithdrawButton
            className="w-full"
            isExpired={isExpired}
            lockData={{
              lockId,
              yieldLockId,
              isYieldLock,
              platform,
              registry,
              clock,
              coinType,
              sCoinType,
              scoinInfo,
            }}
            onWithdrawSuccess={handleWithdrawSuccess}
          />
        </div>
      );
    }

    return (
      <div className="gap-3 sm:gap-4 grid grid-cols-2">
        <button
          onClick={goToInner}
          className="bg-blue-800 hover:bg-blue-900 py-2.5 sm:py-3 rounded-xl font-semibold text-white text-sm sm:text-base"
        >
          Top Up
        </button>
        <button
          disabled
          className="py-2.5 sm:py-3 border border-gray-300 rounded-xl font-semibold text-gray-500 cursor-not-allowed text-sm sm:text-base"
        >
          Locked
        </button>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 p-3 sm:p-4">
      {view === "main" && (
        <div className="relative bg-white shadow-xl mx-auto p-4 sm:p-6 rounded-2xl w-full max-w-[90vw] sm:max-w-sm max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h1 className="font-semibold text-gray-900 text-lg sm:text-xl">
              Lock Details
            </h1>
            <button
              onClick={closeModal}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Token Info */}
          <div className="flex justify-between items-center gap-2 mb-4 sm:mb-6">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <img
                src={displayIcon}
                alt={`${tokenName} logo`}
                className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 text-base sm:text-lg">
                  {tokenName}
                </p>
                <p className="text-gray-500 text-xs sm:text-sm truncate">
                  {amount.toLocaleString()} tokens
                </p>
              </div>
            </div>
            <StatusPill isExpired={isExpired} />
          </div>

          {/* Description */}
          {lockDescription && lockDescription !== "No description" && (
            <div className="bg-gray-50 mb-3 sm:mb-4 p-2.5 sm:p-3 border rounded-lg">
              <p className="text-gray-500 text-xs sm:text-sm mb-1">
                Description
              </p>
              <p className="font-medium text-gray-800 text-sm sm:text-base break-words">
                {lockDescription}
              </p>
            </div>
          )}

          {/* Details */}
          <div className="gap-2.5 sm:gap-4 grid grid-cols-2 mb-6 sm:mb-8">
            <div className="bg-gray-50 p-3 sm:p-4 border rounded-lg">
              <p className="text-gray-500 text-xs sm:text-sm mb-1">
                Lock Period
              </p>
              <p className="font-medium text-gray-800 text-xs sm:text-sm break-words">
                {startDate}
              </p>
              <p className="font-medium text-gray-800 text-xs sm:text-sm break-words">
                to {endDate}
              </p>
            </div>

            <div className="bg-gray-50 p-3 sm:p-4 border rounded-lg">
              <p className="text-gray-500 text-xs sm:text-sm mb-1">
                Time Remaining
              </p>
              <p className="font-bold text-gray-900 text-lg sm:text-xl">
                {timeRemaining}
              </p>
            </div>

            <div className="bg-gray-50 p-3 sm:p-4 border rounded-lg">
              <p className="mb-1 text-gray-500 text-xs sm:text-sm">APY</p>
              <p className="font-bold text-blue-600 text-lg sm:text-xl">
                {apy}%
              </p>
            </div>

            <div className="bg-gray-50 p-3 sm:p-4 border rounded-lg">
              <p className="text-gray-500 text-xs sm:text-sm mb-1">Status</p>
              <p className="font-bold text-gray-900 text-sm sm:text-base">
                {isExpired ? "Ready to Withdraw" : "Locked"}
              </p>
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
