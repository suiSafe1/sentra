import React, { useState } from "react";
import { Link } from "react-router";
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

function CreateLockToken() {
  const [nftLock, setNftLock] = useState(false);
  const [selectToken, setSelectToken] = useState(false);
  const [confirmLock, setConfirmLock] = useState(false);
  const [selectDate, setSelectDate] = useState(false);
  const [preview, setPreview] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [amount, setAmount] = useState("");
  const [lockSuccess, setLockSuccess] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [memo, setMemo] = useState("");

  const {
    currentAccount,
    isLoading,
    lockerId,
    txHash,
    createLock,
    getUnlockDate,
  } = useCreateLockToken();

  const handleSwitch = (e) => {
    const targetId = e.target.id;
    setNftLock(targetId === "nft");
  };

  const handleDateChange = (e) => setSelectedDate(e.target.value);

  const handleConfirmLock = async () => {
    const res = await createLock(amount, selectedDuration, selectedDate);
    if (res?.success) setLockSuccess(true);
    setConfirmLock(false);
  };

  const unlockDate = getUnlockDate(selectedDuration, selectedDate);

  return (
    <div
      className='flex lg:flex-row flex-col gap-8 rounded-2xl'
      aria-live='polite'
    >
      {/* Left side - form */}
      <div className='flex-1 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] rounded-2xl'>
        <div className='flex items-center gap-2 bg-[#00076C] p-5 rounded-t-2xl font-extrabold text-[20.87px] text-white'>
          <MdOutlineLock className='inline-block w-fit text-[30px]' />
          <h3 className='w-fit'>Create Lock</h3>
        </div>

        <section className='bg-white p-[20px]'>
          <div className='flex bg-[#F2F5F9] mb-[1.2rem] p-[5px] rounded-lg'>
            <button
              id='token'
              onClick={handleSwitch}
              className={`flex-1 p-[0.75rem] border-none  text-[16.05px] font-semibold rounded-lg cursor-pointer transition-all duration-300 ${
                !nftLock ? "bg-[#080d4b] text-white" : ""
              }`}
            >
              Token Lock
            </button>
            <button
              id='nft'
              onClick={handleSwitch}
              className={`flex-1 p-3 border-none  text-[16.05px] font-semibold rounded-[8px] cursor-pointer transition-all duration-300 ${
                nftLock ? "bg-[#00076C] text-white" : ""
              }`}
            >
              NFT Lock
            </button>
          </div>

          {nftLock ? (
            <CreateLockNft />
          ) : (
            <>
              {/* Token field */}
              <div className='relative flex flex-col gap-[10px] mb-4 font-bold text-[#505A6B] text-[16.05px]'>
                <span className='flex items-center gap-2'>
                  <span>Select Token</span>
                  <MdErrorOutline className='inline-block w-fit text-[18px] text-inherit' />
                </span>

                <button
                  type='button'
                  onClick={() => setSelectToken(!selectToken)}
                  className='flex justify-between items-center bg-white px-[10px] border border-[#4D5562] rounded-[8px] w-full h-[48px] font-semibold text-[#4D5562] text-[16.05px]'
                >
                  <span className='truncate'>SUI Token</span>
                  <IoIosArrowDown className='inline-block text-[18px]' />
                </button>

                {selectToken && (
                  <div className='mt-2 token-dropdown'>
                    <p className='text-[#4D5562]'>SUI - Sui Network Token</p>
                  </div>
                )}
              </div>

              {/* Amount field */}
              <div className='relative flex flex-col gap-[10px] mb-4 font-bold text-[#505A6B] text-[16.05px]'>
                <span>Amount</span>
                <div className='relative flex justify-between items-center bg-white px-[10px] border border-[#4D5562] rounded-[8px] h-[48px] font-semibold text-[#4D5562] text-[16.05px]'>
                  <input
                    type='text'
                    placeholder='0.00'
                    value={amount}
                    onChange={(e) =>
                      /^\d*\.?\d*$/.test(e.target.value) &&
                      setAmount(e.target.value)
                    }
                    className='bg-transparent border-none outline-none font-semibold text-[16.05px]'
                    onWheel={(e) => e.currentTarget.blur()}
                    onKeyDown={(e) => {
                      if (["e", "E", "+", "-"].includes(e.key))
                        e.preventDefault();
                    }}
                    inputMode='decimal'
                  />
                  <span
                    className='w-fit font-semibold text-[#00076C] cursor-pointer'
                    role='button'
                    tabIndex={0}
                    onClick={() => {
                      /* TODO: implement max behaviour */
                    }}
                  >
                    Max
                  </span>
                </div>
              </div>

              {/* Date picker */}
              {/* Date picker + Quick durations */}
              <div className='relative flex flex-col gap-[10px] mb-4 font-bold text-[#505A6B] text-[16.05px]'>
                <span>Lock Duration</span>

                {/* Quick duration buttons */}
                <div className='flex flex-wrap gap-2 mb-2'>
                  {[30, 60, 90, 120].map((days) => (
                    <button
                      key={days}
                      onClick={() => {
                        setSelectedDuration(days);
                        const targetDate = new Date();
                        targetDate.setDate(targetDate.getDate() + days);
                        setSelectedDate(targetDate.toISOString().split("T")[0]);
                      }}
                      className={`px-3 py-2 rounded-[8px] border font-semibold text-[15px] transition-all duration-200 ${
                        selectedDuration === days
                          ? "bg-[#00076C] text-white border-[#00076C]"
                          : "bg-white text-[#4D5562] border-[#4D5562]"
                      }`}
                    >
                      {days} days
                    </button>
                  ))}
                </div>

                {/* Custom date picker */}
                <button
                  type='button'
                  onClick={() => setSelectDate(!selectDate)}
                  className='flex justify-start items-center bg-white px-[10px] border border-[#4D5562] rounded-[8px] w-full h-[48px] font-semibold text-[#4D5562] text-[16.05px]'
                >
                  <MdOutlineDateRange className='inline-block mr-2 text-[18px]' />
                  <span className='truncate'>
                    {selectedDate ? selectedDate : "Pick a custom date"}
                  </span>
                </button>

                {selectDate && (
                  <input
                    type='date'
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      const diffDays = Math.ceil(
                        (new Date(e.target.value).getTime() -
                          new Date().getTime()) /
                          (24 * 60 * 60 * 1000)
                      );
                      setSelectedDuration(diffDays);
                    }}
                    min={new Date().toISOString().split("T")[0]}
                    className='top-[50px] left-0 z-[10] absolute bg-white p-[10px] border-[#00076C] border-2 rounded-[8px] text-[16.05px]'
                  />
                )}
              </div>

              {/* Memo */}
              <div className='relative flex flex-col gap-[10px] mb-4 font-bold text-[#505A6B] text-[16.05px]'>
                <span>Memo (Optional)</span>
                <textarea
                  className='bg-white p-[10px] border border-[#4D5562] rounded-[8px] outline-none w-full h-[85px] font-semibold text-[16.05px] resize-y'
                  placeholder='Reason for lock...'
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className='flex gap-4 mt-[1.5rem]'>
                <button
                  className='flex-1 bg-[#00076C] disabled:opacity-60 py-[0.8rem] border-none rounded-[6px] font-semibold text-[20px] text-white cursor-pointer'
                  onClick={() => setConfirmLock(true)}
                  disabled={
                    !currentAccount || !amount || parseFloat(amount) <= 0
                  }
                >
                  {isLoading ? "Processing..." : "Confirm Lock"}
                </button>

                <Link
                  to='/dashboard'
                  className='flex justify-center items-center bg-white py-[0.8rem] border border-[#4D5562] rounded-[6px] w-[144px] font-semibold text-[#4D5562] text-[20px] no-underline'
                >
                  Cancel
                </Link>
              </div>
            </>
          )}
        </section>
      </div>

      {/* Right side - Preview */}
      <section className='flex flex-col justify-between gap-5'>
        <div className='bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] rounded-xl overflow-hidden'>
          <div className='flex items-center gap-2 bg-[#00076C] p-5 font-extrabold text-[20.87px] text-white'>
            <MdErrorOutline className='inline-block text-[30px]' />
            <h3 className='font-bold text-[20px]'>Lock Summary</h3>
          </div>

          {preview && amount ? (
            <div className='bg-white p-[20px]'>
              <div className='flex items-center gap-[12px] bg-[#F9FAFC] p-[12px] rounded-[8px]'>
                <div className='bg-[#F9FAFC] w-fit text-[24px]'>🪙</div>
                <div>
                  <h2 className='m-0 font-extrabold text-[#101729] text-[16.88px]'>
                    {amount} SUI
                  </h2>
                  <p className='m-0 font-semibold text-[#4D5562] text-[14.47px]'>
                    SUI Token
                  </p>
                </div>
              </div>

              <hr className='my-[16px] border-[#e2e2e2] border-t' />

              <div className='flex justify-between items-center my-2'>
                <div className='flex items-center gap-1 font-semibold text-[#4D5562] text-[16.02px]'>
                  <MdOutlineDateRange className='inline-block text-[16px]' />{" "}
                  <span>Lock Start</span>
                </div>
                <div className='font-semibold text-[16.02px]'>Today</div>
              </div>

              <div className='flex justify-between items-center my-2'>
                <div className='flex items-center gap-1 font-semibold text-[#4D5562] text-[16.02px]'>
                  <GoUnlock className='inline-block text-[16px]' />{" "}
                  <span>Unlock Date</span>
                </div>
                <div className='font-semibold text-[16.02px]'>{unlockDate}</div>
              </div>

              <div className='flex justify-between items-center my-2'>
                <div className='flex items-center gap-1 font-semibold text-[#4D5562] text-[16.02px]'>
                  <MdErrorOutline className='inline-block text-[16px]' />{" "}
                  <span>Duration</span>
                </div>
                <div className='font-semibold text-[16.02px]'>
                  {selectedDate
                    ? `${Math.ceil(
                        (new Date(selectedDate).getTime() -
                          new Date().getTime()) /
                          (24 * 60 * 60 * 1000)
                      )} days`
                    : `${selectedDuration} days`}
                </div>
              </div>

              <hr className='my-[16px] border-[#e2e2e2] border-t' />

              <div className='flex justify-between items-center my-2'>
                <div className='flex items-center gap-1 font-semibold text-[#4D5562] text-[16.02px]'>
                  <PiGasPump className='inline-block text-[16px]' />{" "}
                  <span>Gas Fee</span>
                </div>
                <div className='font-semibold text-[16.02px]'>~0.05 SUI</div>
              </div>

              {memo && (
                <>
                  <hr className='my-[16px] border-[#e2e2e2] border-t' />
                  <div className='flex justify-between items-center my-2'>
                    <div className='font-semibold text-[#4D5562] text-[16.02px]'>
                      Memo
                    </div>
                    <div className='font-semibold text-[16.02px]'>{memo}</div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className='flex flex-col justify-center items-center gap-5 p-8 ring-2 w-full font-semibold text-[#99A5B7] text-center'>
              <MdErrorOutline className='text-[#99A5B7] text-[42px]' />
              <p>Complete the form to see your lock preview</p>
            </div>
          )}
        </div>

        {lockSuccess && (
          <div className='flex flex-col justify-center gap-1 bg-white px-[20px] rounded-[16px] w-auto h-[126px]'>
            <h4 className='font-semibold text-[#000000] text-[16.75px]'>
              ✅ Lock Created Successfully!
            </h4>
            <p className='font-medium text-[#4D5562] text-[14.62px]'>
              Your assets have been locked and will start earning yield.
            </p>
            {lockerId && (
              <div className='mt-2'>
                <p className='text-[#4D5562] text-[14.62px]'>
                  <strong className='font-bold text-black'>Lock ID:</strong>{" "}
                  {lockerId}
                </p>
                <p className='text-[#4D5562] text-[14.62px]'>
                  <strong className='font-bold text-black'>Transaction:</strong>{" "}
                  {txHash}
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Confirm Modal */}
      {confirmLock && (
        <div className='z-[1000] fixed inset-0 flex justify-center items-center bg-black/50 font-sans'>
          <div className='relative bg-white shadow-[0_4px_15px_rgba(0,0,0,0.2)] p-[21px_29px] rounded-[12px] w-[400px]'>
            <div className='flex flex-col gap-2 mb-[30px]'>
              <h2 className='flex items-center gap-1 font-extrabold text-[#00076C] text-[21.27px]'>
                <PiCheckSquareOffsetBold className='inline-block text-[18px]' />{" "}
                Confirm Lock
              </h2>
              <p className='text-[#4D5562] text-[16.55px]'>
                Please review your lock details before confirming. This action
                cannot be undone.
              </p>
            </div>

            <div className='bg-[#F9FAFC] mb-4 p-4 rounded-[0.5rem]'>
              <div className='flex justify-between mb-2 font-semibold text-[#4D5562] text-[16.02px]'>
                <span>Asset</span>
                <span className='font-extrabold text-black'>{amount} SUI</span>
              </div>
              <div className='flex justify-between mb-2 font-semibold text-[#4D5562] text-[16.02px]'>
                <span>Lock Duration</span>
                <span className='font-extrabold text-black'>
                  {selectedDate
                    ? `${Math.ceil(
                        (new Date(selectedDate).getTime() -
                          new Date().getTime()) /
                          (24 * 60 * 60 * 1000)
                      )} days`
                    : `${selectedDuration} days`}
                </span>
              </div>
              <div className='flex justify-between mb-2 font-semibold text-[#4D5562] text-[16.02px]'>
                <span>Unlock Date</span>
                <span className='font-extrabold text-black'>{unlockDate}</span>
              </div>
              <div className='flex justify-between mb-2 font-semibold text-[#4D5562] text-[16.02px]'>
                <span>Est. Yield</span>
                <span className='font-bold text-[#16a34a] text-[16.02px]'>
                  +{(parseFloat(amount || "0") * 0.08).toFixed(2)} SUI
                </span>
              </div>
              <div className='flex justify-between font-semibold text-[#4D5562] text-[16.02px]'>
                <span>Wallet</span>
                <span className='font-extrabold text-black'>
                  {currentAccount?.address
                    ? `${currentAccount.address.slice(
                        0,
                        6
                      )}...${currentAccount.address.slice(-4)}`
                    : ""}
                </span>
              </div>
            </div>

            <div className='flex items-start gap-3 bg-[#FEFCEA] mb-4 p-5 border border-[#B05900] rounded-lg text-[#7E4F1F]'>
              <IoWarningOutline className='text-[20px]' />
              <div className='flex flex-col gap-2'>
                <span className='font-bold text-[16.68px]'>
                  Important Notice
                </span>
                <p className='font-medium text-[17.05px]'>
                  Once locked, your assets cannot be accessed until unlock date.
                  Make sure you're comfortable with the lock duration.
                </p>
              </div>
            </div>

            <div className='flex justify-end gap-2 mt-[50px]'>
              <button
                onClick={() => setConfirmLock(false)}
                disabled={isLoading}
                className='bg-white border border-[#4D5562] rounded-[6px] w-[97px] h-[53px] font-semibold text-[#4D5562] text-[20px]'
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLock}
                disabled={isLoading || !currentAccount}
                className='bg-[#00076C] border border-[#00076C] rounded-[6px] w-[168px] h-[53px] font-semibold text-[20px] text-white'
              >
                {isLoading ? "Creating..." : "Confirm Lock"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateLockToken;
