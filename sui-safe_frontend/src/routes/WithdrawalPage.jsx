import { useMemo, useState } from "react";
import { Binoculars, Check, Info } from "lucide-react";
import Button from "../components/Button";
import Card from "../components/Card";
import Checkbox from "../components/Checkbox";
import Badge from "../components/Badge";
import Dialog from "../components/Dialog";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "../components/Loader";
import "../styles/WithdrawalPage.css";

// Component for managing asset withdrawal functionality
function WithdrawalPage() {
  const [assets, setAssets] = useState([
    {
      id: "1",
      name: "SUI Token",
      type: "Token",
      icon: "",
      amountLocked: "1,000 SUI",
      yieldEarned: "350 SUI",
      yieldColor: "text-green-600",
      lockPeriod: "1/15/2024 - 7/15/2024",
      selected: false,
    },
    {
      id: "2",
      name: "Capy NFT #123",
      type: "Nft",
      icon: "",
      amountLocked: "1 NFT",
      yieldEarned: "50 SUI",
      yieldColor: "text-green-600",
      lockPeriod: "2/1/2024 - 6/1/2024",
      selected: false,
    },
    {
      id: "3",
      name: "USDC",
      type: "Token",
      icon: "",
      amountLocked: "500 USDC",
      yieldEarned: "175 USDC",
      yieldColor: "text-green-600",
      lockPeriod: "3/1/2024 - 7/1/2024",
      selected: false,
    },
  ]);

  const [selectAll, setSelectAll] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const selectedCount = assets.filter((asset) => asset.selected).length;

  // Handler to toggle selection of all assets
  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    setAssets(assets.map((asset) => ({ ...asset, selected: checked })));
  };

  // Handler to toggle selection of a specific asset
  const handleAssetSelect = (id, checked) => {
    const updatedAssets = assets.map((asset) =>
      asset.id === id ? { ...asset, selected: checked } : asset
    );
    setAssets(updatedAssets);
    setSelectAll(updatedAssets.every((asset) => asset.selected));
  };

  // Handler to initiate the withdrawal process
  const handleWithdraw = () => {
    setShowConfirmDialog(true);
  };

  // Handler to confirm withdrawal with a 2-second delay
  const handleConfirmWithdrawal = () => {
    setIsConfirming(true);
    setTimeout(() => {
      setShowConfirmDialog(false);
      setIsConfirming(false);
      setShowSuccessDialog(true);
      // Clear selection after successful withdrawal
      setAssets((prevAssets) =>
        prevAssets.map((asset) => ({ ...asset, selected: false }))
      );
      setSelectAll(false);
    }, 2000);
  };

  // Memoize the total yield calculation to avoid unnecessary recalculations on re-renders.
  // Only recomputes when the `assets` array changes.
  // Filters selected assets, strips non-numeric characters from `yieldEarned` using regex,
  // then sums the parsed values.
  // Example: "350 SUI" → 350.00
  const totalYield = useMemo(() => {
    return assets
      .filter((asset) => asset.selected)
      .reduce(
        (sum, asset) =>
          sum + parseFloat(asset.yieldEarned.replace(/[^\d.]/g, "")),
        0
      );
  }, [assets]);
  const platformFee = totalYield * 0.3;
  const yourYield = totalYield * 0.7;

  // Animation variants for buttons and elements
  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2, ease: "easeInOut" } },
    tap: { scale: 0.95, transition: { duration: 0.1 } },
  };
  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  };

  return (
    <div className="page-container">
      <motion.main
        className="main-container"
        initial="hidden"
        animate="visible"
        variants={fadeInVariants}
      >
        <div className="withdrawal-content-container">
          {/* Title section */}
          <div className="title-section">
            <h1 className="title">Withdraw Your Assets</h1>
            <p className="description">
              Your locked assets are ready for withdrawal. Congratulations on
              earning yield!
            </p>
          </div>

          {/* Eligible Locks Card */}
          <Card className="eligible-locks-card">
            <div className="withdrawal-card-content">
              <div className="withdrawal-card-header">
                <h2 className="withdrawal-card-title">Eligible Locks</h2>
                <div className="select-all-container">
                  <Checkbox
                    id="select-all"
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                  />
                  <label htmlFor="select-all" className="select-all-label">
                    Select All
                  </label>
                </div>
              </div>
              <div className="assets-list">
                {assets.map((asset) => (
                  <div className="staking-card" key={asset.id}>
                    <section>
                      <div className="token-info">
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>

                          <div>
                            <Checkbox
                              checked={asset.selected}
                              onCheckedChange={(checked) => handleAssetSelect(asset.id, checked)}
                            />
                            <h3 className="token-name">{asset.name}</h3>
                            <p className="token-amount">{asset.amountLocked}</p>
                          </div>
                        </div>
                      </div>

                      <div className="detail-block">
                        <p className="label">Lock Period</p>
                        <p className="value">{asset.lockPeriod}</p>
                      </div>

                      <section className="detailblock">
                        <div className="detail-block2">
                          <div className="detail-block3">
                            <p className="label">Yield Earned</p>
                            <p className={`yield ${asset.yieldColor}`}>{asset.yieldEarned}</p>
                          </div>

                          <div className="detail-block">
                            {asset.selected ? (
                              <span className="status selected">Selected</span>
                            ) : (
                              <span className="status active">Ready to Withdraw</span>
                            )}
                          </div>
                        </div>
                      </section>
                    </section>
                  </div>
                ))}
              </div>

            </div>
          </Card>

          {/* Withdrawal Summary Card with fade-in animation*/}
          {selectedCount > 0 && (
            <motion.div
              className="summary-card"
              initial="hidden"
              animate="visible"
              variants={fadeInVariants}
            >
              <Card>
                <div className="withdrawal-card-content">
                  <div className="withdrawal-summary-card-header">
                    <h2 className="withdrawal-card-title">
                      Withdrawal Summary
                    </h2>
                    <Info className="info-icon" />
                  </div>
                  <div className="summary-grid">
                    <div className="summary-item-yield">
                      <div className="summary-label text-green-600">
                        Your Yield (70%)
                      </div>
                      <div className="summary-value text-green-600">
                        {yourYield.toFixed(2)} Tokens
                      </div>
                    </div>
                    <div className="summary-item-fee">
                      <div className="summary-label text-gray-600">
                        Platform Fee (30%)
                      </div>
                      <div className="summary-value text-gray-600">
                        {platformFee.toFixed(2)} Tokens
                      </div>
                    </div>
                    <div className="summary-item-earned">
                      <div className="summary-label text-blue-600">
                        Total Yield Earned
                      </div>
                      <div className="summary-value text-blue-600">
                        {totalYield.toFixed(2)} Tokens
                      </div>
                    </div>
                  </div>
                  <div className="summary-note">
                    <p>
                      <strong>Note:</strong> Your original locked amounts will
                      be returned in full, plus your share of the yield earned
                      during the lock period.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Withdraw Button */}
          {selectedCount > 0 && (
            <div className="withdraw-button-container">
              <motion.div
                whileHover="hover"
                whileTap="tap"
                variants={buttonVariants}
              >
                <Button
                  onClick={handleWithdraw}
                  disabled={selectedCount === 0}
                  className="withdrawal-button"
                >
                  Withdraw Selected Assets ({selectedCount})
                </Button>
              </motion.div>
            </div>
          )}
        </div>
      </motion.main>

      {/* Confirmation Dialog with fade-in animation */}
      <Dialog
        className="dialog-overlay"
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
      >
        <motion.div
          className="dialog-content "
          initial="hidden"
          animate="visible"
          variants={fadeInVariants}
        >
          <div className="dialog-header">
            <h3 className="dialog-title">Confirm Withdrawal</h3>
            <p className="dialog-description">
              Review your withdrawal details before confirming.
            </p>
          </div>
          <div className="dialog-body">
            <div>
              <h4 className="dialog-section-title">Assets to Withdraw:</h4>
              <div className="dialog-asset-list">
                {assets
                  .filter((asset) => asset.selected)
                  .map((asset) => (
                    <div key={asset.id} className="dialog-asset-item">
                      <span>{asset.name}</span>
                      <span>
                        {asset.amountLocked} + {asset.yieldEarned}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="dialog-summary">
              <div className="dialog-summary-item">
                <span>Your Yield (70%):</span>
                <span className="text-green-600">
                  +{yourYield.toFixed(2)} Tokens
                </span>
              </div>
              <div className="dialog-summary-item">
                <span>Platform Fee (30%):</span>
                <span className="text-gray-600">
                  -{platformFee.toFixed(2)} Tokens
                </span>
              </div>
              <div className="dialog-summary-item">
                <span>Estimated Gas Fee:</span>
                <span>~0.001 SUI</span>
              </div>
            </div>
          </div>
          <div className="dialog-footer">
            <motion.div
              whileHover="hover"
              whileTap="tap"
              variants={buttonVariants}
            >
              <Button
                className="dialog-cancel-button"
                onClick={() => setShowConfirmDialog(false)}
              >
                Cancel
              </Button>
            </motion.div>
            <motion.div
              whileHover="hover"
              whileTap="tap"
              variants={buttonVariants}
            >
              <Button
                className="dialog-confirm-button"
                onClick={handleConfirmWithdrawal}
              >
                Confirm Withdrawal
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </Dialog>

      {/* Confirmation Loader */}
      {isConfirming && <Loader />}

      {/* Success Notification*/}
      <AnimatePresence>
        {showSuccessDialog && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: "70%" }}
            exit={{ opacity: 0, x: "130%" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{
              transform: "translateX(-50%)",
              position: "fixed",
              top: "50%",
              // right: "40%",
              zIndex: 1000,
              width: "90%",
              maxWidth: "28rem",
            }}
          >
            <Dialog
              className="success"
              open={showSuccessDialog}
              onOpenChange={setShowSuccessDialog}
            >
              <div className="success-dialog-content">
                <div className="dialog-success">
                  {/* <div className="success-icon">
                    <Check className="check-icon" />
                  </div> */}
                  <h3 className="dialog-title">
                    Assets Withdrawn Successfully
                  </h3>
                  <p className="dialog-description">
                    Your assets have been withdrawn to your wallet
                  </p>
                  <div className="button-wrapper">
                    <button
                      className="dialog-explorer-button"
                      onClick={() => setShowSuccessDialog(false)}
                    >
                      View on Sui Explorer{" "}
                      <Binoculars size={15} strokeWidth={1.4} />
                    </button>
                  </div>
                </div>
              </div>
            </Dialog>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default WithdrawalPage;
