import React, { useState, useEffect } from "react";
import { useConnectWallet, useCurrentAccount } from "@mysten/dapp-kit";
import { Menu } from "lucide-react";
import SearchBar from "../components/Search";
import WalletModal from "../routes/Connect";
import { useMenuStore } from "../store/useMenuStore";

function NoAuth() {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const { mutate: connect } = useConnectWallet();
  const account = useCurrentAccount();
  const { toggleMenu } = useMenuStore();

  useEffect(() => {
    if (account) {
      localStorage.setItem(
        "sui_session",
        JSON.stringify({ address: account.address })
      );
    }
  }, [account]);

  const handleConnectWallet = () => {
    setIsWalletModalOpen(true);
  };

  const handleSelectWallet = (adapter) => {
    connect({ wallet: adapter });
    setIsWalletModalOpen(false);
  };

  return (
    <>
      <header className="flex sm:flex-row flex-col justify-between sm:items-center gap-2 bg-white shadow-md px-6 py-4 w-full">
        {/* DesktopSearch Bar */}
        <div className="sm:flex hidden w-full">
          <SearchBar />
        </div>

        <div className="flex items-center justify-between space-x-4">
          {/* Connect Wallet Button */}
          <button
            onClick={handleConnectWallet}
            className="bg-[#00076C] hover:bg-[#00076C]/90 px-4 py-2 rounded-md font-semibold text-sm sm:text-[16px] text-white text-nowrap transition-colors "
          >
            Connect Wallet
          </button>

          {/* Mobile Hamburger Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden flex items-center p-2"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        {/* Mobile Search Bar */}
        <div className="flex sm:hidden w-full">
          <SearchBar />
        </div>
      </header>

      {/* Wallet Modal */}
      {isWalletModalOpen && (
        <WalletModal
          onSelectWallet={handleSelectWallet}
          onClose={() => setIsWalletModalOpen(false)}
        />
      )}
    </>
  );
}

export default NoAuth;
