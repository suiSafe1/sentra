import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  ConnectButton,
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import {
  MdOutlineLock,
  MdOutlineDateRange,
  MdErrorOutline,
} from "react-icons/md";
import { IoIosArrowDown, IoIosTrendingUp } from "react-icons/io";
import { GoUnlock } from "react-icons/go";
import { PiGasPump, PiCheckSquareOffsetBold } from "react-icons/pi";
import { IoWarningOutline } from "react-icons/io5";

// Blockchain constants
const PACKAGE_ID =
  "0x42c0b7b63930789bf081639163f2f451101d20ca61ead1a237dc9a74119a76f5";
const REGISTRY_ID =
  "0x9a2bff9675092cb3d20f5917dbfeea643307a787d558cf83c0bceaa51206851b";
const PLATFORM_ID =
  "0x5093a8075a2b8309c981d2d033c7aa620d89592446f548ef96e7fee9f62b6604";
const CLOCK_ID = "0x6";

const SCALLOP_MAINNET_MARKET_ID =
  "0xa757975255146dc9686aa823b7838b507f315d704f428cbadad2f4ea061939d9";
const SCALLOP_MAINNET_VERSION_ID =
  "0x07871c4b3c847a0f674510d4978d5cf6f960452795e8ff6f189fd2088a3f6ac7";

// Initialize Sui client
const client = new SuiClient({ url: getFullnodeUrl("mainnet") });

function CreateLockToken() {
  const [nftLock, setNftLock] = useState(false);
  const [selectToken, setSelectToken] = useState(false);
  const [confirmLock, setConfirmLock] = useState(false);
  const [selectDate, setSelectDate] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [amount, setAmount] = useState("");
  const [lockSuccess, setLockSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [memo, setMemo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lockerId, setLockerId] = useState("");
  const [txHash, setTxHash] = useState("");

  // Sui dApp Kit hooks
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();

  // Yield estimation hook
  const useScallopYield = (amount, symbol = "SUI", days = 365) => {
    const [yieldRate, setYieldRate] = useState(null);
    const [estimatedYield, setEstimatedYield] = useState("0");

    useEffect(() => {
      if (!amount || parseFloat(amount) <= 0) {
        setEstimatedYield("0");
        return;
      }

      const fetchYield = async () => {
        try {
          const res = await fetch("https://sdk.api.scallop.io/api/market");
          const data = await res.json();
          const pool = data.pools.find((p) => p.symbol === symbol);

          if (!pool) return;

          const apy = parseFloat(pool.supplyApy || 0);
          setYieldRate(apy * 100);

          const est = (parseFloat(amount) * apy * (days / 365)).toFixed(2);
          setEstimatedYield(est);
        } catch (err) {
          console.error("Failed to fetch yield:", err);
        }
      };

      fetchYield();
    }, [amount, symbol, days]);

    return { yieldRate, estimatedYield };
  };

  const days = selectedDate
    ? Math.ceil(
        (new Date(selectedDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : selectedDuration;

  const { yieldRate, estimatedYield } = useScallopYield(amount, "SUI", days);

  /* --------------------------------------------------------------
     Confetti control
  -------------------------------------------------------------- */
  useEffect(() => {
    if (lockSuccess) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [lockSuccess]);

  /* --------------------------------------------------------------
     Event Handlers
  -------------------------------------------------------------- */
  const handleSwitch = (e) => setNftLock(e.target.id === "nft");

  const handleDurationClick = (days) => {
    setSelectedDuration(days);
    const target = new Date();
    target.setDate(target.getDate() + days);
    setSelectedDate(target.toISOString().split("T")[0]);
  };

  const handleDateChange = (dateValue) => {
    setSelectedDate(dateValue);
    const diffDays = Math.ceil(
      (new Date(dateValue).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
    );
    setSelectedDuration(diffDays);
  };

  const getDurationInMs = () => {
    if (selectedDate) {
      const now = new Date();
      const unlockDate = new Date(selectedDate);
      return unlockDate.getTime() - now.getTime();
    }
    return selectedDuration * 24 * 60 * 60 * 1000;
  };

  const getUnlockDate = () => {
    if (selectedDate) {
      return new Date(selectedDate).toLocaleDateString();
    }
    const now = new Date();
    const unlockDate = new Date(
      now.getTime() + selectedDuration * 24 * 60 * 60 * 1000
    );
    return unlockDate.toLocaleDateString();
  };

  /* --------------------------------------------------------------
     Main blockchain integration function
  -------------------------------------------------------------- */
  const createLock = async () => {
    if (!currentAccount || !amount) {
      alert("Please connect wallet and enter amount");
      return;
    }

    try {
      setIsLoading(true);

      const tx = new Transaction();
      tx.setGasBudget(10000000);

      const suiAmount = BigInt(Math.floor(parseFloat(amount) * 1_000_000_000));

      // Split gas to create the coin we'll mint with
      const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(suiAmount)]);

      // Call Scallop mint and capture returned resource handle
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

      // Call create_yield_lock using the handle returned by mint
      tx.moveCall({
        target: `${PACKAGE_ID}::sentra::create_yield_lock`,
        arguments: [
          tx.object(PLATFORM_ID),
          tx.object(REGISTRY_ID),
          marketCoinHandle,
          tx.pure.u64(getDurationInMs()),
          tx.object(CLOCK_ID),
        ],
        typeArguments: [
          "0x2::sui::SUI",
          "0xefe8b36d5b2e43728cc323298626b83177803521d195cfb11e15b910e892fddf::reserve::MarketCoin<0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI>",
        ],
      });

      // Sign & execute the combined transaction
      const result = await signAndExecuteTransaction({ transaction: tx });
      console.log("✅ Combined tx result:", result);

      // Get created lock object from effects
      const digest = result?.digest || result?.effects?.transactionDigest;
      const txBlock = await client.getTransactionBlock({
        digest,
        options: { showObjectChanges: true },
      });

      const createdObjects = txBlock.objectChanges?.filter(
        (c) => c.type === "created"
      );
      const lockObj = createdObjects?.find(
        (c) =>
          c.objectType.includes("Lock") ||
          c.objectType.includes("Locker") ||
          c.objectType.includes("YieldLock")
      );

      if (lockObj) setLockerId(lockObj.objectId);
      setTxHash(digest);
      setConfirmLock(false);
      setLockSuccess(true);

      return { success: true };
    } catch (error) {
      console.error("Lock creation failed:", error);
      alert(`Lock creation failed: ${error?.message || error}`);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmLock = async () => {
    const result = await createLock();
    if (result?.success) {
      setConfirmLock(false);
      setLockSuccess(true);
    }
  };

  const closeSuccess = () => {
    setLockSuccess(false);
    setShowConfetti(false);
  };

  const unlockDate = getUnlockDate();

  return (
    <div
      className="flex lg:flex-row flex-col gap-8 m-4 rounded-2xl"
      aria-live="polite"
    >
      {/* ==================== LEFT – FORM ==================== */}
      <div className="flex-1 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] rounded-2xl">
        <div className="flex items-center gap-2 bg-[#00076C] p-5 rounded-t-2xl font-extrabold text-[20.87px] text-white">
          <MdOutlineLock className="text-[30px]" />
          <h3>Create Lock</h3>
        </div>

        {/* Wallet Connection */}
        <div className="p-5 pb-3"></div>

        <section className="bg-white p-5 pt-0">
          {/* Token/NFT Switch */}
          <div className="flex bg-[#F2F5F9] mb-[1.2rem] p-[5px] rounded-lg">
            <button
              id="token"
              type="button"
              onClick={handleSwitch}
              className={`flex-1 p-3 text-[16.05px] font-semibold rounded-lg transition-all ${
                !nftLock ? "bg-[#00076C] text-white" : "text-[#4D5562]"
              }`}
            >
              Token Lock
            </button>
            <button
              id="nft"
              type="button"
              onClick={handleSwitch}
              className={`flex-1 p-3 text-[16.05px] font-semibold rounded-lg transition-all ${
                nftLock ? "bg-[#00076C] text-white" : "text-[#4D5562]"
              }`}
            >
              NFT Lock
            </button>
          </div>

          {nftLock ? (
            <div className="text-center p-8 text-gray-500">
              NFT Lock Coming Soon
            </div>
          ) : (
            <>
              {/* Select Token */}
              <div className="flex flex-col gap-2 mb-4 font-bold text-[#505A6B]">
                <span className="flex items-center gap-2">
                  Select Token <MdErrorOutline />
                </span>
                <button
                  type="button"
                  onClick={() => setSelectToken(!selectToken)}
                  className="flex justify-between items-center bg-white px-2.5 border border-[#4D5562] rounded-lg h-12 font-semibold text-[#4D5562]"
                >
                  <span>SUI Token</span>
                  <IoIosArrowDown />
                </button>
                {selectToken && (
                  <div className="mt-2 text-[#4D5562]">
                    SUI - Sui Network Token
                  </div>
                )}
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-2 mb-4 font-bold text-[#505A6B]">
                <span>Amount</span>
                <div className="flex justify-between items-center bg-white px-2.5 border border-[#4D5562] rounded-lg h-12">
                  <input
                    type="text"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) =>
                      /^\d*\.?\d*$/.test(e.target.value) &&
                      setAmount(e.target.value)
                    }
                    className="flex-1 bg-transparent border-none outline-none font-semibold text-[16.05px]"
                  />
                  <span className="font-semibold text-[#00076C] cursor-pointer">
                    Max
                  </span>
                </div>
              </div>

              {/* Lock Duration */}
              <div className="flex flex-col gap-2 mb-4 font-bold text-[#505A6B]">
                <span>Lock Duration</span>
                <div className="flex flex-wrap gap-2 mb-2">
                  {[30, 60, 90, 120].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => handleDurationClick(days)}
                      className={`px-3 py-2 rounded-lg border font-semibold transition-all ${
                        selectedDuration === days
                          ? "bg-[#00076C] text-white border-[#00076C]"
                          : "bg-white text-[#4D5562] border-[#4D5562]"
                      }`}
                    >
                      {days} days
                    </button>
                  ))}
                </div>

                {/* Custom Date Picker */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setSelectDate(!selectDate)}
                    className="flex items-center bg-white px-2.5 border border-[#4D5562] rounded-lg w-full h-12 font-semibold text-[#4D5562]"
                  >
                    <MdOutlineDateRange className="mr-2" />
                    {selectedDate || "Pick a custom date"}
                  </button>
                  {selectDate && (
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="top-full left-0 z-10 absolute bg-white shadow-lg mt-1 p-2 border-[#00076C] border-2 rounded-lg"
                    />
                  )}
                </div>
              </div>

              {/* Memo */}
              <div className="flex flex-col gap-2 mb-4 font-bold text-[#505A6B]">
                <span>Memo (Optional)</span>
                <textarea
                  placeholder="Reason for lock..."
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="bg-white p-2.5 border border-[#4D5562] rounded-lg outline-none h-[85px] font-semibold resize-y"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  className="flex-1 bg-[#00076C] disabled:opacity-60 py-[0.8rem] rounded-md font-semibold text-[20px] text-white"
                  onClick={() => setConfirmLock(true)}
                  disabled={
                    !currentAccount || !amount || parseFloat(amount) <= 0
                  }
                >
                  {isLoading ? "Processing..." : "Confirm Lock"}
                </button>
                <button
                  type="button"
                  className="flex justify-center items-center bg-white py-[0.8rem] border border-[#4D5562] rounded-md w-36 font-semibold text-[#4D5562] text-[20px]"
                  onClick={() => (window.location.href = "/dashboard")}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </section>
      </div>

      {/* ==================== RIGHT – PREVIEW ==================== */}
      <section className="flex flex-col justify-between gap-5">
        <div className="bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 bg-[#00076C] p-5 font-extrabold text-[20.87px] text-white">
            <MdErrorOutline className="text-[30px]" />
            <h3>Lock Summary</h3>
          </div>

          {amount ? (
            <div className="bg-white p-5">
              <div className="flex items-center gap-3 bg-[#F9FAFC] p-3 rounded-lg">
                <div className="text-[24px]">🪙</div>
                <div>
                  <h2 className="font-extrabold text-[#101729] text-[16.88px]">
                    {amount} SUI
                  </h2>
                  <p className="font-semibold text-[#4D5562] text-[14.47px]">
                    SUI Token
                  </p>
                </div>
              </div>

              <hr className="my-4 border-[#e2e2e2]" />
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1 font-semibold text-[#4D5562]">
                  <MdOutlineDateRange /> Lock Start
                </span>
                <span className="font-semibold">Today</span>
              </div>

              <div className="flex justify-between items-center my-2">
                <span className="flex items-center gap-1 font-semibold text-[#4D5562]">
                  <GoUnlock /> Unlock Date
                </span>
                <span className="font-semibold">{unlockDate}</span>
              </div>

              <div className="flex justify-between items-center my-2">
                <span className="flex items-center gap-1 font-semibold text-[#4D5562]">
                  <MdErrorOutline /> Duration
                </span>
                <span className="font-semibold">{selectedDuration} days</span>
              </div>

              <hr className="my-4 border-[#e2e2e2]" />
              <div className="flex justify-between items-center my-2">
                <span className="flex items-center gap-1 font-semibold text-[#4D5562]">
                  <PiGasPump /> Gas Fee
                </span>
                <span className="font-semibold">~0.02 SUI</span>
              </div>

              {memo && (
                <>
                  <hr className="my-4 border-[#e2e2e2]" />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[#4D5562]">Memo</span>
                    <span className="font-semibold text-sm">{memo}</span>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center gap-5 p-8 font-semibold text-[#99A5B7] text-center">
              <MdErrorOutline className="text-[42px]" />
              <p>Complete the form to see your lock preview</p>
            </div>
          )}
        </div>
      </section>

      {/* ==================== CONFIRM MODAL ==================== */}
      {confirmLock && (
        <div className="z-[1000] fixed inset-0 flex justify-center items-center bg-black/50 p-4 font-sans">
          <div className="relative bg-white shadow-[0_4px_15px_rgba(0,0,0,0.2)] p-[21px_29px] rounded-xl w-full max-w-md">
            <div className="flex flex-col gap-2 mb-[30px]">
              <h2 className="flex items-center gap-1 font-extrabold text-[#00076C] text-[21.27px]">
                <PiCheckSquareOffsetBold /> Confirm Lock Creation
              </h2>
              <p className="text-[#4D5562] text-[16.55px]">
                Please review your lock details before confirming. This action
                cannot be undone.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between py-2">
                <span className="text-[#4D5562]">Asset</span>
                <span className="font-semibold">{amount} SUI</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#4D5562]">Duration</span>
                <span className="font-semibold">{selectedDuration} days</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#4D5562]">Unlock Date</span>
                <span className="font-semibold">{unlockDate}</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg mb-4 flex gap-2">
              <IoWarningOutline className="text-amber-600 text-xl flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-amber-800 mb-1">
                  Important Notice
                </p>
                <p className="text-amber-700">
                  Your assets will be locked in Scallop protocol to earn yield.
                  Early withdrawal incurs a 2% penalty.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-[50px]">
              <button
                type="button"
                onClick={() => setConfirmLock(false)}
                disabled={isLoading}
                className="bg-white border border-[#4D5562] rounded-md w-[97px] h-[53px] font-semibold text-[#4D5562] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLock}
                disabled={isLoading || !currentAccount}
                className="bg-[#00076C] disabled:opacity-60 rounded-md w-[168px] h-[53px] font-semibold text-[20px] text-white"
              >
                {isLoading ? "Creating..." : "Confirm Lock"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SUCCESS MODAL ==================== */}
      {lockSuccess && (
        <div className="z-[1100] fixed inset-0 flex justify-center items-center bg-black/50 p-4 font-sans">
          <div className="relative bg-white shadow-lg mx-auto p-8 rounded-lg w-full max-w-md text-center">
            <div className="flex flex-col items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <PiCheckSquareOffsetBold className="text-green-600 text-5xl" />
              </div>
              <h2 className="mt-4 font-extrabold text-[#00076C] text-2xl">
                Lock Created Successfully!
              </h2>
              <p className="mt-2 text-[#4D5562] text-base">
                Your assets have been locked in Scallop and will start earning
                yield.
              </p>

              {lockerId && (
                <div className="mt-4 w-full bg-gray-50 p-3 rounded text-left text-sm">
                  <p className="text-[#4D5562] mb-1">
                    <strong>Lock ID:</strong>
                  </p>
                  <p className="font-mono text-xs break-all text-[#00076C]">
                    {lockerId}
                  </p>
                  {txHash && (
                    <>
                      <p className="text-[#4D5562] mt-2 mb-1">
                        <strong>Transaction:</strong>
                      </p>
                      <p className="font-mono text-xs break-all text-[#00076C]">
                        {txHash}
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={closeSuccess}
              className="bg-[#00076C] hover:opacity-90 mt-6 py-3 rounded-lg w-full font-semibold text-white text-lg transition-opacity"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Confetti Effect */}
      {showConfetti &&
        createPortal(
          <div className="z-[2000] fixed inset-0 flex justify-center items-center overflow-hidden pointer-events-none">
            <div className="text-6xl animate-bounce">🎉</div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default CreateLockToken;
