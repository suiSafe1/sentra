// src/hooks/useWithdrawYieldLock.js - ADD THIS NEW FILE
// Separate hook for yield lock withdrawals

import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useActivityContext } from "../context/ActivityContext";

export function useWithdrawYieldLock() {
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const { refresh: refreshActivity } = useActivityContext();

  const withdrawYieldLock = async (
    yieldLockId,
    platform,
    registry,
    clock,
    coinType,
    sCoinType,
    scoinInfo
  ) => {
    if (!yieldLockId) {
      throw new Error("Yield Lock ID is required");
    }

    setIsWithdrawing(true);

    try {
      const tx = new Transaction();
      tx.setGasBudget(20_000_000);

      // Step 1: Unlock s_coin from yield lock
      const sCoinHandle = tx.moveCall({
        target: `${platform.packageId}::sentra::unlock_yield_lock_s_coin`,
        arguments: [tx.object(yieldLockId), tx.object(platform.platformId)],
        typeArguments: [sCoinType],
      });

      // Step 2: Convert s_coin back to regular coin
      const redeemedCoinHandle = tx.moveCall({
        target: `${scoinInfo.converterPackage}::s_coin_converter::redeem_s_coin`,
        arguments: [tx.object(scoinInfo.converterId), sCoinHandle],
        typeArguments: [sCoinType, coinType],
      });

      // Step 3: Complete withdrawal with redeemed coin
      tx.moveCall({
        target: `${platform.packageId}::sentra::complete_yield_withdrawal_with_redeemed_coin`,
        arguments: [
          tx.object(yieldLockId),
          redeemedCoinHandle,
          tx.object(platform.platformId),
          tx.object(registry),
          tx.object(clock),
        ],
        typeArguments: [coinType, sCoinType],
      });

      const result = await signAndExecuteTransaction({ transaction: tx });

      if (result?.digest) {
        console.log("✅ Yield withdrawal successful:", result.digest);

        // IMPORTANT: Refresh activity feed after successful withdrawal
        setTimeout(() => {
          refreshActivity();
        }, 2000); // Wait 2 seconds for blockchain to index

        return { success: true, digest: result.digest };
      }

      return { success: false };
    } catch (error) {
      console.error("Yield withdrawal failed:", error);
      throw error;
    } finally {
      setIsWithdrawing(false);
    }
  };

  return {
    withdrawYieldLock,
    isWithdrawing,
  };
}
