import { Routes, Route, Navigate, Outlet } from "react-router-dom";
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
import "flowbite";
import PublicDashboard from "./routes/PublicDashboard";

const Layout = () => (
  <>
    <Header />
    <Outlet />
    <Footer />
  </>
);

function App() {
  const account = useCurrentAccount();

  return (
    <Routes>
      <Route path='/public_dashboard' element={<PublicDashboard />} />
      <Route element={<Layout />}>
        <Route
          path='/'
          element={account ? <Navigate to='/dashboard' /> : <Home />}
        />
        <Route path='/*' element={<NotFound />} />
        <Route path='/connect' element={<WalletConnect />} />
        <Route
          path='/create'
          element={
            <ProtectedRoute>
              <CreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/withdraw'
          element={
            <ProtectedRoute>
              <WithdrawalPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/dashboard'
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path='/lock'
          element={
            <ProtectedRoute>
              <CreateLockToken />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
