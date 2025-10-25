import React, { useMemo, useState } from "react";
import { Binoculars, Check, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Assuming these are simple, well-styled components you have
import Button from "../components/Button";
import Card from "../components/Card";
import Checkbox from "../components/Checkbox";
import Dialog from "../components/Dialog";
import Loader from "../components/Loader";

function WithdrawalPage() {
  const [assets, setAssets] = useState([
    {
      id: "1",
      name: "SUI Token",
      type: "Token",
      amountLocked: "1,000 SUI",
      yieldEarned: "350 SUI",
      lockPeriod: "1/15/2024 - 7/15/2024",
      selected: false,
    },
    {
      id: "2",
      name: "Capy NFT #123",
      type: "Nft",
      amountLocked: "1 NFT",
      yieldEarned: "50 SUI",
      lockPeriod: "2/1/2024 - 6/1/2024",
      selected: false,
    },
    {
      id: "3",
      name: "USDC",
      type: "Token",
      amountLocked: "500 USDC",
      yieldEarned: "175 USDC",
      lockPeriod: "3/1/2024 - 7/1/2024",
      selected: false,
    },
  ]);

  const [selectAll, setSelectAll] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const selectedCount = assets.filter((asset) => asset.selected).length;

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    setAssets(assets.map((asset) => ({ ...asset, selected: checked })));
  };

  const handleAssetSelect = (id, checked) => {
    const updatedAssets = assets.map((asset) =>
      asset.id === id ? { ...asset, selected: checked } : asset
    );
    setAssets(updatedAssets);
    setSelectAll(updatedAssets.every((asset) => asset.selected));
  };

  const handleWithdraw = () => {
    setShowConfirmDialog(true);
  };

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

  // Memoize calculation
  const { totalYield, platformFee, yourYield } = useMemo(() => {
    const total = assets
      .filter((asset) => asset.selected)
      .reduce(
        (sum, asset) =>
          sum + parseFloat(asset.yieldEarned.replace(/[^\d.]/g, "")),
        0
      );
    const fee = total * 0.3;
    const userYield = total * 0.7;
    return { totalYield: total, platformFee: fee, yourYield: userYield };
  }, [assets]);

  // Animation variants
  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2, ease: "easeInOut" } },
    tap: { scale: 0.95, transition: { duration: 0.1 } },
  };
  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  };

  return (
    <div className='bg-gray-50 p-4 md:p-8 min-h-screen'>
      <motion.main
        // WIDE SCREEN FIX: Increased max-width to utilize more horizontal space
        className='mx-auto max-w-7xl'
        initial='hidden'
        animate='visible'
        variants={fadeInVariants}
      >
        <div className='mx-auto'>
          {" "}
          {/* Removed strict max-w-3xl */}
          {/* Title section */}
          <div className='mx-auto mb-8 max-w-2xl text-center'>
            <h1 className='mb-1 font-extrabold text-[#000e68] text-2xl md:text-3xl'>
              Withdraw Your Assets
            </h1>
            <p className='text-gray-600'>
              Your locked assets are ready for withdrawal. Congratulations on
              earning yield!
            </p>
          </div>
          {/* Eligible Locks Card */}
          <Card
            // WIDE SCREEN FIX: Increased max-width for the main list
            className='bg-white/70 shadow-lg backdrop-blur-sm mx-auto mb-8 p-4 md:p-6 border border-gray-200'
          >
            <div className='flex justify-between items-center mb-6'>
              <h2 className='font-extrabold text-[#000e68] text-xl md:text-2xl'>
                Eligible Locks
              </h2>
              <div className='flex items-center gap-2'>
                <Checkbox
                  id='select-all'
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                />
                <label
                  htmlFor='select-all'
                  className='font-semibold text-sm cursor-pointer'
                >
                  Select All
                </label>
              </div>
            </div>

            {/* Assets List */}
            <div className='space-y-3'>
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className={`p-3 md:p-4 rounded-xl border-2 transition-all duration-200 
                    ${
                      asset.selected
                        ? "bg-green-50 border-green-400"
                        : "bg-white hover:border-gray-300"
                    }`}
                >
                  <section className='items-center gap-3 grid grid-cols-2 md:grid-cols-5 text-sm md:text-base'>
                    {/* Token Info & Checkbox */}
                    <div className='flex items-center space-x-3 col-span-2 md:col-span-1'>
                      <Checkbox
                        checked={asset.selected}
                        onCheckedChange={(checked) =>
                          handleAssetSelect(asset.id, checked)
                        }
                      />
                      <div className='flex flex-col'>
                        <h3 className='font-bold text-gray-800'>
                          {asset.name}
                        </h3>
                        <p className='text-gray-500 text-xs'>
                          {asset.amountLocked}
                        </p>
                      </div>
                    </div>

                    {/* Lock Period */}
                    <div className='hidden md:block'>
                      <p className='mb-0.5 font-medium text-gray-500 text-xs'>
                        Lock Period
                      </p>
                      <p className='font-semibold text-gray-700 text-sm'>
                        {asset.lockPeriod}
                      </p>
                    </div>

                    {/* Yield Earned */}
                    <div className='hidden md:block'>
                      <p className='mb-0.5 font-medium text-gray-500 text-xs'>
                        Yield Earned
                      </p>
                      <p className='font-bold text-green-600 text-sm'>
                        {asset.yieldEarned}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className='flex justify-end md:justify-center'>
                      {asset.selected ? (
                        <span className='bg-green-200 px-3 py-1 rounded-full font-semibold text-green-800 text-xs'>
                          Selected
                        </span>
                      ) : (
                        <span className='bg-blue-50 px-3 py-1 border border-blue-200 rounded-full font-medium text-blue-600 text-xs'>
                          Ready to Withdraw
                        </span>
                      )}
                    </div>
                  </section>
                </div>
              ))}
            </div>
          </Card>
          {/* Withdrawal Summary Card */}
          <AnimatePresence>
            {selectedCount > 0 && (
              <motion.div
                // WIDE SCREEN FIX: Increased max-width for the summary
                className='mx-auto mb-8 max-w-4xl xl:max-w-5xl'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
              >
                <Card className='bg-white/70 shadow-lg backdrop-blur-sm p-4 md:p-6 border border-gray-200'>
                  <div className='flex justify-start items-center gap-2 mb-4'>
                    <h2 className='font-extrabold text-[#000e68] text-lg md:text-xl'>
                      Withdrawal Summary
                    </h2>
                    <Info className='w-4 h-4 text-gray-400' />
                  </div>

                  <div className='gap-4 grid grid-cols-1 md:grid-cols-3'>
                    {/* Your Yield */}
                    <div className='bg-green-50 p-4 rounded-lg'>
                      <p className='font-medium text-green-700 text-sm'>
                        Your Yield (70%)
                      </p>
                      <p className='mt-1 font-bold text-green-600 text-2xl'>
                        {yourYield.toFixed(2)} Tokens
                      </p>
                    </div>
                    {/* Platform Fee */}
                    <div className='bg-gray-50 p-4 rounded-lg'>
                      <p className='font-medium text-gray-600 text-sm'>
                        Platform Fee (30%)
                      </p>
                      <p className='mt-1 font-bold text-gray-600 text-2xl'>
                        {platformFee.toFixed(2)} Tokens
                      </p>
                    </div>
                    {/* Total Yield */}
                    <div className='bg-blue-50 p-4 rounded-lg'>
                      <p className='font-medium text-blue-800 text-sm'>
                        Total Yield Earned
                      </p>
                      <p className='mt-1 font-bold text-[#000e68] text-2xl'>
                        {totalYield.toFixed(2)} Tokens
                      </p>
                    </div>
                  </div>

                  <div className='bg-green-50 mt-4 p-3 border border-green-300 rounded-lg text-green-700 text-sm'>
                    <p>
                      <strong>Note:</strong> Your original locked amounts will
                      be returned in full, plus your share of the yield earned
                      during the lock period.
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Withdraw Button */}
          {selectedCount > 0 && (
            <div className='flex justify-center mt-8'>
              <motion.div
                whileHover='hover'
                whileTap='tap'
                variants={buttonVariants}
              >
                <Button
                  onClick={handleWithdraw}
                  disabled={selectedCount === 0}
                  className='bg-green-600 hover:bg-green-700 disabled:bg-gray-400 shadow-md px-8 py-3 rounded-lg font-semibold text-white text-lg transition-colors'
                >
                  Withdraw Selected Assets ({selectedCount})
                </Button>
              </motion.div>
            </div>
          )}
        </div>
      </motion.main>

      {/* Confirmation Dialog (No changes needed, positioning is fine) */}
      <Dialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        className='z-50 fixed inset-0 flex justify-center items-center bg-black/50 p-4'
      >
        <motion.div
          className='bg-white shadow-2xl p-6 rounded-xl w-full max-w-md'
          initial='hidden'
          animate='visible'
          variants={fadeInVariants}
        >
          <div className='mb-4'>
            <h3 className='mb-1 font-extrabold text-gray-800 text-xl'>
              Confirm Withdrawal
            </h3>
            <p className='font-medium text-gray-500 text-sm'>
              Review your withdrawal details before confirming.
            </p>
          </div>
          <div className='space-y-4'>
            <div>
              <h4 className='mb-2 font-bold text-gray-700'>
                Assets to Withdraw:
              </h4>
              <div className='space-y-2 font-medium text-sm'>
                {assets
                  .filter((asset) => asset.selected)
                  .map((asset) => (
                    <div
                      key={asset.id}
                      className='flex justify-between items-center pb-1 border-b last:border-b-0'
                    >
                      <span className='text-gray-700'>{asset.name}</span>
                      <span className='text-gray-600 text-right'>
                        {asset.amountLocked} + Yield
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className='space-y-2 pt-4 border-gray-200 border-t font-semibold text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Your Yield (70%):</span>
                <span className='text-green-600'>
                  +{yourYield.toFixed(2)} Tokens
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Platform Fee (30%):</span>
                <span className='text-gray-600'>
                  -{platformFee.toFixed(2)} Tokens
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Estimated Gas Fee:</span>
                <span className='text-gray-600'>~0.001 SUI</span>
              </div>
            </div>
          </div>

          <div className='flex justify-end gap-3 mt-6'>
            <motion.div
              whileHover='hover'
              whileTap='tap'
              variants={buttonVariants}
            >
              <Button
                onClick={() => setShowConfirmDialog(false)}
                className='bg-white hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700'
              >
                Cancel
              </Button>
            </motion.div>
            <motion.div
              whileHover='hover'
              whileTap='tap'
              variants={buttonVariants}
            >
              <Button
                onClick={handleConfirmWithdrawal}
                className='bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium text-white'
              >
                Confirm Withdrawal
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </Dialog>

      {/* Confirmation Loader */}
      {isConfirming && (
        <div className='z-[60] fixed inset-0 flex justify-center items-center bg-white/80'>
          <Loader />
        </div>
      )}

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccessDialog && (
          <motion.div
            // WIDE SCREEN FIX: Simple right/bottom anchoring for desktop
            className='top-1/2 md:top-auto md:right-8 md:bottom-8 left-1/2 md:left-auto z-[70] fixed w-11/12 max-w-md -translate-x-1/2 -translate-y-1/2 md:translate-x-0 md:translate-y-0'
            // WIDE SCREEN FIX: Update animation to match new fixed position
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: "0%", opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <Dialog
              open={showSuccessDialog}
              onOpenChange={setShowSuccessDialog}
            >
              <div className='bg-white shadow-2xl p-6 border-green-500 border-l-4 rounded-xl'>
                <div className='flex flex-col items-center text-center'>
                  <div className='flex justify-center items-center bg-green-100 mb-3 rounded-full w-12 h-12'>
                    <Check className='w-6 h-6 text-green-600' />
                  </div>
                  <h3 className='mb-1 font-extrabold text-gray-800 text-xl'>
                    Assets Withdrawn Successfully
                  </h3>
                  <p className='mb-4 font-medium text-gray-500 text-sm'>
                    Your assets have been withdrawn to your wallet.
                  </p>
                  <button
                    onClick={() => setShowSuccessDialog(false)}
                    className='flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 text-sm transition-colors'
                  >
                    View on Sui Explorer
                    <Binoculars size={16} strokeWidth={1.5} />
                  </button>
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
