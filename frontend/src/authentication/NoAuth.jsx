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
      <header className="flex justify-between items-center bg-white shadow-md px-6 py-4 w-full">
        {/* Search Bar */}
        <SearchBar />

        <div className="flex items-center space-x-4">
          {/* Connect Wallet Button */}
          <button
            onClick={handleConnectWallet}
            className="bg-[#00076C] hover:bg-[#00076C]/90 px-4 py-2 rounded-md font-semibold text-white transition-colors"
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
