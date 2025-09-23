import { useState } from "react";

const StepsCarousel = ({ steps }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Handle next slide
  const handleNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % steps.length);
  };

  // Handle previous slide
  const handlePrev = () => {
    setActiveIndex(
      (prevIndex) => (prevIndex - 1 + steps.length) % steps.length
    );
  };

  // Handle indicator click
  const handleIndicatorClick = (index) => {
    setActiveIndex(index);
  };

  return (
    <div className='relative w-full'>
      {/* Slides */}
      <div className='relative rounded-lg h-96 overflow-hidden'>
        {steps.map((step, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === activeIndex
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            }`}
            role='group'
            aria-hidden={i !== activeIndex}
          >
            <div className='top-1/2 left-1/2 absolute flex flex-col justify-center items-center px-4 w-full text-center -translate-x-1/2 -translate-y-1/2'>
              <img
                src={step.icon}
                alt={step.title}
                className='mx-auto mb-4 w-20 h-20'
              />
              <h3 className='mb-2 font-semibold text-[#00076C] text-xl'>
                {step.title}
              </h3>
              <p className='text-[#00076C]/80'>{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Indicators */}
      <div className='bottom-5 left-1/2 z-30 absolute flex space-x-3 -translate-x-1/2'>
        {steps.map((_, i) => (
          <button
            key={i}
            type='button'
            className={`rounded-full w-3 h-3 ${
              i === activeIndex ? "bg-[#00076C] scale-125" : "bg-black/20"
            }`}
            aria-current={i === activeIndex}
            aria-label={`Slide ${i + 1}`}
            onClick={() => handleIndicatorClick(i)}
          ></button>
        ))}
      </div>

      {/* Prev button */}
      <button
        type='button'
        className='group top-0 left-0 z-30 absolute flex justify-center items-center px-4 focus:outline-none h-full cursor-pointer'
        onClick={handlePrev}
        aria-label='Previous slide'
      >
        <span className='inline-flex justify-center items-center bg-white/30 dark:bg-gray-800/30 dark:group-hover:bg-gray-800/60 group-hover:bg-white/50 rounded-full dark:group-focus:ring-gray-800/70 group-focus:ring-4 group-focus:ring-white w-10 h-10'>
          <svg
            className='w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180'
            aria-hidden='true'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 6 10'
          >
            <path
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M5 1 1 5l4 4'
            />
          </svg>
          <span className='sr-only'>Previous</span>
        </span>
      </button>

      {/* Next button */}
      <button
        type='button'
        className='group top-0 right-0 z-30 absolute flex justify-center items-center px-4 focus:outline-none h-full cursor-pointer'
        onClick={handleNext}
        aria-label='Next slide'
      >
        <span className='inline-flex justify-center items-center bg-white/30 dark:bg-gray-800/30 dark:group-hover:bg-gray-800/60 group-hover:bg-white/50 rounded-full dark:group-focus:ring-gray-800/70 group-focus:ring-4 group-focus:ring-white w-10 h-10'>
          <svg
            className='w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180'
            aria-hidden='true'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 6 10'
          >
            <path
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='m1 9 4-4-4-4'
            />
          </svg>
          <span className='sr-only'>Next</span>
        </span>
      </button>
    </div>
  );
};

export default StepsCarousel;
