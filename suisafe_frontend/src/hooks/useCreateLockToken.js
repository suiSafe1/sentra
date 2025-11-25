import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";

const PACKAGE_ID =
  "0x7b9640dc7446fdc540a17ce6a0673be6f95447862ea63685daa7594f57f32601";
const REGISTRY_ID =
  "0x1cb927b87f8d1c00aadf70e36d315abfe156dbf8ea37bf9fcaaeb2bbd4ea43ba";
const PLATFORM_ID =
  "0x38648bb04fd4304ccc4ecb28fbf5ac3003103d5f3ae58b172463f73818d10fa5";
const CLOCK_ID = "0x6";
const SCALLOP_MAINNET_MARKET_ID =
  "0xa757975255146dc9686aa823b7838b507f315d704f428cbadad2f4ea061939d9";
const SCALLOP_MAINNET_VERSION_ID =
  "0x07871c4b3c847a0f674510d4978d5cf6f960452795e8ff6f189fd2088a3f6ac7";
const SCALLOP_MINT_PACKAGE =
  "0x83bbe0b3985c5e3857803e2678899b03f3c4a31be75006ab03faf268c014ce41";
const SCALLOP_S_COIN_CONVERTER_PACKAGE =
  "0x80ca577876dec91ae6d22090e56c39bc60dce9086ab0729930c6900bc4162b4c";

const client = new SuiClient({ url: getFullnodeUrl("mainnet") });

export function useCreateLockToken() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();

  const [isLoading, setIsLoading] = useState(false);
  const [lockerId, setLockerId] = useState("");
  const [txHash, setTxHash] = useState("");

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

  const createLock = async (
    amount,
    selectedDuration,
    selectedDate,
    lockDescription = "",
    selectedToken,
    memo = ""
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
        Math.floor(parseFloat(amount) * 10 ** decimals)
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
          BigInt(0)
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

      // Use memo if provided, otherwise use lockDescription, with fallback to "Yield Lock"
      const finalDescription = memo || lockDescription || "Yield Lock";
      const descriptionBytes = Array.from(
        new TextEncoder().encode(finalDescription)
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
