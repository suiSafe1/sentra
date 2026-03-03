import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  useCurrentAccount,
  useConnectWallet,
  useWallets,
} from "@mysten/dapp-kit";
import HeadAuth from "../authentication/HeadAuth";
import NoAuth from "../authentication/NoAuth";

const Header = () => {
  const location = useLocation();
  const account = useCurrentAccount();
  const wallets = useWallets();
  const { mutate: connect } = useConnectWallet();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem("sui_session");

    if (account) {
      setIsAuthenticated(true);

      if (!session) {
        localStorage.setItem(
          "sui_session",
          JSON.stringify({ address: account.address }),
        );
      }
    } else {
      setIsAuthenticated(false);
    }
  }, [account]);

  useEffect(() => {
    const attemptReconnect = async () => {
      const session = localStorage.getItem("sui_session");

      if (session && !account && !isReconnecting) {
        setIsReconnecting(true);

        try {
          const { address } = JSON.parse(session);

          const adapter = wallets.find((w) =>
            w.accounts.some((acc) => acc.address === address),
          );

          if (adapter) {
            connect({ wallet: adapter });
          } else {
            localStorage.removeItem("sui_session");
          }
        } catch (error) {
          localStorage.removeItem("sui_session");
        } finally {
          setIsReconnecting(false);
        }
      }
    };

    attemptReconnect();
  }, []);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "sui_session" && !e.newValue) {
        setIsAuthenticated(false);
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return <>{isAuthenticated ? <HeadAuth /> : <NoAuth />}</>;
};

export default Header;
