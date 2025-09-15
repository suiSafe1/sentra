import React, { useState, useEffect } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import "../styles/Lock.css";

const PACKAGE_ID = '0x690cc8f7277cbb2622de286387fc3bec5b6de4bdbb155d0ae2a0852d154ab194';
const REGISTRY_ID = '0xa92e808ecf2e5a129b7a801719d8299528c644ae0f609054fa17f902610aa93a';
const PLATFORM_ID = '0x07a716a59b9a44fa761e417ef568367cb2ed3a9cf7cfcf1c281c1ad257d806bc';
const CLOCK_ID = '0x6';

const SCALLOP_MAINNET_MARKET_ID = '0xa757975255146dc9686aa823b7838b507f315d704f428cbadad2f4ea061939d9';
const SCALLOP_MAINNET_VERSION_ID = '0x07871c4b3c847a0f674510d4978d5cf6f960452795e8ff6f189fd2088a3f6ac7';

const client = new SuiClient({ url: getFullnodeUrl('mainnet') });

function extractBigInt(fields, ...candidates) {
  for (const cand of candidates) {
    if (Array.isArray(cand)) {
      let node = fields;
      let ok = true;
      for (const seg of cand) {
        if (node == null) { ok = false; break; }
        if (node[seg] !== undefined) {
          node = node[seg];
        } else if (node.fields && node.fields[seg] !== undefined) {
          node = node.fields[seg];
        } else {
          ok = false;
          break;
        }
      }
      if (!ok) continue;
      if (typeof node === "string") {
        try { return BigInt(node); } catch { continue; }
      }
      if (node?.value !== undefined) {
        try { return BigInt(node.value); } catch { continue; }
      }
      if (node?.fields?.value !== undefined) {
        try { return BigInt(node.fields.value); } catch { continue; }
      }
    } else {
      const v = fields[cand] ?? fields?.fields?.[cand];
      if (v === undefined) continue;
      if (typeof v === "string") {
        try { return BigInt(v); } catch { continue; }
      }
      if (v?.value !== undefined) {
        try { return BigInt(v.value); } catch { continue; }
      }
      if (v?.fields?.value !== undefined) {
        try { return BigInt(v.fields.value); } catch { continue; }
      }
    }
  }

  return BigInt(0);
}

function formatTokenAmountRaw(bigintValue, decimals = 9, displayDecimals = 2) {
  const factor = BigInt(10) ** BigInt(decimals);
  const integer = bigintValue / factor;
  const remainder = bigintValue % factor;
  const frac = Number((remainder * BigInt(10 ** displayDecimals)) / factor);
  return `${integer.toString()}.${frac.toString().padStart(displayDecimals, "0")}`;
}

function extractTimeNumber(fields, ...candidates) {
  const v = extractBigInt(fields, ...candidates);
  const n = Number(v.toString());
  return Number.isFinite(n) ? n : 0;
}

function prettyTokenNameFromType(typeName) {
  console.log("prettyTokenNameFromType received:", typeName, "type:", typeof typeName);
  
  if (!typeName || typeof typeName !== 'string') {
    console.log("Invalid typeName, returning TOKEN");
    return "TOKEN";
  }
  
  if (typeName.includes("::sui::SUI")) return "SUI";
  
  if (typeName.includes("sui") || typeName.includes("SUI")) return "SUI";
  
  const parts = typeName.split("::");
  const result = parts[parts.length - 1] ?? typeName;
  console.log("Token name result:", result);
  return result;
}

function extractCoinType(fields) {
  console.log("Extracting coin type from fields:", fields);
  
  const candidates = [
    fields.coin_type,
    fields?.fields?.coin_type,
    fields.type,
    fields?.fields?.type,
    fields.coinType,
    fields?.fields?.coinType
  ];
  
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    console.log(`Candidate ${i}:`, candidate);
    if (candidate && typeof candidate === 'string') {
      return candidate;
    }
  }
  
  console.log("No coin_type found in expected locations. Full fields structure:", JSON.stringify(fields, null, 2));
  
  return null;
}

function TokenLock() {
  const [previewData, setPreviewData] = useState(null);
  const [userLocks, setUserLocks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [withdrawing, setWithdrawing] = useState(null);

  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const calendar = (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* calendar path */}
    </svg>
  );

  const clock = (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* clock path */}
    </svg>
  );

  const trending = (
    <svg width="14" height="9" viewBox="0 0 14 9" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* trending path */}
    </svg>
  );

  const sui = (
    <svg width="20" height="26" viewBox="0 0 20 26" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg">
      {/* SUI path */}
    </svg>
  );

  const fetchUserLocks = async () => {
  if (!currentAccount) return;

  setIsLoading(true);
  try {
    const ownedObjects = await client.getOwnedObjects({
      owner: currentAccount.address,
      filter: {
        StructType: `${PACKAGE_ID}::sui_safe::YieldLock`
      },
      options: {
        showContent: true,
        showType: true,
      }
    });

    const locks = [];

    for (const objRef of ownedObjects.data) {
      try {
        if (objRef?.data?.content?.dataType !== "moveObject") continue;
        const fields = objRef.data.content.fields ?? {};
        
        console.log("Processing object:", objRef.data.objectId);
        console.log("Object type:", objRef.data.type);
        console.log("Fields:", fields);

        const startTimeMs = extractTimeNumber(fields, "start_time", ["start_time"]);
        const durationMs = extractTimeNumber(fields, "duration_ms", ["duration_ms"]);
        const unlockTime = startTimeMs + durationMs;

        const principalBig = extractBigInt(fields, "principal_amount", ["principal_amount"], ["market_balance","value"], ["market_balance","fields","value"], "amount", "balance", ["balance","value"]);
        const tokenAmountStr = formatTokenAmountRaw(principalBig, 9, 2);

        const coinTypeRaw = extractCoinType(fields);
        
        let tokenName;
        if (!coinTypeRaw && objRef.data.type) {
          console.log("Trying to extract from object type:", objRef.data.type);
          const typeMatch = objRef.data.type.match(/<([^>]+)>/);
          if (typeMatch && typeMatch[1]) {
            console.log("Extracted type from object type:", typeMatch[1]);
            tokenName = prettyTokenNameFromType(typeMatch[1]);
          } else {
            tokenName = "SUI"; 
          }
        } else {
          tokenName = prettyTokenNameFromType(coinTypeRaw);
        }

        console.log("Final token name:", tokenName);

        const approxYield = (() => {
          try {
            const principalNum = Number(principalBig.toString()) || 0;
            const display = principalNum === 0 ? 0 : (principalNum / 1_000_000_000) * 0.08;
            return display.toFixed(2);
          } catch {
            return "0.00";
          }
        })();

        const now = Date.now();
        const isExpired = unlockTime <= now;
        const msLeft = Math.max(0, unlockTime - now);
        const daysLeft = Math.ceil(msLeft / (24 * 60 * 60 * 1000));
        const percentElapsed = durationMs > 0 ? Math.min(100, Math.max(0, Math.round(((now - startTimeMs) / durationMs) * 100))) : 0;

        const lockObject = {
          objectId: objRef.data.objectId,
          yieldLockId: objRef.data.objectId,
          tokenName,
          tokenAmount: tokenAmountStr,
          principalRaw: principalBig.toString(),
          icon: sui,
          startDate: startTimeMs > 0 ? new Date(startTimeMs).toLocaleString() : "—",
          endDate: durationMs > 0 ? new Date(unlockTime).toLocaleString() : "—",
          timeLeft: daysLeft,
          timeLeftMs: msLeft,
          percentElapsed,
          yieldEarned: approxYield,
          isExpired,
          memo: (fields.memo ?? fields.fields?.memo) || "",
          marketCoinId: null,
        };

        locks.push(lockObject);
      } catch (innerErr) {
        console.warn("failed parse object", objRef, innerErr);
        continue;
      }
    }

    setUserLocks(locks);
  } catch (error) {
    console.error("Failed to fetch user locks:", error);
    setUserLocks([]);
  } finally {
    setIsLoading(false);
  }
};

  const withdrawLock = async (asset) => {
    if (!currentAccount || !asset.yieldLockId) {
      alert("Please connect your wallet first");
      return;
    }

    setWithdrawing(asset.yieldLockId);

    try {
      const tx = new Transaction();
      tx.setGasBudget(10000000);

      const marketCoinHandle = tx.moveCall({
        target: `${PACKAGE_ID}::sui_safe::unlock_yield_lock_market_coin`,
        arguments: [
          tx.object(asset.yieldLockId),
          tx.object(PLATFORM_ID),
        ],
        typeArguments: ['0xefe8b36d5b2e43728cc323298626b83177803521d195cfb11e15b910e892fddf::reserve::MarketCoin<0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI>'],
      });

      const redeemedCoinHandle = tx.moveCall({
        target: `0x83bbe0b3985c5e3857803e2678899b03f3c4a31be75006ab03faf268c014ce41::redeem::redeem`,
        arguments: [
          tx.object(SCALLOP_MAINNET_VERSION_ID),
          tx.object(SCALLOP_MAINNET_MARKET_ID),
          marketCoinHandle,
          tx.object(CLOCK_ID),
        ],
        typeArguments: ['0x2::sui::SUI'],
      });

      tx.moveCall({
        target: `${PACKAGE_ID}::sui_safe::complete_yield_withdrawal_with_redeemed_coin`,
        arguments: [
          tx.object(asset.yieldLockId),
          redeemedCoinHandle,
          tx.object(PLATFORM_ID),
          tx.object(REGISTRY_ID),
          tx.object(CLOCK_ID),
        ],
        typeArguments: [
          '0x2::sui::SUI',
          '0xefe8b36d5b2e43728cc323298626b83177803521d195cfb11e15b910e892fddf::reserve::MarketCoin<0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI>'
        ],
      });

      const result = await signAndExecuteTransaction({ transaction: tx });
      console.log("✅ Combined withdrawal result:", result);

      await fetchUserLocks();
      alert("Withdrawal successful!");

    } catch (error) {
      console.error("Withdraw failed:", error);
      if (error.message?.includes("code 2") || error.toString().includes("too early")) {
        alert("Error: It's too early to withdraw. Please wait until the lock duration ends.");
      } else if (error.message?.includes("Insufficient") || error.toString().includes("insufficient")) {
        alert("Error: Insufficient balance or gas fees.");
      } else {
        alert(`Withdraw failed: ${error.message || error}`);
      }
    } finally {
      setWithdrawing(null);
    }
  };

  useEffect(() => {
    if (currentAccount) {
      fetchUserLocks();
    } else {
      setUserLocks([]);
    }
  }, [currentAccount]);

  const StakingCard = ({
    objectId,
    yieldLockId,
    icon,
    tokenName,
    tokenAmount,
    startDate,
    endDate,
    timeLeft,
    yieldEarned,
    isExpired,
    memo,
    marketCoinId,
    percentElapsed,
    onClick
  }) => (
    <div className="staking-card" onClick={onClick}>
      <span className="token-icon">{icon}</span>

      <section>
        <div className="token-info">
          <h3 className="token-name">{tokenName}</h3>
          <p className="token-amount">{tokenAmount} {tokenName}</p>
          {memo && <p className="token-memo">"{memo}"</p>}
        </div>

        <div className="detail-block">
          <p className="label">
            <span className="label">{calendar}</span> Duration
          </p>
          <p className="value">
            {startDate} <br />
            <span className="value-span">to {endDate}</span>
          </p>
        </div>

        <section className="detailblock">
          <div className="detail-block2">
            <div className="detail-block3">
              <p className="label">
                <span className="label">{clock}</span> Time Remaining
              </p>

              <div className="progress-bar">
                <div
                  className={isExpired ? "progress-fill-full" : "progress-fill"}
                  style={{ width: `${isExpired ? 100 : percentElapsed}%` }}
                />
              </div>

              <p className="value-span">
                {isExpired ? "Expired" : `${timeLeft} days left`}
              </p>
            </div>

            <div className="detail-block">
              <span className={`status ${isExpired ? "expired" : "active"}`}>
                {isExpired ? "Ready" : "Active"}
              </span>
            </div>
          </div>

          <div className="detail-block">
            <p className="label">
              <span className="label">{trending}</span> Yield Earned
            </p>
            <p className="yield">{yieldEarned} {tokenName}</p>
          </div>
        </section>

        {/* Buttons */}
          <button 
            className="withdraw-btn"
            onClick={() => withdrawLock({
              yieldLockId,
              tokenName,
              tokenAmount,
              yieldEarned,
              marketCoinId,
              early: !isExpired,
            })}
            disabled={withdrawing === yieldLockId}
          >
          {withdrawing === yieldLockId
              ? "Withdrawing..."
              : isExpired
              ? "Withdraw"
              : "Withdraw"}
          </button>
      </section>
    </div>
  );

  if (isLoading) {
    return (
      <div className="loading-container">
        <p>Loading your locks...</p>
      </div>
    );
  }

  if (!currentAccount) {
    return (
      <div className="no-wallet-container">
        <p>Please connect your wallet to view your locks</p>
      </div>
    );
  }

  if (userLocks.length === 0) {
    return (
      <div className="no-locks-container">
        <p>No locks found. Create your first lock to get started!</p>
        <button 
          className="refresh-btn"
          onClick={fetchUserLocks}
          disabled={isLoading}
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="locks-header">
        <button 
          className="refresh-btn"
          onClick={fetchUserLocks}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {userLocks.map((data, idx) => (
        <StakingCard
          key={idx}
          {...data}
          onClick={() => setPreviewData(data)}
        />
      ))}

      <div className="see-all-container">
        <button 
          className="see-all-btn"
          onClick={fetchUserLocks}
          disabled={isLoading}
        >
          {isLoading ? "Refreshing..." : "See All"}
        </button>
      </div>
    </div>
  );
}

export default TokenLock;
