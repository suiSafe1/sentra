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

      const sCoinHandle = tx.moveCall({
        target: `${platform.packageId}::sentra::unlock_yield_lock_s_coin`,
        arguments: [tx.object(yieldLockId), tx.object(platform.platformId)],
        typeArguments: [sCoinType],
      });

      const redeemedCoinHandle = tx.moveCall({
        target: `${scoinInfo.converterPackage}::s_coin_converter::redeem_s_coin`,
        arguments: [tx.object(scoinInfo.converterId), sCoinHandle],
        typeArguments: [sCoinType, coinType],
      });

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

      console.log("✅ Transaction result:", result);

      setTimeout(() => {
        refreshActivity();
      }, 2000);

      setIsWithdrawing(false);

      return {
        success: true,
        digest: result?.digest || "completed",
      };
    } catch (error) {
      console.error("❌ Yield withdrawal failed:", error);
      setIsWithdrawing(false);
      throw error;
    }
  };

  return {
    withdrawYieldLock,
    isWithdrawing,
  };
}
