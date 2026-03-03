import React from "react";

/**
 * An inline SVG component for the AlertTriangle icon.
 * This avoids the need for an external library like lucide-react.
 */
const AlertTriangleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-12 h-12 text-[#00076C]"
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
    <path d="M12 9v4"></path>
    <path d="M12 17h.01"></path>
  </svg>
);

/**
 * A stylish 404 Not Found page component.
 * Inspired by the provided CreateLockNft component's aesthetics.
 * This is a self-contained component and can be exported and used anywhere.
 */
const NotFound = () => {
  return (
    <div className="flex justify-center items-center bg-[#F7F9FF] px-3 sm:px-6 py-6 w-full min-h-screen font-sans">
      <div className="flex flex-col items-center gap-6 bg-white shadow-lg p-8 sm:p-12 border border-[#E3E6ED] rounded-2xl w-full max-w-md text-center">
        {/* Icon */}
        <div className="bg-[#F7F9FF] p-4 border border-[#E3E6ED] rounded-full">
          <AlertTriangleIcon />
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-2">
          <h1 className="font-bold text-[#00076C] text-6xl sm:text-7xl">404</h1>
          <h2 className="mb-2 font-bold text-[#2D2F34] text-2xl sm:text-3xl">
            Page Not Found
          </h2>
        </div>

        {/* Message */}
        <p className="max-w-xs text-[#4D5562] text-[15px] sm:text-[16px]">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>

        {/* Action Button */}
        <div className="mt-4 w-full">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              // In a real app, you'd use your router's navigation method.
              // For this example, we'll just log to the console.
              // In a Next.js/React Router app: router.push('/')
            }}
            className="inline-block bg-[#00076C] hover:bg-[#00076C]/90 shadow-md px-6 py-3 rounded-lg w-full sm:w-auto font-semibold text-[15px] text-white transition-all duration-200"
          >
            Go Back Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
