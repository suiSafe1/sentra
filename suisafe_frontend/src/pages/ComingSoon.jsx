import React from "react";

/**
 * An inline SVG component for a Rocket icon.
 */
const RocketIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='48'
    height='48'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className='w-12 h-12 text-[#00076C]'
  >
    <path d='M4.5 16.5c-1.5 1.5-1.5 4.5 0 6s4.5 1.5 6 0m0 0c1.5-1.5 1.5-4.5 0-6s-4.5-1.5-6 0m0 0l-1.5-1.5m0 0c-1.5-1.5-1.5-4.5 0-6s4.5-1.5 6 0m0 0c1.5 1.5 1.5 4.5 0 6s-4.5 1.5-6 0m0 0l1.5 1.5m0 0l-6.5-6.5m6.5 6.5l6.5-6.5m-6.5 6.5L10 10l-1.5-1.5m0 0l-6.5-6.5m6.5 6.5L10 10l1.5 1.5m0 0l6.5 6.5m-6.5-6.5L10 10'></path>
  </svg>
);

/**
 * A stylish "Coming Soon" page component.
 * Inspired by the provided CreateLockNft component's aesthetics.
 * This is a self-contained component and can be exported and used anywhere.
 */
const ComingSoon = () => {
  return (
    <div className='flex justify-center items-center bg-[#F7F9FF] px-3 sm:px-6 py-6 w-full min-h-screen font-sans'>
      <div className='flex flex-col items-center gap-6 bg-white shadow-lg p-8 sm:p-12 border border-[#E3E6ED] rounded-2xl w-full max-w-md text-center'>
        {/* Icon */}
        <div className='bg-[#F7F9FF] p-4 border border-[#E3E6ED] rounded-full'>
          <RocketIcon />
        </div>

        {/* Heading */}
        <div className='flex flex-col gap-2'>
          <h1 className='font-bold text-[#00076C] text-4xl sm:text-5xl'>
            COMING SOON
          </h1>
          <h2 className='mb-2 font-bold text-[#2D2F34] text-xl sm:text-2xl'>
            Something Big is Launching
          </h2>
        </div>

        {/* Message */}
        <p className='max-w-xs text-[#4D5562] text-[15px] sm:text-[16px]'>
          We're preparing for takeoff! This new feature is under construction
          and will be available soon.
        </p>

        {/* Action Button */}
        {/* <div className='mt-4 w-full'>
          <a
            href='/'
            onClick={(e) => {
              e.preventDefault();
              // In a real app, you'd use your router's navigation method.
              console.log("Attempting to navigate home...");
            }}
            className='inline-block bg-[#00076C] hover:bg-[#00076C]/90 shadow-md px-6 py-3 rounded-lg w-full sm:w-auto font-semibold text-[15px] text-white transition-all duration-200'
          >
            Go Back Home
          </a>
        </div> */}
      </div>
    </div>
  );
};

export default ComingSoon;
