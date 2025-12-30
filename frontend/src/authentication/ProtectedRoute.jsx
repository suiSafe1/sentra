import { Navigate, useLocation } from "react-router-dom";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ children }) => {
  const account = useCurrentAccount();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!account) {
    return <Navigate to="/dashboard" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
