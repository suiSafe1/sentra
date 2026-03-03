import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { useActivityContext } from "../context/ActivityContext";
import {
  client,
  PACKAGE_ID,
  REGISTRY_ID,
  PLATFORM_ID,
  CLOCK_ID,
  SCALLOP_MAINNET_MARKET_ID,
  SCALLOP_MAINNET_VERSION_ID,
  SCALLOP_MINT_PACKAGE,
  SCALLOP_S_COIN_CONVERTER_PACKAGE,
} from "../constants/Constants";

export function useCreateLockToken() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();

  const [isLoading, setIsLoading] = useState(false);
  const [lockerId, setLockerId] = useState("");
  const [txHash, setTxHash] = useState("");

  const { refresh: refreshActivity } = useActivityContext();

  const getDurationInMs = (selectedDuration, selectedDate) => {
    if (selectedDate) {
      const now = new Date();
      const unlockDate = new Date(selectedDate);
      return unlockDate.getTime() - now.getTime();
    }
    return selectedDuration * 24 * 60 * 60 * 1000;
  };

  const getUnlockDate = (selectedDuration, selectedDate) => {
    if (selectedDate) return selectedDate;
    const now = new Date();
    const unlockDate = new Date(
      now.getTime() + selectedDuration * 24 * 60 * 60 * 1000,
    );
    return unlockDate.toLocaleDateString();
  };

  const createLock = async (
    amount,
    selectedDuration,
    selectedDate,
    lockDescription = "",
    selectedToken,
    memo = "",
  ) => {
    if (!currentAccount || !amount) {
      alert("Please connect wallet and enter amount");
      return;
    }

    if (!selectedToken || !selectedToken.type) {
      alert("Please select a valid token");
      return;
    }

    if (
      !selectedToken.scoin ||
      !selectedToken.scoin.type ||
      !selectedToken.scoin.converterId
    ) {
      alert("sCoin configuration missing for this token");
      return;
    }

    try {
      setIsLoading(true);

      const tx = new Transaction();
      tx.setGasBudget(15_000_000);

      const decimals = selectedToken.decimals || 9;
      const tokenAmount = BigInt(
        Math.floor(parseFloat(amount) * 10 ** decimals),
      );

      let coin;

      if (selectedToken.symbol === "SUI") {
        [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(tokenAmount)]);
      } else {
        const coinType = selectedToken.type;
        const coins = await client.getCoins({
          owner: currentAccount.address,
          coinType: coinType,
        });

        if (!coins.data || coins.data.length === 0) {
          throw new Error(`No ${selectedToken.symbol} coins found in wallet`);
        }

        const totalBalance = coins.data.reduce(
          (sum, coin) => sum + BigInt(coin.balance),
          BigInt(0),
        );

        if (totalBalance < tokenAmount) {
          throw new Error(`Insufficient ${selectedToken.symbol} balance`);
        }

        const primaryCoinId = coins.data[0].coinObjectId;
        coin = tx.object(primaryCoinId);

        if (
          coins.data.length > 1 &&
          BigInt(coins.data[0].balance) < tokenAmount
        ) {
          const coinsToMerge = coins.data
            .slice(1)
            .map((c) => tx.object(c.coinObjectId));
          tx.mergeCoins(coin, coinsToMerge);
        }

        [coin] = tx.splitCoins(coin, [tx.pure.u64(tokenAmount)]);
      }

      const marketCoinHandle = tx.moveCall({
        target: `${SCALLOP_MINT_PACKAGE}::mint::mint`,
        arguments: [
          tx.object(SCALLOP_MAINNET_VERSION_ID),
          tx.object(SCALLOP_MAINNET_MARKET_ID),
          coin,
          tx.object(CLOCK_ID),
        ],
        typeArguments: [selectedToken.type],
      });

      const sCoinHandle = tx.moveCall({
        target: `${SCALLOP_S_COIN_CONVERTER_PACKAGE}::s_coin_converter::mint_s_coin`,
        arguments: [
          tx.object(selectedToken.scoin.converterId),
          marketCoinHandle,
        ],
        typeArguments: [selectedToken.scoin.type, selectedToken.type],
      });

      const finalDescription = memo || lockDescription || "Yield Lock";
      const descriptionBytes = Array.from(
        new TextEncoder().encode(finalDescription),
      );

      tx.moveCall({
        target: `${PACKAGE_ID}::sentra::create_yield_lock`,
        arguments: [
          tx.object(PLATFORM_ID),
          tx.object(REGISTRY_ID),
          sCoinHandle,
          tx.pure.u64(getDurationInMs(selectedDuration, selectedDate)),
          tx.pure.vector("u8", descriptionBytes),
          tx.object(CLOCK_ID),
        ],
        typeArguments: [selectedToken.type, selectedToken.scoin.type],
      });

      const result = await signAndExecuteTransaction({ transaction: tx });
      const digest = result?.digest || result?.effects?.transactionDigest;

      if (digest) {
        setTimeout(() => {
          refreshActivity();
        }, 2000);
      }

      // Retry fetching the tx block — RPC nodes can lag behind indexing the tx
      const MAX_RETRIES = 10;
      const RETRY_DELAY_MS = 1500;
      let txBlock = null;

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          txBlock = await client.getTransactionBlock({
            digest,
            options: { showObjectChanges: true },
          });
          break; // success — exit retry loop
        } catch (fetchError) {
          const isNotFound =
            fetchError?.message?.includes("Could not find") ||
            fetchError?.message?.includes("not found");

          if (!isNotFound || attempt === MAX_RETRIES) throw fetchError;

          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        }
      }

      const createdObjects = txBlock.objectChanges?.filter(
        (c) => c.type === "created",
      );
      const lockObj = createdObjects?.find((c) =>
        ["Lock", "Locker", "YieldLock"].some((term) =>
          c.objectType.includes(term),
        ),
      );

      if (lockObj) setLockerId(lockObj.objectId);
      setTxHash(digest);
      return { success: true, lockerId: lockObj?.objectId, txHash: digest };
    } catch (error) {
      console.error("Lock creation failed:", error);
      alert(`Lock creation failed: ${error?.message || error}`);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    currentAccount,
    isLoading,
    lockerId,
    txHash,
    createLock,
    getUnlockDate,
  };
}
