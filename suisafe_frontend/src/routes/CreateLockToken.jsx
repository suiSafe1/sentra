import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  MdOutlineLock,
  MdOutlineDateRange,
  MdErrorOutline,
} from "react-icons/md";
import { IoIosArrowDown } from "react-icons/io";
import { GoUnlock } from "react-icons/go";
import { PiGasPump, PiCheckSquareOffsetBold } from "react-icons/pi";
import { IoWarningOutline } from "react-icons/io5";
import { useCreateLockToken } from "../hooks/useCreateLockToken";
import CreateLockNft from "../pages/CreateLockNft";
import ConfettiExplosion from "react-confetti-explosion";
import { useWindowSize } from "react-use";
import sui from "../assets/sui.png";
import wal from "../assets/wal.png";
import deep from "../assets/deep.png";
import usdc from "../assets/usdc.png";
import scal from "../assets/scal.png";


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
  const [lockDescription, setLockDescription] = useState("");
  const { width, height } = useWindowSize();

  const {
    currentAccount,
    isLoading,
    lockerId,
    txHash,
    createLock,
    getUnlockDate,
  } = useCreateLockToken();

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

  const handleConfirmLock = async () => {
    const res = await createLock(amount, selectedDuration, selectedDate);
    if (res?.success) {
      setConfirmLock(false);
      setLockSuccess(true);
    } else {
      setConfirmLock(false);
    }
  };

  const closeSuccess = () => {
    setLockSuccess(false);
    setShowConfetti(false);
  };

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

  const unlockDate = getUnlockDate(selectedDuration, selectedDate);

  /* --------------------------------------------------------------
     Confetti portal
  -------------------------------------------------------------- */
  const confettiPortal = showConfetti
    ? createPortal(
        <div className='z-2000 fixed inset-0 flex justify-center items-center overflow-hidden pointer-events-none'>
          <ConfettiExplosion
            force={0.8}
            duration={3000}
            particleCount={450}
            width={width > 0 ? width : 1600}
            height={height > 0 ? height : 1600}
            colors={["#00076C", "#00D1FF", "#FFD700", "#FF6B6B", "#4ECDC4"]}
          />
        </div>,
        document.body
      )
    : null;

    const tokens = [
      {
        symbol: "SUI",
        icon: sui, // Assumes 'sui' is an imported image
        type: "0x2::sui::SUI",
        decimals: 9,
      },
      {
        symbol: "USDC",
        icon: usdc, // Assumes 'usdc' is an imported image
        type: "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
        decimals: 6,
      },
      {
        symbol: "WAL",
        icon: wal, // Assumes 'wal' is an imported image
        type: null,
        decimals: null,
      },
      {
        symbol: "DEEP",
        icon: deep, // Assumes 'deep' is an imported image
        type: null,
        decimals: null,
      },
      {
        symbol: "SCA",
        icon: scal, // Assumes 'scal' is an imported image
        type: null,
        decimals: null,
      },
    ];

    // ... Inside your component
    // Store the whole selected token object, defaulting to SUI
    const [selectedToken, setSelectedToken] = useState(tokens[0]);

  return (
    <div
      className='flex lg:flex-row flex-col gap-8 m-4 rounded-2xl'
      aria-live='polite'
    >
      {/* ==================== LEFT – FORM ==================== */}
      <div className='flex-1 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] rounded-2xl'>
        <div className='flex items-center gap-2 bg-[#00076C] p-5 rounded-t-2xl font-extrabold text-[20.87px] text-white'>
          <MdOutlineLock className='text-[30px]' />
          <h3>Create Lock</h3>
        </div>

        <section className='bg-white p-5'>
          {/* Token/NFT Switch */}
          <div className='flex bg-[#F2F5F9] mb-[1.2rem] p-[5px] rounded-lg'>
            <button
              id='token'
              type='button'
              onClick={handleSwitch}
              className={`flex-1 p-3 text-[16.05px] font-semibold rounded-lg transition-all ${
                !nftLock ? "bg-[#00076C] text-white" : "text-[#4D5562]"
              }`}
            >
              Token Lock
            </button>
            <button
              id='nft'
              type='button'
              onClick={handleSwitch}
              className={`flex-1 p-3 text-[16.05px] font-semibold rounded-lg transition-all ${
                nftLock ? "bg-[#00076C] text-white" : "text-[#4D5562]"
              }`}
            >
              NFT Lock
            </button>
          </div>

          {nftLock ? (
            <CreateLockNft />
          ) : (
            <>
              {/* Select Token */}
              <div className='relative flex flex-col gap-2 mb-4 font-bold text-[#505A6B]'>
                <span className='flex items-center gap-2'>
                  Select Token <MdErrorOutline />
                </span>
                <button
                  type='button'
                  onClick={() => setSelectToken(!selectToken)}
                  className='flex justify-between items-center bg-white px-2.5 border border-[#4D5562] rounded-lg h-12 font-semibold text-[#4D5562]'
                >
                  {/* Dynamic content for the selected token */}
                  <span className='flex items-center gap-2'>
                    <img
                      src={selectedToken.icon}
                      alt={selectedToken.symbol}
                      className='h-8'
                    />
                    <span>{selectedToken.symbol} Token</span>
                  </span>
                  <IoIosArrowDown />
                </button>

                {/* The scrollable dropdown menu */}
                {selectToken && (
                  <div className='top-full z-10 absolute bg-white shadow-lg mt-1 border rounded-md w-full max-h-60 overflow-y-auto'>
                    {tokens.map((token) => (
                      <div
                        key={token.symbol} // Assumes symbols are unique
                        className='flex items-center gap-2 hover:bg-gray-100 px-3 py-2 cursor-pointer'
                        onClick={() => {
                          setSelectedToken(token); // Set the clicked token as selected
                          setSelectToken(false); // Close the dropdown
                        }}
                      >
                        <img
                          src={token.icon}
                          alt={token.symbol}
                          className='h-8'
                        />
                        <span>{token.symbol}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Amount */}
              <div className='flex flex-col gap-2 mb-4 font-bold text-[#505A6B]'>
                <span>Amount</span>
                <div className='flex justify-between items-center bg-white px-2.5 border border-[#4D5562] rounded-lg h-12'>
                  <input
                    type='text'
                    placeholder='0.00'
                    value={amount}
                    onChange={(e) =>
                      /^\d*\.?\d*$/.test(e.target.value) &&
                      setAmount(e.target.value)
                    }
                    className='flex-1 bg-transparent border-none outline-none font-semibold text-[16.05px]'
                  />
                  <span className='font-semibold text-[#00076C] cursor-pointer'>
                    Max
                  </span>
                </div>
              </div>

              {/* Lock Duration */}
              <div className='flex flex-col gap-2 mb-4 font-bold text-[#505A6B]'>
                <span>Lock Duration</span>
                <div className='flex flex-wrap gap-2 mb-2'>
                  {[30, 60, 90, 120].map((days) => (
                    <button
                      key={days}
                      type='button'
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
                <div className='relative'>
                  <button
                    type='button'
                    onClick={() => setSelectDate(!selectDate)}
                    className='flex items-center bg-white px-2.5 border border-[#4D5562] rounded-lg w-full h-12 font-semibold text-[#4D5562]'
                  >
                    <MdOutlineDateRange className='mr-2' />
                    {selectedDate || "Pick a custom date"}
                  </button>
                  {selectDate && (
                    <input
                      type='date'
                      value={selectedDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className='top-full left-0 z-10 absolute bg-white shadow-lg mt-1 p-2 border-[#00076C] border-2 rounded-lg'
                    />
                  )}
                </div>
              </div>

              <div className='flex flex-col gap-2 mb-4 font-bold text-[#505A6B]'>
                <span>Lock Description (30 Chars Max)</span>
                <textarea
                  placeholder='Example... House Rent'
                  value={lockDescription}
                  onChange={(e) => setLockDescription(e.target.value)}
                  maxLength={"30"}
                  className='bg-white p-2.5 border border-[#4D5562] rounded-lg outline-none h-[85px] font-semibold resize-y'
                />
              </div>

              {/* Memo */}
              <div className='flex flex-col gap-2 mb-4 font-bold text-[#505A6B]'>
                <span>Memo (Optional)</span>
                <textarea
                  placeholder='Reason for lock...'
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className='bg-white p-2.5 border border-[#4D5562] rounded-lg outline-none h-[85px] font-semibold resize-y'
                />
              </div>

              {/* Action Buttons */}
              <div className='flex gap-4 mt-6'>
                <button
                  type='button'
                  className='flex-1 bg-[#00076C] disabled:opacity-60 py-[0.8rem] rounded-md font-semibold text-white text-sm md:text-lg'
                  onClick={() => setConfirmLock(true)}
                  disabled={
                    !currentAccount || !amount || parseFloat(amount) <= 0
                  }
                >
                  {isLoading ? "Processing..." : "Confirm Lock"}
                </button>
                <Link
                  to='/dashboard'
                  className='flex justify-center items-center bg-white py-[0.8rem] border border-[#4D5562] rounded-md w-36 font-semibold text-[#4D5562] text-sm md:text-lg'
                >
                  Cancel
                </Link>
              </div>
            </>
          )}
        </section>
      </div>

      {/* ==================== RIGHT – PREVIEW ==================== */}
      <section className='flex flex-col justify-between gap-5'>
        <div className='bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] rounded-xl overflow-hidden'>
          <div className='flex items-center gap-2 bg-[#00076C] p-5 font-extrabold text-[20.87px] text-white'>
            <MdErrorOutline className='text-[30px]' />
            <h3>Lock Summary</h3>
          </div>

          {amount ? (
            <div className='bg-white p-5'>
              <div className='flex items-center gap-3 bg-[#F9FAFC] p-3 rounded-lg'>
                <div className='text-[24px]'>Coin</div>
                <div>
                  <h2 className='font-extrabold text-[#101729] text-[16.88px]'>
                    {amount} SUI
                  </h2>
                  <p className='font-semibold text-[#4D5562] text-[14.47px]'>
                    SUI Token
                  </p>
                </div>
              </div>

              <hr className='my-4 border-[#e2e2e2]' />
              <div className='flex justify-between items-center'>
                <span className='flex items-center gap-1 font-semibold text-[#4D5562]'>
                  <MdOutlineDateRange /> Lock Start
                </span>
                <span className='font-semibold'>Today</span>
              </div>

              <div className='flex justify-between items-center my-2'>
                <span className='flex items-center gap-1 font-semibold text-[#4D5562]'>
                  <GoUnlock /> Unlock Date
                </span>
                <span className='font-semibold'>{unlockDate}</span>
              </div>

              <div className='flex justify-between items-center my-2'>
                <span className='flex items-center gap-1 font-semibold text-[#4D5562]'>
                  <MdErrorOutline /> Duration
                </span>
                <span className='font-semibold'>{selectedDuration} days</span>
              </div>

              <hr className='my-4 border-[#e2e2e2]' />
              <div className='flex justify-between items-center my-2'>
                <span className='flex items-center gap-1 font-semibold text-[#4D5562]'>
                  <PiGasPump /> Gas Fee
                </span>
                <span className='font-semibold'>~0.05 SUI</span>
              </div>

              {memo && (
                <>
                  <hr className='my-4 border-[#e2e2e2]' />
                  <div className='flex justify-between items-center'>
                    <span className='font-semibold text-[#4D5562]'>Memo</span>
                    <span className='font-semibold'>{memo}</span>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className='flex flex-col justify-center items-center gap-5 p-8 font-semibold text-[#99A5B7] text-center'>
              <MdErrorOutline className='text-[42px]' />
              <p>Complete the form to see your lock preview</p>
            </div>
          )}
        </div>
      </section>

      {/* ==================== CONFIRM MODAL ==================== */}
      {confirmLock && (
        <div className='z-1000 fixed inset-0 flex justify-center items-center bg-black/50 p-4 font-sans'>
          <div className='relative bg-white shadow-[0_4px_15px_rgba(0,0,0,0.2)] p-[21px_29px] rounded-xl w-full max-w-md'>
            <div className='flex flex-col gap-2 mb-[30px]'>
              <h2 className='flex items-center gap-1 font-extrabold text-[#00076C] text-md sm:text-[21.27px]'>
                <PiCheckSquareOffsetBold /> Confirm Lock
              </h2>
              <p className='text-[#4D5562] text-[16.55px]'>
                Please review your lock details before confirming. This action
                cannot be undone.
              </p>
            </div>

            <div className='flex justify-end gap-2 mt-[50px]'>
              <button
                type='button'
                onClick={() => setConfirmLock(false)}
                className='bg-white border border-[#4D5562] rounded-md w-[97px] h-[53px] font-semibold text-[#4D5562]'
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={handleConfirmLock}
                disabled={isLoading || !currentAccount}
                className='bg-[#00076C] disabled:opacity-60 rounded-md w-[168px] h-[53px] font-semibold text-white md:text-[20px] text-sm'
              >
                {isLoading ? "Creating..." : "Confirm Lock"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SUCCESS MODAL ==================== */}
      {lockSuccess && (
        <div className='z-1100 fixed inset-0 flex justify-center items-center bg-black/50 p-4 font-sans'>
          <div className='relative bg-white shadow-lg mx-auto p-8 rounded-lg w-full max-w-md text-center'>
            <div className='flex flex-col items-center'>
              <div className='bg-green-100 p-3 rounded-full'>
                <PiCheckSquareOffsetBold className='text-green-600 text-5xl' />
              </div>
              <h2 className='mt-4 font-extrabold text-[#00076C] text-2xl'>
                Lock Created Successfully!
              </h2>
              {/* ======================================================== */}
              {/* ================== HERE IS THE FIX =================== */}
              {/* ======================================================== */}
              <p className='mt-2 text-[#4D5562] text-base'>
                Your assets have been locked and will start earning yield.
              </p>
              {/* ======================================================== */}
              {/* ================== END OF FIX ========================== */}
              {/* ======================================================== */}
            </div>

            <button
              type='button'
              onClick={closeSuccess}
              className='bg-[#00076C] hover:opacity-90 mt-6 py-3 rounded-lg w-full font-semibold text-white text-lg transition-opacity'
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------
         CONFETTI PORTAL – ALWAYS ON TOP
      -------------------------------------------------------------- */}
      {confettiPortal}
    </div>
  );
}

export default CreateLockToken;
