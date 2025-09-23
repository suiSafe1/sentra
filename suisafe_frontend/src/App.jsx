import { Routes, Route, Navigate } from "react-router-dom";
import { useCurrentAccount } from "@mysten/dapp-kit";
import CreatePage from "./routes/CreatePage";
import Home from "./pages/Home";
import WithdrawalPage from "./routes/WithdrawalPage";
import Dashboard from "./routes/Dashboard";
import CreateLockToken from "./routes/CreateLockToken";
import WalletConnect from "./routes/Connect";
import NotFound from "./pages/NotFound";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./authentication/ProtectedRoute";
// main.jsx or App.jsx
import "flowbite";


function App() {
  const account = useCurrentAccount();

  return (
    <>
      <Header />
      <Routes>
        {/* If connected, / goes to dashboard, else Home */}
        <Route
          path="/"
          element={account ? <Navigate to="/dashboard" /> : <Home />}
        />

        <Route path="/*" element={<NotFound />} />
        <Route path="/connect" element={<WalletConnect />} />

        {/* Protected routes */}
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CreatePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/withdraw"
          element={
            <ProtectedRoute>
              <WithdrawalPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/lock"
          element={
            <ProtectedRoute>
              <CreateLockToken />
            </ProtectedRoute>
          }
        />
        
      </Routes>
      <Footer />
    </>
  );
}

export default App;
