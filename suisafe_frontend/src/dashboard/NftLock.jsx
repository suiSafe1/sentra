import React from "react";
import { useNavigate } from "react-router-dom";

function NftLock() {
  const navigate = useNavigate();

  const calendar = (
    <svg
      width='17'
      height='17'
      viewBox='0 0 17 17'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M13.7807 2.17661H12.1924V1.64717C12.1924 1.50676 12.1366 1.37209 12.0373 1.27281C11.938 1.17352 11.8033 1.11774 11.6629 1.11774C11.5225 1.11774 11.3878 1.17352 11.2886 1.27281C11.1893 1.37209 11.1335 1.50676 11.1335 1.64717V2.17661H5.83911V1.64717C5.83911 1.50676 5.78333 1.37209 5.68405 1.27281C5.58476 1.17352 5.45009 1.11774 5.30968 1.11774C5.16926 1.11774 5.0346 1.17352 4.93531 1.27281C4.83602 1.37209 4.78024 1.50676 4.78024 1.64717V2.17661H3.19193C2.9111 2.17661 2.64177 2.28817 2.44319 2.48675C2.24462 2.68532 2.13306 2.95465 2.13306 3.23548V13.8242C2.13306 14.1051 2.24462 14.3744 2.44319 14.573C2.64177 14.7715 2.9111 14.8831 3.19193 14.8831H13.7807C14.0615 14.8831 14.3308 14.7715 14.5294 14.573C14.728 14.3744 14.8395 14.1051 14.8395 13.8242V3.23548C14.8395 2.95465 14.728 2.68532 14.5294 2.48675C14.3308 2.28817 14.0615 2.17661 13.7807 2.17661ZM13.7807 13.8242H3.19193V6.41211H13.7807V13.8242Z'
        fill='#4D5562'
      />
    </svg>
  );

  const clock = (
    <svg
      width='14'
      height='14'
      viewBox='0 0 14 14'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M6.99572 0.298041C5.70848 0.298041 4.45014 0.679753 3.37984 1.39491...'
        fill='#4D5562'
      />
    </svg>
  );

  const trending = (
    <svg
      width='14'
      height='9'
      viewBox='0 0 14 9'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M13.055 0.772675V4.47873C13.055 4.6016 13.0061 4.71943...'
        fill='#4D5562'
      />
    </svg>
  );

  const nftData = [
    {
      name: "Cryptopunk #1234",
      amount: "2 NFT",
      startDate: "2025-06-16",
      endDate: "2025-12-15",
      timeRemaining: "127 days left",
      progressWidth: "w-3/5",
      status: "Active",
      yieldEarned: "125.50 SUI",
      buttonLabel: "Locked",
      isExpired: false,
    },
    {
      name: "Cryptopunk #1234",
      amount: "7 NFT",
      startDate: "2025-06-16",
      endDate: "2025-12-15",
      timeRemaining: "Expired",
      progressWidth: "w-full",
      status: "Active",
      yieldEarned: "125.50 SUI",
      buttonLabel: "Withdraw",
      isExpired: true,
    },
  ];

  const handleClick = (label) => {
    if (label === "Withdraw") navigate("/withdraw");
  };

  return (
    <>
      {nftData.map((nft, index) => (
        <div
          key={index}
          className='flex items-center gap-3 bg-white hover:shadow-lg my-2 p-6 border border-[#00076C] rounded-xl hover:scale-105 transition-all duration-300 cursor-pointer'
        >
          <section className='flex justify-between items-center w-full'>
            {/* NFT Info */}
            <div className='flex items-center gap-3'>
              <div>
                <h3 className='font-bold text-[#00076C] text-[15px]'>
                  {nft.name}
                </h3>
                <p className='font-medium text-[#4D5562] text-[13px]'>
                  {nft.amount}
                </p>
              </div>
            </div>

            {/* Duration */}
            <div className='flex flex-col gap-1'>
              <p className='flex items-center gap-1 font-medium text-[#4D5562] text-[13px]'>
                {calendar} Duration
              </p>
              <p className='font-medium text-[#00076C] text-[13px]'>
                {nft.startDate} <br />
                <span className='font-medium text-[#4D5562] text-[12px]'>
                  to {nft.endDate}
                </span>
              </p>
            </div>

            {/* Time Remaining + Status + Yield */}
            <div className='flex items-center gap-20'>
              <div className='flex items-center gap-8'>
                <div className='flex flex-col gap-1 w-[260px]'>
                  <p className='flex items-center gap-1 font-medium text-[#4D5562] text-[13px]'>
                    {clock} Time Remaining
                  </p>
                  <div className='bg-[#F2F5F9] rounded-full w-full h-2 overflow-hidden'>
                    <div
                      className={`h-full bg-[#001f8c] ${nft.progressWidth}`}
                    ></div>
                  </div>
                  <p className='text-[#4D5562] text-[12px]'>
                    {nft.timeRemaining}
                  </p>
                </div>
                <div>
                  <span className='bg-[#CEFFD4] px-3 py-1 border border-[#3C7E44] rounded-full font-semibold text-[#3C7E44] text-[12px]'>
                    {nft.status}
                  </span>
                </div>
              </div>

              {/* Yield */}
              <div className='flex flex-col gap-1'>
                <p className='flex items-center gap-1 font-medium text-[#4D5562] text-[13px]'>
                  {trending} Yield Earned
                </p>
                <p className='font-bold text-[#3C7E44] text-[15px]'>
                  {nft.yieldEarned}
                </p>
              </div>
            </div>

            {/* Button */}
            <button
              disabled={nft.buttonLabel === "Locked"}
              onClick={() => handleClick(nft.buttonLabel)}
              className={`rounded-lg px-6 py-2.5 text-[14px] font-medium border border-[#00076C] transition-all duration-300 ${
                nft.buttonLabel === "Locked"
                  ? "bg-white text-[#00076C] cursor-not-allowed"
                  : "bg-white text-[#00076C] hover:bg-[#00076C] hover:text-white"
              }`}
            >
              {nft.buttonLabel}
            </button>
          </section>
        </div>
      ))}

      <div className='flex justify-end mt-4'>
        <button className='font-medium text-[#00076C] text-[14px] hover:underline'>
          See All
        </button>
      </div>
    </>
  );
}

export default NftLock;
