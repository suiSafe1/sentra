import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useCurrentAccount, useConnectWallet, useWallets } from "@mysten/dapp-kit";
import HeadAuth from "../authentication/HeadAuth";
import NoAuth from "../authentication/NoAuth";

const Header = () => {
  const location = useLocation();
  const account = useCurrentAccount();
  const wallets = useWallets();
  const { mutate: connect } = useConnectWallet();

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check both localStorage + dapp-kit
  const checkAuth = () => {
    const session = localStorage.getItem("sui_session");
    if ((account && session) || session) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    // Try auto-reconnect on reload
    const session = localStorage.getItem("sui_session");
    if (session && !account) {
      const { address } = JSON.parse(session);

      // Find matching adapter
      const adapter = wallets.find((w) =>
        w.accounts.some((acc) => acc.address === address)
      );

      if (adapter) {
        connect({ wallet: adapter });
      }
    }

    checkAuth();

    const handleStorage = (e) => {
      if (e.key === "sui_session") {
        checkAuth();
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [location, account, wallets, connect]);

  return <>{isAuthenticated ? <HeadAuth /> : <NoAuth />}</>;
};

export default Header;
