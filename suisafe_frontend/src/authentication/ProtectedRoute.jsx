import { Navigate, useLocation } from "react-router-dom";
import { useCurrentAccount } from "@mysten/dapp-kit";

/**
 * ProtectedRoute:
 * - allows access if wallet-kit account exists OR if a stored local session exists.
 * - prevents setState loops by avoiding useEffect or setState here.
 */
const ProtectedRoute = ({ children }) => {
  const account = useCurrentAccount();
  const location = useLocation();

  // direct wallet connection check
  if (account) {
    return children;
  }

  // fallback: check localStorage synchronously
  let stored = null;
  try {
    stored = typeof window !== "undefined" && localStorage.getItem("sui_session");
  } catch (e) {
    stored = null;
  }

  if (stored) {
    // still redirect to dashboard if they try to access /connect while session exists
    if (location.pathname === "/connect") {
      return <Navigate to="/public_dashboard" replace />;
    }
    return children;
  }

  // not authenticated → redirect to connect
  return <Navigate to="/public_dashboard" replace />;
};

export default ProtectedRoute;
