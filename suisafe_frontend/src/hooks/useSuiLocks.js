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
import { fetchTokenPrices, calculateUsdValue } from "../services/priceService";
import { fetchScallopAPYs, calculateYieldEarned } from "../services/apyService";
import sui_logo from "../assets/sui.png";
import wal_logo from "../assets/wal.png";
import deep_logo from "../assets/deep.png";
import usdc_logo from "../assets/usdc.png";
import scal_logo from "../assets/scal.png";
import { useActivityContext } from "../context/ActivityContext";

const SCALLOP_S_COIN_CONVERTER_PACKAGE =
  "0x80ca577876dec91ae6d22090e56c39bc60dce9086ab0729930c6900bc4162b4c";
const SCALLOP_REDEEM_PACKAGE =
  "0x83bbe0b3985c5e3857803e2678899b03f3c4a31be75006ab03faf268c014ce41";

const TOKEN_ICONS = {
  SUI: sui_logo,
  WAL: wal_logo,
  DEEP: deep_logo,
  USDC: usdc_logo,
  SCA: scal_logo,
};

const TOKEN_SCOIN_MAP = {
  "0x2::sui::SUI": {
    scoinType:
      "0xaafc4f740de0dd0dde642a31148fb94517087052f19afb0f7bed1dc41a50c77b::scallop_sui::SCALLOP_SUI",
    converterId:
      "0x5c1678c8261ac9eec024d4d630006a9f55c80dc0b1aa38a003fcb1d425818c6b",
  },
  "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP":
    {
      scoinType:
        "0xeb7a05a3224837c5e5503575aed0be73c091d1ce5e43aa3c3e716e0ae614608f::scallop_deep::SCALLOP_DEEP",
      converterId:
        "0xc63838fabe37b25ad897392d89876d920f5e0c6a406bf3abcb84753d2829bc88",
    },
  "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC":
    {
      scoinType:
        "0x854950aa624b1df59fe64e630b2ba7c550642e9342267a33061d59fb31582da5::scallop_usdc::SCALLOP_USDC",
      converterId:
        "0xbe6b63021f3d82e0e7e977cdd718ed7c019cf2eba374b7b546220402452f938e",
    },
  "0x356a26eb9e012a68958082340d4c4116e7f55615cf27affcff209cf0ae544f59::wal::WAL":
    {
      scoinType:
        "0x622345b3f80ea5947567760eec7b9639d0582adcfd6ab9fccb85437aeda7c0d0::scallop_wal::SCALLOP_WAL",
      converterId:
        "0xc02b365a1d880156c1a757d7777867e8a436ab97ce5f51e211695580ab7c9bce",
    },
  "0x7016aae72cfc67f2fadf55769c0a7dd54291a583b63051a5ed71081cce836ac6::sca::SCA":
    {
      scoinType:
        "0x5ca17430c1d046fae9edeaa8fd76c7b4193a00d764a0ecfa9418d733ad27bc1e::scallop_sca::SCALLOP_SCA",
      converterId:
        "0xe04bfc95e00252bd654ee13c08edef9ac5e4b6ae4074e8390db39e9a0109c529",
    },
};

export function useSuiLocks() {
  const [userLocks, setUserLocks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [withdrawing, setWithdrawing] = useState(null);
  const [prices, setPrices] = useState({});
  const [apys, setApys] = useState({});
  const { refresh: refreshActivity } = useActivityContext();

  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();

  useEffect(() => {
    const loadMarketData = async () => {
      const [priceData, apyData] = await Promise.all([
        fetchTokenPrices(),
        fetchScallopAPYs(),
      ]);
      setPrices(priceData);
      setApys(apyData);
    };

    loadMarketData();

    // Refresh every 2 minutes
    const interval = setInterval(loadMarketData, 120000);
    return () => clearInterval(interval);
  }, []);

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

      const now = Date.now();

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
            ["s_coin_balance", "value"],
            "amount",
            "balance",
            ["balance", "value"]
          );

          let coinTypeRaw = extractCoinType(fields);
          let tokenName = "TOKEN";
          let decimals = 9;
          let scoinInfo = null;

          if (!coinTypeRaw && objRef.data.type) {
            const typeMatch = objRef.data.type.match(/<([^>]+)>/);
            if (typeMatch && typeMatch[1]) {
              const scoinType = typeMatch[1];
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

          const principalNum =
            Number(principalBig.toString()) / Math.pow(10, decimals);
          const tokenApy = apys[tokenName] || 8.0;
          const yieldInToken = calculateYieldEarned(
            principalNum,
            tokenApy,
            startTimeMs,
            now
          );

          const principalUsd = calculateUsdValue(
            tokenName,
            principalBig.toString(),
            decimals,
            prices
          );
          const yieldUsd = yieldInToken * (prices[tokenName] || 0);

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

          const lockDescription =
            (fields.description ?? fields.fields?.description) ||
            "No description";

          const tokenIcon = TOKEN_ICONS[tokenName] || sui_logo;

          acc.push({
            objectId: objRef.data.objectId,
            yieldLockId: objRef.data.objectId,
            tokenName,
            tokenAmount: tokenAmountStr,
            icon: tokenIcon,
            coinType: coinTypeRaw,
            scoinInfo,
            decimals,
            startDate: startTimeMs > 0 ? formatToDateString(startTimeMs) : "—",
            endDate: durationMs > 0 ? formatToDateString(unlockTime) : "—",
            timeLeft: daysLeft,
            percentElapsed,
            yieldEarned: yieldInToken.toFixed(4),
            yieldEarnedUsd: yieldUsd.toFixed(2),
            principalUsd: principalUsd.toFixed(2),
            apy: tokenApy.toFixed(2),
            isExpired,
            memo: lockDescription,
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

      const sCoinHandle = tx.moveCall({
        target: `${PACKAGE_ID}::sentra::unlock_yield_lock_s_coin`,
        arguments: [tx.object(asset.yieldLockId), tx.object(PLATFORM_ID)],
        typeArguments: [SCOIN_TYPE],
      });

      const marketCoinHandle = tx.moveCall({
        target: `${SCALLOP_S_COIN_CONVERTER_PACKAGE}::s_coin_converter::burn_s_coin`,
        arguments: [tx.object(CONVERTER_ID), sCoinHandle],
        typeArguments: [SCOIN_TYPE, BASE_COIN_TYPE],
      });

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

      if (result?.digest) {
        // SUCCESS! Refresh activity
        setTimeout(() => {
          refreshActivity();
        }, 2000);
      }

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
  }, [currentAccount?.address, prices, apys]);

  return {
    userLocks,
    isLoading,
    withdrawing,
    currentAccount,
    fetchUserLocks,
    withdrawLock,
    prices,
    apys,
  };
}
