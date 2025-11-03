import React, { useState } from "react";
import { FaCheck } from "react-icons/fa";
import { MdOutlineDateRange } from "react-icons/md";

function CreateLockNft() {
  const [selectDate, setSelectDate] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(30);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  return (
    <div className='flex justify-center items-center py-10 w-full'>
      <form className='flex flex-col gap-6 bg-white shadow-lg p-8 border border-[#E3E6ED] rounded-2xl w-full max-w-2xl'>
        {/* Select NFT */}
        <section>
          <h2 className='mb-4 font-bold text-[#2D2F34] text-lg'>Select NFT</h2>
          <div className='gap-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    i === 0
                      ? "border-[#00076C] bg-[#F7F9FF] shadow-md"
                      : "border-gray-200 hover:border-[#00076C]/50"
                  }`}
                >
                  <div className='flex justify-between items-center mb-1'>
                    <h2
                      className={`font-semibold text-[15px] ${
                        i === 0 ? "text-[#00076C]" : "text-gray-700"
                      }`}
                    >
                      SUI Punk #{123 + i}
                    </h2>
                    {i === 0 && (
                      <span className='bg-[#00076C] p-1 rounded-full text-white'>
                        <FaCheck className='text-sm' />
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-sm ${
                      i === 0 ? "text-[#00076C]" : "text-gray-600"
                    }`}
                  >
                    SUI Punks
                  </p>
                  <span className='inline-block bg-gray-100 mt-2 px-2 py-1 rounded-md text-gray-700 text-xs'>
                    Rare
                  </span>
                </div>
              ))}
          </div>
        </section>

        {/* Lock Duration */}
        <section>
          <label className='block mb-2 font-bold text-[#2D2F34] text-[16px]'>
            Lock Duration
          </label>
          <div className='flex flex-wrap gap-3 mb-4'>
            {[30, 60, 90, 120].map((days) => (
              <button
                key={days}
                type='button'
                onClick={() => {
                  setSelectedDuration(days);
                  const targetDate = new Date();
                  targetDate.setDate(targetDate.getDate() + days);
                  setSelectedDate(targetDate.toISOString().split("T")[0]);
                }}
                className={`px-4 py-2 rounded-lg border font-semibold text-[15px] transition-all duration-200 ${
                  selectedDuration === days
                    ? "bg-[#00076C] text-white border-[#00076C]"
                    : "bg-white text-[#4D5562] border-[#4D5562] hover:bg-[#00076C]/10"
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>

          {/* Custom Date */}
          <div className='relative flex flex-col gap-2'>
            <button
              type='button'
              onClick={() => setSelectDate(!selectDate)}
              className='flex items-center bg-white px-3 border border-[#4D5562] hover:border-[#00076C] rounded-lg w-full h-[48px] font-semibold text-[#4D5562] text-[16.05px] transition-all duration-200'
            >
              <MdOutlineDateRange className='mr-2 text-[18px]' />
              <span className='truncate'>
                {selectedDate ? selectedDate : "Pick a custom date"}
              </span>
            </button>

            {selectDate && (
              <input
                onChange={handleDateChange}
                type='date'
                className='top-[52px] left-0 z-10 absolute bg-white shadow-md p-2 border-[#00076C] border-2 rounded-lg text-[16px]'
              />
            )}
          </div>
        </section>

        {/* Yield */}
        <div className='flex justify-between items-center bg-[#F7F9FF] p-4 border border-[#E3E6ED] rounded-xl'>
          <div>
            <h3 className='font-semibold text-[#2D2F34] text-[15px]'>
              Estimated Yield (Annual)
            </h3>
            <p className='text-[#4D5562] text-sm'>
              Based on current market conditions and lock duration
            </p>
          </div>
          <div className='font-bold text-[#00076C] text-[18px]'>+98.76 SUI</div>
        </div>

        {/* Memo */}
        <div>
          <label className='block mb-2 font-bold text-[#2D2F34] text-[16px]'>
            Memo (Optional)
          </label>
          <textarea
            className='p-3 border border-[#4D5562] focus:border-[#00076C] rounded-lg focus:outline-none w-full text-[#4D5562] text-[15px] placeholder:text-[#9CA3AF] transition-all duration-200'
            placeholder='Reason for lock (e.g., Long-term holding, Yield farming...)'
          ></textarea>
        </div>

        {/* Action Buttons */}
        <div className='flex justify-end gap-4 mt-4'>
          <button
            type='button'
            className='bg-[#00076C] hover:bg-[#00076C]/90 px-6 py-2 rounded-lg font-semibold text-white transition-all duration-200'
          >
            Confirm Lock
          </button>
          <button
            type='button'
            className='hover:bg-gray-100 px-6 py-2 border border-[#4D5562] rounded-lg font-semibold text-[#4D5562] transition-all duration-200'
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateLockNft;
