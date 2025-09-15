import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  useWallets,
  useConnectWallet,
  useDisconnectWallet,
  useCurrentAccount,
} from "@mysten/dapp-kit";

import logo from "../assets/Logo.png";
import ethos from "../assets/ethos.png";
import slush from "../assets/slush.png";
import phantom from "../assets/Metamask.png";
import "../styles/connect.css";



const WalletConnect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // dapp-kit hooks
  const wallets = useWallets();
  const { mutate: connect } = useConnectWallet();
  const { mutate: disconnect } = useDisconnectWallet();
  const account = useCurrentAccount();

  const [selectedWallet, setSelectedWallet] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  // Wallet list for your UI
  const walletOptions = [
    { name: "Slush", icon: slush },
    { name: "Suinet", icon: slush },
    { name: "Ethos", icon: ethos },
    { name: "Phantom", icon: phantom },
  ];

  // If user already has a stored session AND is not already on /dashboard, go there.
  useEffect(() => {
    try {
      const existingSession = typeof window !== "undefined" && localStorage.getItem("sui_session");
      if (existingSession && location.pathname !== "/dashboard") {
        // replace to avoid stacking history; guard against repeated navigation by checking pathname
        navigate("/dashboard", { replace: true });
      }
    } catch (e) {
    }
  }, []);


  // When wallet connects via dapp-kit account, persist session and redirect once
  useEffect(() => {
    if (!account) return;

    // Only redirect if not already on dashboard
    if (location.pathname !== "/dashboard") {
      const session = {
        address: account.address,
        connectedAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem("sui_session", JSON.stringify(session));
      } catch (e) {
        console.warn("Could not persist session:", e);
      }
      navigate("/dashboard", { replace: true });
    }
    // only react to account changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  // handle wallet connection
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
        return;
      }

      // call the connect mutation (dapp-kit)
      connect({ wallet: adapter });
    } catch (err) {
      console.error("Connect error:", err);
      setError("Connection failed. Try again.");
    } finally {
      setConnecting(false);
    }
  };

  // optional: sign message proof (client-side placeholder)
  const handleSignProof = async () => {
    try {
      if (!account) {
        setError("Connect your wallet first.");
        return;
      }

      const message = `Login to Metromelt at ${new Date().toISOString()}`;
      const proof = {
        address: account.address,
        message,
        signature: "demo-signature", // placeholder until wallet signing is implemented
      };
      try {
        localStorage.setItem("sui_session_proof", JSON.stringify(proof));
      } catch (e) {
        console.warn("Could not persist proof:", e);
      }
      if (location.pathname !== "/dashboard") navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Signing error:", err);
      setError("Signing failed or was rejected.");
    }
  };

  // disconnect clears session and stays on /connect (or redirects here)
  const handleDisconnect = async () => {
    try {
      disconnect();
    } finally {
      try {
        localStorage.removeItem("sui_session");
        localStorage.removeItem("sui_session_proof");
      } catch (e) {}
      if (location.pathname !== "/connect") navigate("/connect", { replace: true });
    }
  };

  return (
    <div className="wallet-connect">
      <div className="content">
        <img src={logo} alt="logo" className="logo" />
        <p className="description">
          Experience secure wallet connections with our <br /> intuitive UI
        </p>

        {!account ? (
          <>
            <div className="wallet-list">
              {walletOptions.map((w) => (
                <div
                  key={w.name}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === "Enter" ? handleWalletClick(w.name) : null)}
                  className={`wallet-item ${
                    selectedWallet === w.name ? "wallet-item-selected" : ""
                  }`}
                  onClick={() => handleWalletClick(w.name)}
                >
                  <div className="wallet-info">
                    <div className="wallet-icon">
                      <img src={w.icon} alt={w.name} />
                    </div>
                    <span className="wallet-name">{w.name}</span>
                  </div>
                  {selectedWallet === w.name && connecting && (
                    <span className="wallet-status">Connecting…</span>
                  )}
                </div>
              ))}
            </div>

            <div className="helper-row">
              <button className="btn proof-btn" onClick={handleSignProof}>
                (Optional) Sign a Proof & Continue
              </button>
            </div>

            {error && <p className="error">{error}</p>}
          </>
        ) : (
          <div className="connected-card">
            <p>Connected as</p>
            <strong className="mono">{account?.address || "Unknown address"}</strong>
            <div className="connected-actions">
              <button className="btn" onClick={handleSignProof}>
                Sign proof
              </button>
              <button className="btn" onClick={handleDisconnect}>
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletConnect;
