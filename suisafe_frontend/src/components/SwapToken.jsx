import { useState } from "react";

import swap_swap from "../assets/swap_swap.png";
import suiIcon from "../assets/sui_swap.png";
import usdcIcon from "../assets/usdc_swap.png";

const tokens = [
  { symbol: "Sui", icon: suiIcon },
  { symbol: "USDC", icon: usdcIcon },
];

function TokenSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const selectedToken = tokens.find((t) => t.symbol === value);

  return (
    <div className='relative w-full'>
      <button
        type='button'
        onClick={() => setOpen(!open)}
        className='flex justify-between items-center bg-white hover:bg-gray-50 shadow-sm px-3 py-2 border rounded-md w-full'
      >
        <div className='flex items-center gap-2'>
          <img src={selectedToken.icon} alt='' className='w-5 h-5' />
          <span>{selectedToken.symbol}</span>
        </div>
        <svg
          className='ml-2 w-4 h-4 text-gray-400'
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M19 9l-7 7-7-7'
          />
        </svg>
      </button>

      {open && (
        <div className='z-10 absolute bg-white shadow-lg mt-1 border rounded-md w-full'>
          {tokens.map((token) => (
            <div
              key={token.symbol}
              className='flex items-center gap-2 hover:bg-gray-100 px-3 py-2 cursor-pointer'
              onClick={() => {
                onChange(token.symbol);
                setOpen(false);
              }}
            >
              <img src={token.icon} alt='' className='w-5 h-5' />
              <span>{token.symbol}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SwapTokens() {
  const [fromAmount, setFromAmount] = useState(0.0);
  const [toAmount, setToAmount] = useState(0.0);
  const [fromToken, setFromToken] = useState("Sui");
  const [toToken, setToToken] = useState("USDC");

  const fromBalance = 10.0;
  const toBalance = 2.78;

  const handleSwap = () => {
    console.log(`Swapping ${fromAmount} ${fromToken} to ${toToken}`);
  };

  const handleFlip = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  return (
    <div className='bg-white shadow-md mx-auto p-6 rounded-lg w-full h-full'>
      <div className='m-auto w-[fit-content]'>
        <h2 className='mb-4 font-bold text-xl text-center'>Swap Tokens</h2>
        <p className='mb-4 text-gray-500 text-sm text-center'>
          Exchange your tokens instantly with the best rates
        </p>
        <div className='space-y-4 p-4 rounded-md ring-2 ring-gray-500'>
          {/* From */}
          <div>
            <label className='block font-medium text-gray-700 text-sm'>
              From
            </label>
            <div className='flex gap-2 mt-1'>
              <div>
                <TokenSelect value={fromToken} onChange={setFromToken} />
                <p className='mt-1 text-gray-500 text-xs'>
                  Balance: {fromBalance}
                </p>
              </div>

              <div className='flex flex-col'>
                <input
                  type='number'
                  className='px-3 py-2 border focus:border-indigo-500 rounded-md focus:ring-indigo-500'
                  value={fromAmount}
                  onChange={(e) =>
                    setFromAmount(parseFloat(e.target.value) || 0)
                  }
                  placeholder='0.00'
                />
                <button
                  className='px-2 font-semibold text-indigo-600 text-sm text-right'
                  onClick={() => setFromAmount(fromBalance)}
                >
                  MAX
                </button>
              </div>
            </div>
          </div>

          {/* Flip */}
          <div className='flex justify-center'>
            <button className='rounded-full' onClick={handleFlip}>
              <img src={swap_swap} alt='swap coins' className='h-16' />
            </button>
          </div>

          {/* To */}
          <div>
            <label className='block font-medium text-gray-700 text-sm'>
              To
            </label>
            <div className='flex gap-2 mt-1'>
              <TokenSelect value={toToken} onChange={setToToken} />
              <input
                type='number'
                className='px-3 py-2 border focus:border-indigo-500 rounded-md focus:ring-indigo-500'
                value={toAmount}
                onChange={(e) => setToAmount(parseFloat(e.target.value) || 0)}
                placeholder='0.00'
              />
            </div>
            <p className='mt-1 text-gray-500 text-xs'>Balance: {toBalance}</p>
          </div>

          {/* Swap */}
          <button
            className='bg-[#00076C] hover:bg-indigo-700 px-4 py-2 rounded-md w-full text-white'
            onClick={handleSwap}
          >
            Swap
          </button>
        </div>
      </div>
    </div>
  );
}
