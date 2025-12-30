import { Bell, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit";
import { useState } from "react";
import SearchBar from "../components/Search";
import ActivityPanel from "../components/ActivityPanel";
import { useMenuStore } from "../store/useMenuStore";
import { useActivity } from "../hooks/useActivity";

function HeadAuth() {
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const navigate = useNavigate();

  const { menuOpen, toggleMenu } = useMenuStore();

  const [showActivityPanel, setShowActivityPanel] = useState(false);
  const { activities, isLoading, unreadCount, refresh, markAllAsRead } =
    useActivity();

  const handleLogout = () => {
    localStorage.removeItem("sui_session");
    localStorage.removeItem("sui_session_proof");

    disconnect();

    setTimeout(() => {
      navigate("/dashboard", { replace: true });
    }, 100);
  };

  const handleBellClick = () => {
    setShowActivityPanel(true);
    if (unreadCount > 0) {
      markAllAsRead();
    }
  };

  return (
    <>
      <header className="flex justify-between items-center bg-white shadow-md px-6 py-4 w-full">
        <SearchBar />

        <div className="flex items-center space-x-4">
          <div
            className="bg-[#F3F4F6] hover:bg-red-500 px-4 py-2 rounded-md font-black text-black/60 hover:text-white transition-colors duration-200 ease-in-out hover:cursor-pointer"
            onClick={handleLogout}
            title="Click to logout"
          >
            Disconnect
          </div>

          {/* Notification Bell with Badge */}
          <button
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={handleBellClick}
            title={`${unreadCount} new notifications`}
          >
            <Bell className="w-6 h-6 text-gray-600" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {unreadCount > 99 ? "99+" : unreadCount}
              </div>
            )}
          </button>

          {/* Mobile Hamburger Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden flex items-center p-2"
          >
            {menuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>
      </header>

      {/* Activity Panel */}
      <ActivityPanel
        isOpen={showActivityPanel}
        onClose={() => setShowActivityPanel(false)}
        activities={activities}
        isLoading={isLoading}
        onRefresh={refresh}
        onMarkAllRead={markAllAsRead}
      />
    </>
  );
}

export default HeadAuth;
