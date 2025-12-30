import Button from "../components/Button";
import Card from "../components/Card";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import "../styles/CreatePage.css";
import Loader from "../components/Loader";
import { useNavigate } from "react-router-dom";

function CreatePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleViewWithdrawals = () => {
    setIsLoading(true);
    setTimeout(() => {
      navigate("/withdraw");
      setIsLoading(false);
    }, 2000);
  };

  // Subtle animation variants for buttons
  const buttonVariants = {
    hover: { scale: 1.01, transition: { duration: 0.2, ease: "easeInOut" } },
    tap: { scale: 0.98, transition: { duration: 0.1 } },
  };

  return (
    <div className="page-container">
      <AnimatePresence mode="wait">
        <motion.main
          key="create-page-main"
          className="main-container"
          initial={{ x: 0 }}
          animate={{ x: 0 }}
          exit={{
            x: "100vw",
            transition: { duration: 0.7, ease: "easeInOut" },
          }}
        >
          <div className="content-container">
            {/* Welcome section with fade-in animation */}
            <motion.div
              className="welcome-section"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="welcome-title">
                Welcome to <span className="welcome-title-span">SuiSafe</span>
              </h1>
              <p className="welcome-description">
                Secure crypto asset locking platform with yield generation
              </p>
            </motion.div>

            {/* Action cards with fade-in animation */}
            <motion.div
              className="action-cards"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card
                className="action-card-Lock"
                title="Lock Assets"
                description="Lock your tokens and NFTs to earn yield over time"
              >
                <motion.div
                  whileHover="hover"
                  whileTap="tap"
                  variants={buttonVariants}
                >
                  <Button className="action-button lock-button" size="lg">
                    Start Locking
                  </Button>
                </motion.div>
              </Card>

              <Card
                className="action-card-Withdraw"
                title="Withdraw Assets"
                description="Withdraw your locked assets and earned yield"
              >
                <motion.div
                  whileHover="hover"
                  whileTap="tap"
                  variants={buttonVariants}
                >
                  <Button
                    className="action-button withdraw-button"
                    size="lg"
                    onClick={handleViewWithdrawals}
                  >
                    View Withdrawals
                  </Button>
                </motion.div>
              </Card>
            </motion.div>

            {/* Features section with fade-in animation */}
            <motion.div
              className="features-section"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h2 className="features-title">Why Choose SuiSafe?</h2>
              <div className="features-grid">
                <div className="feature-item">
                  <h3 className="feature-title">Secure Locking</h3>
                  <p className="feature-description">
                    Your assets are secured with advanced smart contracts
                  </p>
                </div>
                <div className="feature-item">
                  <h3 className="feature-title">Earn Yield</h3>
                  <p className="feature-description">
                    Generate passive income on your locked assets
                  </p>
                </div>
                <div className="feature-item">
                  <h3 className="feature-title">Full Control</h3>
                  <p className="feature-description">
                    Withdraw your assets once the lock period expires
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.main>
      </AnimatePresence>

      {/* Loader during navigation */}
      {isLoading && <Loader />}
    </div>
  );
}

export default CreatePage;
