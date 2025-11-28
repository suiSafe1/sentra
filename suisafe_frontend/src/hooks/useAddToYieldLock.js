import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import {
  client,
  PACKAGE_ID,
  PLATFORM_ID,
  CLOCK_ID,
  SCALLOP_MAINNET_MARKET_ID,
  SCALLOP_MAINNET_VERSION_ID,
} from "../constants/Constants";
import { useActivityContext } from "../context/ActivityContext";

const SCALLOP_MINT_PACKAGE =
  "0x83bbe0b3985c5e3857803e2678899b03f3c4a31be75006ab03faf268c014ce41";
const SCALLOP_S_COIN_CONVERTER_PACKAGE =
  "0x80ca577876dec91ae6d22090e56c39bc60dce9086ab0729930c6900bc4162b4c";

export function useAddToYieldLock() {
  const [isLoading, setIsLoading] = useState(false);
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();
  const { refresh: refreshActivity } = useActivityContext();

  const addToYieldLock = async (yieldLockId, amount, tokenConfig) => {
    if (!yieldLockId || !amount || !tokenConfig) {
      throw new Error("Missing required parameters");
    }

    if (!tokenConfig.scoinInfo || !tokenConfig.coinType) {
      throw new Error("Invalid token configuration");
    }

    setIsLoading(true);

    try {
      const tx = new Transaction();
      tx.setGasBudget(15_000_000);

      const decimals = tokenConfig.decimals || 9;
      const tokenAmount = BigInt(
        Math.floor(parseFloat(amount) * 10 ** decimals)
      );

      let coin;

      if (tokenConfig.tokenName === "SUI") {
        [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(tokenAmount)]);
      } else {
        const coinType = tokenConfig.coinType;
        const coins = await client.getCoins({
          owner: tokenConfig.userAddress,
          coinType: coinType,
        });

        if (!coins.data || coins.data.length === 0) {
          throw new Error(`No ${tokenConfig.tokenName} coins found in wallet`);
        }

        const totalBalance = coins.data.reduce(
          (sum, coin) => sum + BigInt(coin.balance),
          BigInt(0)
        );

        const actualTokenAmount =
          tokenAmount > totalBalance ? totalBalance : tokenAmount;

        if (totalBalance === 0n) {
          throw new Error(`Insufficient ${tokenConfig.tokenName} balance`);
        }

        const primaryCoinId = coins.data[0].coinObjectId;
        coin = tx.object(primaryCoinId);

        if (
          coins.data.length > 1 &&
          BigInt(coins.data[0].balance) < actualTokenAmount
        ) {
          const coinsToMerge = coins.data
            .slice(1)
            .map((c) => tx.object(c.coinObjectId));
          tx.mergeCoins(coin, coinsToMerge);
        }

        [coin] = tx.splitCoins(coin, [tx.pure.u64(actualTokenAmount)]);
      }

      const marketCoinHandle = tx.moveCall({
        target: `${SCALLOP_MINT_PACKAGE}::mint::mint`,
        arguments: [
          tx.object(SCALLOP_MAINNET_VERSION_ID),
          tx.object(SCALLOP_MAINNET_MARKET_ID),
          coin,
          tx.object(CLOCK_ID),
        ],
        typeArguments: [tokenConfig.coinType],
      });

      const sCoinHandle = tx.moveCall({
        target: `${SCALLOP_S_COIN_CONVERTER_PACKAGE}::s_coin_converter::mint_s_coin`,
        arguments: [
          tx.object(tokenConfig.scoinInfo.converterId),
          marketCoinHandle,
        ],
        typeArguments: [tokenConfig.scoinInfo.scoinType, tokenConfig.coinType],
      });

      tx.moveCall({
        target: `${PACKAGE_ID}::sentra::add_to_yield_lock`,
        arguments: [
          tx.object(yieldLockId),
          tx.object(PLATFORM_ID),
          sCoinHandle,
        ],
        typeArguments: [tokenConfig.coinType, tokenConfig.scoinInfo.scoinType],
      });

      const result = await signAndExecuteTransaction({ transaction: tx });
      const digest = result?.digest || result?.effects?.transactionDigest;

      if (result?.digest) {
        setTimeout(() => {
          refreshActivity();
        }, 2000);
      }

      return { success: true, txHash: digest };
    } catch (error) {
      console.error("Add to yield lock failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addToYieldLock,
    isLoading,
  };
}
