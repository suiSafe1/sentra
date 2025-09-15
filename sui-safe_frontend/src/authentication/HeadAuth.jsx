import { Bell, Menu } from "lucide-react";
import Badge from "../components/Badge";
import logo from "../assets/suisafe-logo.svg";
import Button from "../components/Button";
import { Link } from "react-router-dom";
import { useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit";
import { useNavigate } from "react-router-dom";

function HeadAuth() {
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const navigate = useNavigate();

  // Helper: shorten wallet address
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleLogout = () => {
    disconnect(); // disconnect wallet
    localStorage.removeItem("sui_session");
    localStorage.removeItem("sui_session_proof");
    navigate("/connect"); // go back to connect page
  };

  return (
    <header className="heading">
      <Link to="/dashboard" className="logo-container">
        <img src={logo} alt="SuiSafe Logo" className="logo-image" />
        <span className="logo-text">suiSafe</span>
      </Link>

      <div className="header-actions">
        {/* Clickable Sui network badge */}
        <Badge
          className="network-badge"
          style={{ cursor: "pointer" }}
          onClick={handleLogout}
          title="Click to logout"
        >
          <div className="status-dot"></div>Sui
        </Badge>

        <span className="wallet-address">
          {account ? formatAddress(account.address) : "Not connected"}
        </span>

        <div className="notification-container">
          <Bell className="notification-icon" />
          <div className="notification-dot"></div>
        </div>

        <Button variant="ghost" size="sm" className="mobile-menu">
          <Menu className="menu-icon" />
        </Button>
      </div>
    </header>
  );
}

export default HeadAuth;
