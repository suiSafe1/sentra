import React from "react";

const InputField = ({
  label,
  placeholder,
  isSelect = false,
  isAmount = false,
  value = "",
}) => (
  <div className="flex flex-col">
    <label className="mb-2 font-medium text-black text-sm">{label}</label>
    <div
      className={`flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden ${
        isSelect ? "cursor-pointer" : ""
      }`}
    >
      {isAmount ? (
        <>
          <input
            type="number"
            defaultValue={value}
            className="flex-grow bg-transparent p-3 focus:outline-none text-black placeholder-gray-500"
            placeholder={placeholder}
            min="0"
            step="0.01"
          />
          <button className="bg-gray-100 hover:bg-gray-200 px-4 py-3 font-semibold text-black transition-colors">
            Max
          </button>
        </>
      ) : (
        <>
          <span className="flex-grow p-3 text-black">
            {placeholder || value}
          </span>
          {isSelect && <span className="px-3 text-black">▼</span>}
        </>
      )}
    </div>
  </div>
);

export const VestingCreator = () => {
  return (
    <div className="bg-white shadow-lg p-6 sm:p-8 rounded-xl w-full">
      <h2 className="mb-6 font-semibold text-black text-2xl">
        Create Vesting Schedule
      </h2>

      <div className="gap-x-6 gap-y-5 grid grid-cols-1 sm:grid-cols-2">
        {/* Row 1 */}
        <InputField label="Token" placeholder="Select token" isSelect />
        <InputField label="Amount" placeholder="0.00" isAmount value="0.00" />

        {/* Row 2 */}
        <InputField label="Start Date" placeholder="📅 Pick a date" isSelect />
        <InputField label="Cliff (months)" placeholder="0" value="0" />

        {/* Row 3 - Full Width */}
        <div className="col-span-1 sm:col-span-2">
          <InputField label="Duration (months)" value="6" isSelect />
        </div>

        {/* Button - Full Width */}
        <div className="col-span-1 sm:col-span-2 pt-2">
          <button className="bg-[#00076C] hover:bg-blue-700 py-3 rounded-lg w-full font-bold text-white text-lg transition-colors">
            Create Vesting Schedule
          </button>
        </div>
      </div>
    </div>
  );
};
