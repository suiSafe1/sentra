import React, { useState } from "react";
import {
  ConnectButton,
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import "../styles/Createlock.css";
import CreateLockNft from "../pages/CreateLockNft";
import {
  MdOutlineLock,
  MdErrorOutline,
  MdOutlineDateRange,
} from "react-icons/md";
import { IoIosArrowDown, IoIosTrendingUp } from "react-icons/io";
import { GoUnlock } from "react-icons/go";
import { PiGasPump, PiCheckSquareOffsetBold } from "react-icons/pi";
import { IoWarningOutline } from "react-icons/io5";
import { Link } from "react-router";

// Blockchain constants
const PACKAGE_ID = '0x690cc8f7277cbb2622de286387fc3bec5b6de4bdbb155d0ae2a0852d154ab194';
const REGISTRY_ID = '0xa92e808ecf2e5a129b7a801719d8299528c644ae0f609054fa17f902610aa93a';
const PLATFORM_ID = '0x07a716a59b9a44fa761e417ef568367cb2ed3a9cf7cfcf1c281c1ad257d806bc';
const CLOCK_ID = '0x6';

const SCALLOP_MAINNET_MARKET_ID = '0xa757975255146dc9686aa823b7838b507f315d704f428cbadad2f4ea061939d9';
const SCALLOP_MAINNET_VERSION_ID = '0x07871c4b3c847a0f674510d4978d5cf6f960452795e8ff6f189fd2088a3f6ac7';

// Initialize Sui client
const client = new SuiClient({ url: getFullnodeUrl('mainnet') });

function CreateLockToken() {
  // UI state
  const [nftLock, setNftLock] = useState(false);
  const [selectToken, setSelectToken] = useState(false);
  const [confirmLock, setConfirmLock] = useState(false);
  const [selectDate, setSelectDate] = useState(false);
  const [preview, setPreview] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [amount, setAmount] = useState("");
  const [lockSuccess, setLockSuccess] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [memo, setMemo] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [lockerId, setLockerId] = useState("");
  const [txHash, setTxHash] = useState("");
  
  // Sui dApp Kit hooks
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const handleSwitch = (e) => {
    e.preventDefault();
    const targetId = e.target.id;
    if (targetId === "token") setNftLock(false);
    else if (targetId === "nft") setNftLock(true);
  };

  const handleDateChange = (e) => setSelectedDate(e.target.value);

  const handleDurationSelect = (days) => {
    setSelectedDuration(days);
    setSelectedDate(""); 
  };

  const getDurationInMs = () => {
    if (selectedDate) {
      const now = new Date();
      const unlockDate = new Date(selectedDate);
      return unlockDate.getTime() - now.getTime();
    }
    return selectedDuration * 24 * 60 * 60 * 1000; 
  };

  const getUnlockDate = () => {
    if (selectedDate) return selectedDate;
    const now = new Date();
    const unlockDate = new Date(now.getTime() + (selectedDuration * 24 * 60 * 60 * 1000));
    return unlockDate.toLocaleDateString();
  };

  const createLock = async () => {
    if (!currentAccount || !amount) {
      alert("Please connect wallet and enter amount");
      return;
    }

    try {
      setIsLoading(true);

      const tx = new Transaction();
      tx.setGasBudget(10000000);

      const suiAmount = BigInt(Math.floor(parseFloat(amount) * 1_000_000_000)); // mist

      const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(suiAmount)]);

      const [marketCoinHandle] = tx.moveCall({
        target: `0x83bbe0b3985c5e3857803e2678899b03f3c4a31be75006ab03faf268c014ce41::mint::mint`,
        arguments: [
          tx.object(SCALLOP_MAINNET_VERSION_ID),
          tx.object(SCALLOP_MAINNET_MARKET_ID),
          coin,
          tx.object(CLOCK_ID),
        ],
        typeArguments: ['0x2::sui::SUI'],
      });

      tx.moveCall({
        target: `${PACKAGE_ID}::sui_safe::create_yield_lock`,
        arguments: [
          tx.object(PLATFORM_ID),
          tx.object(REGISTRY_ID),
          marketCoinHandle,            
          tx.pure.u64(getDurationInMs()),
          tx.object(CLOCK_ID),
        ],
        typeArguments: [
          '0x2::sui::SUI',
          '0xefe8b36d5b2e43728cc323298626b83177803521d195cfb11e15b910e892fddf::reserve::MarketCoin<0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI>'
        ],
      });

      const result = await signAndExecuteTransaction({ transaction: tx });
      console.log("✅ Combined tx result:", result);

      const digest = result?.digest || result?.effects?.transactionDigest;
      const txBlock = await client.getTransactionBlock({
        digest,
        options: { showObjectChanges: true },
      });

      const createdObjects = txBlock.objectChanges?.filter((c) => c.type === "created");
      const lockObj = createdObjects?.find((c) =>
        c.objectType.includes("Lock") || c.objectType.includes("Locker") || c.objectType.includes("YieldLock")
      );

      if (lockObj) setLockerId(lockObj.objectId);
      setTxHash(digest);
      setConfirmLock(false);
      setLockSuccess(true);

    } catch (error) {
      console.error("Lock creation failed:", error);
      alert(`Lock creation failed: ${error?.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formFields = [
    {
      type: "token",
      label: "Select Token",
      icon: <MdErrorOutline className="icons-small" />,
      content: (
        <button type="button" onClick={() => setSelectToken(!selectToken)}>
          SUI Token <IoIosArrowDown className="icons-small" />
        </button>
      ),
      dropdown: selectToken && (
        <div className="token-dropdown">
          <p>SUI - Sui Network Token</p>
        </div>
      ),
    },
    {
      type: "amount",
      label: "Amount",
      content: (
        <div className="amount-field">
          <input
            type="text"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <span className="max-btn">Max</span>
        </div>
      ),
    },
    {
      type: "duration",
      label: "Lock Duration",
      content: (
        <div className="duration-buttons">
          {[30, 60, 90, 120].map((days, idx) => (
            <button
              key={idx}
              type="button"
              className={`duration ${selectedDuration === days ? "active" : ""}`}
              onClick={() => handleDurationSelect(days)}
            >
              {days} Days
            </button>
          ))}
        </div>
      ),
    },
    {
      type: "customDate",
      label: "",
      content: (
        <button type="button" onClick={() => setSelectDate(!selectDate)}>
          <MdOutlineDateRange className="icons-small" />{" "}
          {selectedDate || "Pick a custom date"}
        </button>
      ),
      dateInput: selectDate && (
        <input
          type="date"
          className="select-date"
          onChange={handleDateChange}
          min={new Date().toISOString().split('T')[0]}
        />
      ),
    },
    {
      type: "yield",
      label: "Estimated Yield (Annual)",
      content: (
        <div className="yield-card">
          <div className="yield-card-text">
            <h3>Estimated Yield (Annual)</h3>
            <p>Based on current market conditions and lock duration</p>
          </div>
          <div className="yield-card-value">+{(parseFloat(amount || "0") * 0.08).toFixed(2)} SUI</div>
        </div>
      ),
    },
    {
      type: "memo",
      label: "Memo (Optional)",
      content: (
        <textarea
          className="memo"
          placeholder="Reason for lock (e.g., Long-term holding, Yield farming...)"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        ></textarea>
      ),
    },
  ];

  return (
    <div className="lock-container">
      {/* Left Side */}
      <div className="lock-form">
        <div className="form-header">
          <MdOutlineLock className="icons-big" />
          <h3>Create Lock</h3>
        </div>

        {/* Wallet Connection */}
        <div className="wallet-connection">
          <ConnectButton />
          {!currentAccount && (
            <p className="connection-status">Please connect your wallet to continue</p>
          )}
        </div>

        <section className="lock-subform">
          <div className="lock-tabs">
            <button
              className={`${!nftLock ? "tab active" : "tab"}`}
              id="token"
              onClick={handleSwitch}
            >
              Token Lock
            </button>
            <button
              className={`${nftLock ? "tab active" : "tab"}`}
              id="nft"
              onClick={handleSwitch}
            >
              NFT Lock
            </button>
          </div>

          {nftLock ? (
            <CreateLockNft />
          ) : (
            <div>
              {formFields.map((field, idx) => (
                <div className="form-label" key={idx}>
                  {field.label && (
                    <span>
                      {field.label} {field.icon && field.icon}
                    </span>
                  )}
                  {field.content}
                  {field.dropdown}
                  {field.dateInput}
                </div>
              ))}

              <div className="action-buttons">
                <button
                  className="confirm"
                  onClick={() => setConfirmLock(true)}
                  type="button"
                  disabled={!currentAccount || !amount || parseFloat(amount) <= 0}
                >
                  {isLoading ? "Processing..." : "Confirm Lock"}
                </button>
                <Link to="/dashboard" className="cancel">
                  Cancel
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Right Side */}
      <section className="lock-preview-container">
        <div className="lock-preview">
          <div className="form-header">
            <MdErrorOutline className="icons-big" />
            <h3 className="lock-preview-h3">Lock Summary</h3>
          </div>

          {preview && amount ? (
            <div className="modal-staking-card">
              <div className="modal-staking-nft-info">
                <div className="modal-staking-nft-icon">🪙</div>
                <div>
                  <h2 className="modal-staking-nft-title">{amount} SUI</h2>
                  <p className="modal-staking-nft-subtitle">SUI Token</p>
                </div>
              </div>
              <hr className="modal-staking-divider" />
              <div className="modal-staking-info-row">
                <div className="modal-staking-label">
                  <MdOutlineDateRange className="icons-small" /> Lock Start
                </div>
                <div className="modal-staking-value">Today</div>
              </div>
              <div className="modal-staking-info-row">
                <div className="modal-staking-label">
                  <GoUnlock className="icons-small" /> Unlock Date
                </div>
                <div className="modal-staking-value">{getUnlockDate()}</div>
              </div>
              <div className="modal-staking-info-row">
                <div className="modal-staking-label">
                  <MdErrorOutline className="icons-small" /> Duration
                </div>
                <div className="modal-staking-value">
                  {selectedDate ? 
                    `${Math.ceil((new Date(selectedDate).getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000))} days` : 
                    `${selectedDuration} days`
                  }
                </div>
              </div>
              <div className="modal-staking-yield-box">
                <div className="modal-staking-yield-header">
                  <IoIosTrendingUp className="icons-small" /> Estimated Yield (Annual)
                </div>
                <div className="modal-staking-yield-amount">
                  +{(parseFloat(amount || "0") * 0.08).toFixed(2)} SUI
                </div>
                <div className="modal-staking-yield-rate">~8% Annual rate</div>
              </div>
              <hr className="modal-staking-divider" />
              <div className="modal-staking-info-row">
                <div className="modal-staking-label">
                  <PiGasPump className="icons-small" /> Gas Fee
                </div>
                <div className="modal-staking-value">~0.05 SUI</div>
              </div>
              {memo && (
                <>
                  <hr className="modal-staking-divider" />
                  <div className="modal-staking-info-row">
                    <div className="modal-staking-label">Memo</div>
                    <div className="modal-staking-value">{memo}</div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="preview-placeholder">
              <MdErrorOutline className="icons-large" />
              <p>Complete the form to see your lock preview</p>
            </div>
          )}
        </div>

        {lockSuccess && (
          <div className="lock-confirmed">
            <h4>Lock Created Successfully!</h4>
            <p>Your assets have been locked and will start earning yield.</p>
            {lockerId && (
              <div className="lock-details">
                <p><strong>Lock ID:</strong> {lockerId}</p>
                <p><strong>Transaction:</strong> {txHash}</p>
              </div>
            )}
          </div>
        )}
      </section>

      {confirmLock && (
        <div className="confirm-lock-modal">
          <div className="confirm-lock-container">
            <div className="confirm-lock-header">
              <h2>
                <PiCheckSquareOffsetBold className="icons-small" />
                Confirm Lock Creation
              </h2>
              <p>
                Please review your lock details before confirming. This action
                cannot be undone.
              </p>
              <button
                className="confirm-lock-close"
                type="button"
                onClick={() => setConfirmLock(false)}
                disabled={isLoading}
              >
                &times;
              </button>
            </div>

            <div className="confirm-lock-details">
              <div className="confirm-lock-row">
                <span>Asset</span>
                <span className="confirm-lock-value">{amount} SUI</span>
              </div>
              <div className="confirm-lock-row">
                <span>Lock Duration</span>
                <span className="confirm-lock-value">
                  {selectedDate ? 
                    `${Math.ceil((new Date(selectedDate).getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000))} days` : 
                    `${selectedDuration} days`
                  }
                </span>
              </div>
              <div className="confirm-lock-row">
                <span>Unlock Date</span>
                <span className="confirm-lock-value">{getUnlockDate()}</span>
              </div>
              <div className="confirm-lock-row">
                <span>Est. Yield</span>
                <span className="confirm-lock-yield">
                  +{(parseFloat(amount || "0") * 0.08).toFixed(2)} SUI
                </span>
              </div>
              <div className="confirm-lock-row">
                <span>Wallet</span>
                <span className="confirm-lock-value">
                  {currentAccount?.address.slice(0, 6)}...{currentAccount?.address.slice(-4)}
                </span>
              </div>
            </div>
            <hr className="modal-staking-divider" />

            <div className="confirm-lock-warning">
              <IoWarningOutline className="icons-small" />
              <div>
                <span>Important Notice</span>
                <p>
                  Once locked, your assets cannot be accessed until unlock
                  date. Make sure you're comfortable with the lock duration.
                </p>
              </div>
            </div>

            <div className="confirm-lock-actions">
              <button
                className="confirm-lock-cancel"
                onClick={() => setConfirmLock(false)}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                className="confirm-lock-confirm"
                onClick={createLock}
                disabled={isLoading || !currentAccount}
              >
                {isLoading ? "Creating Lock..." : "Confirm Lock"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateLockToken;