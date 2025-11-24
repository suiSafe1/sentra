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

const SCALLOP_S_COIN_CONVERTER_PACKAGE =
  "0x80ca577876dec91ae6d22090e56c39bc60dce9086ab0729930c6900bc4162b4c";
const SCALLOP_REDEEM_PACKAGE =
  "0x83bbe0b3985c5e3857803e2678899b03f3c4a31be75006ab03faf268c014ce41";

const suiIcon = "SUI_ICON_SVG_JSX";

// Token configuration with sCoin info - MUST MATCH YOUR TOKEN CONFIG
const TOKEN_SCOIN_MAP = {
  "0x2::sui::SUI": {
    scoinType:
      "0xaafc4f740de0dd0dde642a31148fb941a50c77b::scallop_sui::SCALLOP_SUI",
    converterId:
      "0x5c1678c8261ac9eec024d4d630006a9f55c80dc0b1aa38a003fcb1d425818c6b",
  },
  "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP":
    {
      scoinType:
        "0xeb7a05a3224837c5e5503575aed0be714608f::scallop_deep::SCALLOP_DEEP",
      converterId:
        "0xc63838fabe37b25ad897392d89876d920f5e0c6a406bf3abcb84753d2829bc88",
    },
  // Add other tokens here as you find their sCoin converters
};

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
            ["s_coin_balance", "value"], // Changed from market_balance
            "amount",
            "balance",
            ["balance", "value"]
          );

          let coinTypeRaw = extractCoinType(fields);
          let tokenName = "TOKEN";
          let decimals = 9;
          let scoinInfo = null;

          if (!coinTypeRaw && objRef.data.type) {
            // Extract from YieldLock type - now it's YieldLock<SCoin>
            const typeMatch = objRef.data.type.match(/<([^>]+)>/);
            if (typeMatch && typeMatch[1]) {
              const scoinType = typeMatch[1];
              // Map sCoin type back to base coin type
              for (const [baseCoin, info] of Object.entries(TOKEN_SCOIN_MAP)) {
                if (
                  scoinType.includes(info.scoinType) ||
                  info.scoinType.includes(scoinType)
                ) {
                  coinTypeRaw = baseCoin;
                  scoinInfo = info;
                  break;
                }
              }
            }
          } else if (coinTypeRaw) {
            scoinInfo = TOKEN_SCOIN_MAP[coinTypeRaw];
          }

          if (coinTypeRaw) {
            tokenName = prettyTokenNameFromType(coinTypeRaw);

            if (coinTypeRaw.includes("::sui::SUI")) {
              decimals = 9;
            } else if (coinTypeRaw.includes("::usdc::USDC")) {
              decimals = 6;
            } else if (coinTypeRaw.includes("::deep::DEEP")) {
              decimals = 6;
            } else {
              decimals = 9;
            }
          }

          const tokenAmountStr = formatTokenAmountRaw(
            principalBig,
            decimals,
            2
          );

          const approxYield = (() => {
            try {
              const principalNum = Number(principalBig.toString()) || 0;
              const display =
                principalNum === 0 ? 0 : (principalNum / 10 ** decimals) * 0.08;
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
            coinType: coinTypeRaw,
            scoinInfo, // Store sCoin info for withdrawal
            decimals,
            startDate: startTimeMs > 0 ? formatToDateString(startTimeMs) : "—",
            endDate: durationMs > 0 ? formatToDateString(unlockTime) : "—",
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

    if (!asset.coinType || !asset.scoinInfo) {
      alert("Cannot determine token type or sCoin info for withdrawal");
      return;
    }

    setWithdrawing(asset.yieldLockId);

    try {
      const tx = new Transaction();
      tx.setGasBudget(15000000);

      const BASE_COIN_TYPE = asset.coinType;
      const SCOIN_TYPE = asset.scoinInfo.scoinType;
      const CONVERTER_ID = asset.scoinInfo.converterId;

      // Step 1: Unlock sCoin from YieldLock
      const sCoinHandle = tx.moveCall({
        target: `${PACKAGE_ID}::sentra::unlock_yield_lock_s_coin`,
        arguments: [tx.object(asset.yieldLockId), tx.object(PLATFORM_ID)],
        typeArguments: [SCOIN_TYPE],
      });

      // Step 2: Redeem sCoin to MarketCoin
      const marketCoinHandle = tx.moveCall({
        target: `${SCALLOP_S_COIN_CONVERTER_PACKAGE}::s_coin_converter::redeem_s_coin`,
        arguments: [tx.object(CONVERTER_ID), sCoinHandle],
        typeArguments: [SCOIN_TYPE, BASE_COIN_TYPE],
      });

      // Step 3: Redeem MarketCoin to base coin
      const redeemedCoinHandle = tx.moveCall({
        target: `${SCALLOP_REDEEM_PACKAGE}::redeem::redeem`,
        arguments: [
          tx.object(SCALLOP_MAINNET_VERSION_ID),
          tx.object(SCALLOP_MAINNET_MARKET_ID),
          marketCoinHandle,
          tx.object(CLOCK_ID),
        ],
        typeArguments: [BASE_COIN_TYPE],
      });

      // Step 4: Complete withdrawal
      tx.moveCall({
        target: `${PACKAGE_ID}::sentra::complete_yield_withdrawal_with_redeemed_coin`,
        arguments: [
          tx.object(asset.yieldLockId),
          redeemedCoinHandle,
          tx.object(PLATFORM_ID),
          tx.object(REGISTRY_ID),
          tx.object(CLOCK_ID),
        ],
        typeArguments: [BASE_COIN_TYPE, SCOIN_TYPE],
      });

      const result = await signAndExecuteTransaction({ transaction: tx });
      console.log("✅ Withdrawal result:", result);

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
  }, [currentAccount?.address]);

  return {
    userLocks,
    isLoading,
    withdrawing,
    currentAccount,
    fetchUserLocks,
    withdrawLock,
  };
}
