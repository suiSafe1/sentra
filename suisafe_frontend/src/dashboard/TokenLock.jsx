// src/components/TokenLock.jsx
import React from "react";
import { useSuiLocks } from "../hooks/useSuiLocks";
import { StakingCard } from "../components/StakingCard";
import { useModalStore } from "../store/useModalStore";

function TokenLock() {
  const {
    userLocks,
    isLoading,
    withdrawing,
    currentAccount,
    fetchUserLocks,
    withdrawLock,
  } = useSuiLocks();

  const openModal = useModalStore((state) => state.openModal);

  if (isLoading) {
    return (
      <div className='flex justify-center py-10 text-gray-500'>
        <p>Loading your locks...</p>
      </div>
    );
  }

  if (!currentAccount) {
    return (
      <div className='flex justify-center py-10 text-gray-500'>
        <p>Please connect your wallet to view your locks</p>
      </div>
    );
  }

  if (userLocks.length === 0) {
    return (
      <div className='flex flex-col items-center py-10 text-center'>
        <p className='mb-3 text-gray-600'>
          No locks found. Create your first lock to get started!
        </p>
        <button
          className='bg-blue-900 hover:bg-blue-700 px-4 py-2 rounded-md font-medium text-white'
          onClick={fetchUserLocks}
          disabled={isLoading}
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className='flex justify-end mb-4'>
        <button
          className='bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md font-medium text-gray-700 text-sm'
          onClick={fetchUserLocks}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className='gap-4 grid'>
        {userLocks.map((data, idx) => {
          const isThisWithdrawing = withdrawing === data.yieldLockId;

          return (
            <div
              key={idx}
              onClick={() =>
                openModal("LOCK_DETAILS", {
                  ...data,
                  withdrawLock: () => withdrawLock(data),
                  isWithdrawing: isThisWithdrawing,
                })
              }
            >
              <StakingCard
                {...data}
                withdrawLock={() => withdrawLock(data)}
                isWithdrawing={isThisWithdrawing}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TokenLock;
