import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";

const PACKAGE_ID =
  "0xe7f9195e196481c59eb8da4c624e54574f1ec7a7822f2c0532de67668cadf368";
const REGISTRY_ID =
  "0x15a9045f704069d57cd483c537db8e520b91edf1ed532c8df31443c316a3bae6";
const PLATFORM_ID =
  "0x7bff4a524702b14783c6abf1b3dca82dd3237da87d9179c7c7933fc72814da29";
const CLOCK_ID = "0x6";
const SCALLOP_MAINNET_MARKET_ID =
  "0xa757975255146dc9686aa823b7838b507f315d704f428cbadad2f4ea061939d9";
const SCALLOP_MAINNET_VERSION_ID =
  "0x07871c4b3c847a0f674510d4978d5cf6f960452795e8ff6f189fd2088a3f6ac7";

const client = new SuiClient({ url: getFullnodeUrl("mainnet") });

export function useCreateLockToken() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();

  const [isLoading, setIsLoading] = useState(false);
  const [lockerId, setLockerId] = useState("");
  const [txHash, setTxHash] = useState("");

  // --- Helpers ---
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
      now.getTime() + selectedDuration * 24 * 60 * 60 * 1000
    );
    return unlockDate.toLocaleDateString();
  };

  // --- Core lock creation ---
  const createLock = async (
    amount,
    selectedDuration,
    selectedDate,
    lockDescription = ""
  ) => {
    if (!currentAccount || !amount) {
      alert("Please connect wallet and enter amount");
      return;
    }

    try {
      setIsLoading(true);

      const tx = new Transaction();
      tx.setGasBudget(10_000_000);

      const suiAmount = BigInt(Math.floor(parseFloat(amount) * 1_000_000_000));
      const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(suiAmount)]);

      const [marketCoinHandle] = tx.moveCall({
        target: `0x83bbe0b3985c5e3857803e2678899b03f3c4a31be75006ab03faf268c014ce41::mint::mint`,
        arguments: [
          tx.object(SCALLOP_MAINNET_VERSION_ID),
          tx.object(SCALLOP_MAINNET_MARKET_ID),
          coin,
          tx.object(CLOCK_ID),
        ],
        typeArguments: ["0x2::sui::SUI"],
      });

      const descriptionBytes = Array.from(
        new TextEncoder().encode(lockDescription || "Yield Lock")
      );

      tx.moveCall({
        target: `${PACKAGE_ID}::sentra::create_yield_lock`,
        arguments: [
          tx.object(PLATFORM_ID),
          tx.object(REGISTRY_ID),
          marketCoinHandle,
          tx.pure.u64(getDurationInMs(selectedDuration, selectedDate)),
          tx.pure.vector("u8", descriptionBytes),
          tx.object(CLOCK_ID),
        ],
        typeArguments: [
          "0x2::sui::SUI",
          "0xefe8b36d5b2e43728cc323298626b83177803521d195cfb11e15b910e892fddf::reserve::MarketCoin<0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI>",
        ],
      });

      const result = await signAndExecuteTransaction({ transaction: tx });
      const digest = result?.digest || result?.effects?.transactionDigest;

      const txBlock = await client.getTransactionBlock({
        digest,
        options: { showObjectChanges: true },
      });

      const createdObjects = txBlock.objectChanges?.filter(
        (c) => c.type === "created"
      );
      const lockObj = createdObjects?.find((c) =>
        ["Lock", "Locker", "YieldLock"].some((term) =>
          c.objectType.includes(term)
        )
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
