// src/hooks/useSuiLocks.js

import { useState, useEffect } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import {
  client,
  PACKAGE_ID,
  PLATFORM_ID,
  REGISTRY_ID,
  CLOCK_ID,
  SCALLOP_MAINNET_VERSION_ID,
  SCALLOP_MAINNET_MARKET_ID,
} from "../constants/Constants";
import {
  extractTimeNumber,
  extractBigInt,
  formatTokenAmountRaw,
  extractCoinType,
  prettyTokenNameFromType,
} from "../utils/SuiUtils";

const suiIcon = "SUI_ICON_SVG_JSX";

export function useSuiLocks() {
  const [userLocks, setUserLocks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [withdrawing, setWithdrawing] = useState(null);

  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();

  const fetchUserLocks = async () => {
    if (!currentAccount) return;

    setIsLoading(true);
    try {
      const ownedObjects = await client.getOwnedObjects({
        owner: currentAccount.address,
        filter: { StructType: `${PACKAGE_ID}::sentra::YieldLock` },
        options: { showContent: true, showType: true },
      });

      // Helper function to format timestamp into YYYY-MM-DD
      // 'sv' (Swedish) locale is used for consistent YYYY-MM-DD output.
      const formatToDateString = (timestampMs) =>
        new Date(timestampMs).toLocaleDateString("sv");

      const locks = ownedObjects.data.reduce((acc, objRef) => {
        try {
          if (objRef?.data?.content?.dataType !== "moveObject") return acc;
          const fields = objRef.data.content.fields ?? {};

          const startTimeMs = extractTimeNumber(fields, "start_time", [
            "start_time",
          ]);
          const durationMs = extractTimeNumber(fields, "duration_ms", [
            "duration_ms",
          ]);
          const unlockTime = startTimeMs + durationMs;

          const principalBig = extractBigInt(
            fields,
            "principal_amount",
            ["principal_amount"],
            ["market_balance", "value"],
            "amount",
            "balance",
            ["balance", "value"]
          );
          const tokenAmountStr = formatTokenAmountRaw(principalBig, 9, 2);

          const coinTypeRaw = extractCoinType(fields);
          let tokenName;

          if (!coinTypeRaw && objRef.data.type) {
            const typeMatch = objRef.data.type.match(/<([^>]+)>/);
            tokenName =
              typeMatch && typeMatch[1]
                ? prettyTokenNameFromType(typeMatch[1])
                : "SUI";
          } else {
            tokenName = prettyTokenNameFromType(coinTypeRaw);
          }

          const approxYield = (() => {
            try {
              // Simple 8% APR approximation for display
              const principalNum = Number(principalBig.toString()) || 0;
              const display =
                principalNum === 0 ? 0 : (principalNum / 1_000_000_000) * 0.08;
              return display.toFixed(2);
            } catch {
              return "0.00";
            }
          })();

          const now = Date.now();
          const isExpired = unlockTime <= now;
          const msLeft = Math.max(0, unlockTime - now);
          const daysLeft = Math.ceil(msLeft / (24 * 60 * 60 * 1000));
          const percentElapsed =
            durationMs > 0
              ? Math.min(
                  100,
                  Math.max(
                    0,
                    Math.round(((now - startTimeMs) / durationMs) * 100)
                  )
                )
              : 0;

          acc.push({
            objectId: objRef.data.objectId,
            yieldLockId: objRef.data.objectId,
            tokenName,
            tokenAmount: tokenAmountStr,
            icon: suiIcon,
            // --- NEW DATE LOGIC APPLIED HERE ---
            startDate: startTimeMs > 0 ? formatToDateString(startTimeMs) : "—",
            endDate: durationMs > 0 ? formatToDateString(unlockTime) : "—",
            // ------------------------------------
            timeLeft: daysLeft,
            percentElapsed,
            yieldEarned: approxYield,
            isExpired,
            memo: (fields.memo ?? fields.fields?.memo) || "",
          });
        } catch (innerErr) {
          console.warn(
            "failed to parse lock object:",
            objRef.data.objectId,
            innerErr
          );
        }
        return acc;
      }, []);

      setUserLocks(locks);
    } catch (error) {
      console.error("Failed to fetch user locks:", error);
      setUserLocks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const withdrawLock = async (asset) => {
    if (!currentAccount || !asset.yieldLockId) {
      alert("Please connect your wallet first");
      return;
    }

    setWithdrawing(asset.yieldLockId);

    try {
      const tx = new Transaction();
      tx.setGasBudget(10000000);

      const SUI_TYPE =
        "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI";
      const MARKET_COIN_TYPE = `0xefe8b36d5b2e43728cc323298626b83177803521d195cfb11e15b910e892fddf::reserve::MarketCoin<${SUI_TYPE}>`;

      // 1. Unlock Market Coin from YieldLock
      const marketCoinHandle = tx.moveCall({
        target: `${PACKAGE_ID}::sentra::unlock_yield_lock_market_coin`,
        arguments: [tx.object(asset.yieldLockId), tx.object(PLATFORM_ID)],
        typeArguments: [MARKET_COIN_TYPE],
      });

      // 2. Redeem Market Coin for base SUI (Scallop integration)
      const redeemedCoinHandle = tx.moveCall({
        target: `0x83bbe0b3985c5e3857803e2678899b03f3c4a31be75006ab03faf268c014ce41::redeem::redeem`,
        arguments: [
          tx.object(SCALLOP_MAINNET_VERSION_ID),
          tx.object(SCALLOP_MAINNET_MARKET_ID),
          marketCoinHandle,
          tx.object(CLOCK_ID),
        ],
        typeArguments: [SUI_TYPE],
      });

      // 3. Complete withdrawal and transfer SUI to user
      tx.moveCall({
        target: `${PACKAGE_ID}::sentra::complete_yield_withdrawal_with_redeemed_coin`,
        arguments: [
          tx.object(asset.yieldLockId),
          redeemedCoinHandle,
          tx.object(PLATFORM_ID),
          tx.object(REGISTRY_ID),
          tx.object(CLOCK_ID),
        ],
        typeArguments: [SUI_TYPE, MARKET_COIN_TYPE],
      });

      const result = await signAndExecuteTransaction({ transaction: tx });
      console.log("✅ Combined withdrawal result:", result);

      await fetchUserLocks();
      alert("Withdrawal successful!");
    } catch (error) {
      console.error("Withdraw failed:", error);
      if (
        error.toString().includes("too early") ||
        error.message?.includes("code 2")
      ) {
        alert(
          "Error: It's too early to withdraw. Please wait until the lock duration ends."
        );
      } else {
        alert(`Withdraw failed: ${error.message || error}`);
      }
    } finally {
      setWithdrawing(null);
    }
  };

  useEffect(() => {
    if (currentAccount) {
      fetchUserLocks();
    } else {
      setUserLocks([]);
    }
  }, [currentAccount?.address]); // Dependency on address to ensure refetch on account switch

  return {
    userLocks,
    isLoading,
    withdrawing,
    currentAccount,
    fetchUserLocks,
    withdrawLock,
  };
}
