import React, { useState } from "react";
import { useWallets } from "@mysten/dapp-kit";
import ethos from "../assets/ethos.png";
import slush from "../assets/slush.png";
import phantom from "../assets/Metamask.png";

const WalletModal = ({ onSelectWallet, onClose }) => {
  const wallets = useWallets();
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  const walletOptions = [
    { name: "Slush", icon: slush },
    { name: "Suinet", icon: slush },
    { name: "Ethos", icon: ethos },
    { name: "Phantom", icon: phantom },
  ];

  const handleWalletClick = async (walletName) => {
    setError("");
    setConnecting(true);
    setSelectedWallet(walletName);

    try {
      const adapter = wallets.find((w) =>
        w.name?.toLowerCase().includes(walletName.toLowerCase())
      );

      if (!adapter) {
        setError(
          `${walletName} not detected in the browser. Please install the wallet extension.`
        );
        setConnecting(false);
        setSelectedWallet(null);
        return;
      }

      onSelectWallet(adapter);
    } catch (err) {
      console.error("Connect error:", err);
      setError("Connection failed. Try again.");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div
      className='z-50 fixed inset-0 flex justify-center items-center bg-black/50 mx-4'
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className='relative bg-white shadow-2xl p-6 rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto'>
        <button
          className='top-4 right-4 absolute font-bold text-gray-500 hover:text-gray-700 text-2xl'
          onClick={onClose}
        >
          ×
        </button>
        <h2 className='mb-2 font-bold text-[#00076C] text-2xl'>
          Select a wallet
        </h2>
        <p className='mb-6 text-gray-600 text-sm'>
          By connecting your wallet, you agree to our{" "}
          <a href='#' className='text-[#00076C] underline hover:no-underline'>
            Terms of Service
          </a>{" "}
          and our{" "}
          <a href='#' className='text-[#00076C] underline hover:no-underline'>
            Privacy Policy
          </a>
        </p>
        <div className='space-y-4'>
          {walletOptions.map((w) => (
            <div
              key={w.name}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                selectedWallet === w.name
                  ? "border-[#00076C] bg-blue-50"
                  : "border-gray-200 hover:bg-gray-50"
              } cursor-pointer`}
              onClick={() => handleWalletClick(w.name)}
              role='button'
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleWalletClick(w.name)}
            >
              <div className='flex items-center space-x-3'>
                <img
                  src={w.icon}
                  alt={w.name}
                  className='rounded-full w-10 h-10 object-cover'
                />
                <span className='font-medium text-[#00076C]'>{w.name}</span>
              </div>
              <span
                className={`text-sm ${
                  selectedWallet === w.name && connecting
                    ? "text-gray-500"
                    : "text-[#00076C]"
                }`}
              >
                {selectedWallet === w.name && connecting
                  ? "Connecting…"
                  : "Connect"}
              </span>
            </div>
          ))}
        </div>
        {error && <p className='mt-4 text-red-500 text-sm'>{error}</p>}
      </div>
    </div>
  );
};

export default WalletModal;
