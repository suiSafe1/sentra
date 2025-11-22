// ============================================================================
// FILE: src/utils/suiHelpers.js
// PURPOSE: Helper functions for fetching and processing on-chain data
// ============================================================================

import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";

// ============================================================================
// CONSTANTS
// ============================================================================
export const PACKAGE_ID =
  "0x42c0b7b63930789bf081639163f2f451101d20ca61ead1a237dc9a74119a76f5";
export const REGISTRY_ID =
  "0x9a2bff9675092cb3d20f5917dbfeea643307a787d558cf83c0bceaa51206851b";
export const PLATFORM_ID =
  "0x5093a8075a2b8309c981d2d033c7aa620d89592446f548ef96e7fee9f62b6604";

export const client = new SuiClient({ url: getFullnodeUrl("mainnet") });

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert MIST to SUI (1 SUI = 1_000_000_000 MIST)
 */
export function mistToSui(mist) {
  return mist / 1_000_000_000;
}

/**
 * Calculate if a lock is ready for withdrawal (unlocked)
 */
export function isLockUnlocked(startTime, durationMs) {
  const now = Date.now();
  const unlockTime = startTime + durationMs;
  return now >= unlockTime;
}

// ============================================================================
// DATA FETCHING FUNCTIONS
// ============================================================================

/**
 * Fetch all Lock<CoinType> objects owned by a user
 * These are regular non-yield locks
 */
export async function fetchUserLocks(userAddress) {
  try {
    // Get all objects owned by user
    const ownedObjects = await client.getOwnedObjects({
      owner: userAddress,
      options: {
        showType: true,
        showContent: true,
      },
    });

    // Filter for Lock objects (they have "Lock<" in their type)
    const locks = ownedObjects.data
      .filter((obj) => {
        const type = obj.data?.type;
        return type && type.includes(`${PACKAGE_ID}::sentra::Lock<`);
      })
      .map((obj) => {
        const fields = obj.data?.content?.fields;
        return {
          id: obj.data.objectId,
          type: obj.data.type,
          owner: fields?.owner,
          // Balance is stored as a nested object with a "value" field
          balance: fields?.balance ? parseInt(fields.balance) : 0,
          startTime: fields?.start_time ? parseInt(fields.start_time) : 0,
          durationMs: fields?.duration_ms ? parseInt(fields.duration_ms) : 0,
          strategy: fields?.strategy,
        };
      });

    return locks;
  } catch (error) {
    console.error("Error fetching user locks:", error);
    return [];
  }
}

/**
 * Fetch all YieldLock<MarketCoin> objects owned by a user
 * These are yield-bearing locks
 */
export async function fetchUserYieldLocks(userAddress) {
  try {
    const ownedObjects = await client.getOwnedObjects({
      owner: userAddress,
      options: {
        showType: true,
        showContent: true,
      },
    });

    // Filter for YieldLock objects
    const yieldLocks = ownedObjects.data
      .filter((obj) => {
        const type = obj.data?.type;
        return type && type.includes(`${PACKAGE_ID}::sentra::YieldLock<`);
      })
      .map((obj) => {
        const fields = obj.data?.content?.fields;
        return {
          id: obj.data.objectId,
          type: obj.data.type,
          owner: fields?.owner,
          principalAmount: fields?.principal_amount
            ? parseInt(fields.principal_amount)
            : 0,
          // Market balance is nested, extract the value
          marketBalance: fields?.market_balance
            ? parseInt(fields.market_balance)
            : 0,
          startTime: fields?.start_time ? parseInt(fields.start_time) : 0,
          durationMs: fields?.duration_ms ? parseInt(fields.duration_ms) : 0,
          strategy: fields?.strategy,
          coinType: fields?.coin_type,
        };
      });

    return yieldLocks;
  } catch (error) {
    console.error("Error fetching user yield locks:", error);
    return [];
  }
}

/**
 * Calculate total yield earned from YieldLocks
 * Yield = current market_balance - principal_amount
 * This gives us the UNREALIZED yield (not yet withdrawn)
 */
export function calculateUnrealizedYield(yieldLocks) {
  return yieldLocks.reduce((total, lock) => {
    // Yield is the difference between current market balance and original principal
    const yieldAmount = Math.max(0, lock.marketBalance - lock.principalAmount);
    return total + yieldAmount;
  }, 0);
}

/**
 * Fetch historical yield from YieldLockWithdrawn events
 * This queries on-chain events to get REALIZED yield (already withdrawn)
 */
export async function fetchRealizedYield(userAddress) {
  try {
    // Query YieldLockWithdrawn events
    const events = await client.queryEvents({
      query: {
        MoveEventType: `${PACKAGE_ID}::sentra::YieldLockWithdrawn`,
      },
      limit: 50, // Adjust based on expected volume
    });

    // Filter events for this user and sum up user_yield_amount
    const userEvents = events.data.filter(
      (event) => event.parsedJson?.owner === userAddress
    );

    const totalYieldClaimed = userEvents.reduce((sum, event) => {
      return sum + (parseInt(event.parsedJson?.user_yield_amount) || 0);
    }, 0);

    return totalYieldClaimed;
  } catch (error) {
    console.error("Error fetching yield events:", error);
    return 0;
  }
}

/**
 * Main function to fetch all dashboard data
 * Returns: { totalValueLocked, totalYieldEarned, activeLocks, readyForWithdrawal }
 */
export async function fetchDashboardData(userAddress) {
  if (!userAddress) {
    return {
      totalValueLocked: 0,
      totalYieldEarned: 0,
      activeLocks: 0,
      readyForWithdrawal: 0,
    };
  }

  try {
    // Fetch all data in parallel for performance
    const [locks, yieldLocks, realizedYield] = await Promise.all([
      fetchUserLocks(userAddress),
      fetchUserYieldLocks(userAddress),
      fetchRealizedYield(userAddress),
    ]);

    // ========================================
    // 1. TOTAL VALUE LOCKED (TVL)
    // ========================================
    // For regular locks: sum up all balance values
    const regularTVL = locks.reduce((sum, lock) => sum + lock.balance, 0);

    // For yield locks: use principal_amount (the original locked amount)
    // NOT market_balance, because that includes unrealized yield
    const yieldTVL = yieldLocks.reduce(
      (sum, lock) => sum + lock.principalAmount,
      0
    );

    const totalTVL = regularTVL + yieldTVL;

    // ========================================
    // 2. TOTAL YIELD EARNED
    // ========================================
    // Unrealized yield from active yield locks
    const unrealizedYield = calculateUnrealizedYield(yieldLocks);

    // Total yield = realized (from events) + unrealized (from current locks)
    const totalYield = realizedYield + unrealizedYield;

    // ========================================
    // 3. ACTIVE LOCKS
    // ========================================
    // All locks that haven't been withdrawn yet
    const totalActiveLocks = locks.length + yieldLocks.length;

    // ========================================
    // 4. READY FOR WITHDRAWAL
    // ========================================
    // Count locks where current time >= unlock_time
    const readyCount = [...locks, ...yieldLocks].filter((lock) =>
      isLockUnlocked(lock.startTime, lock.durationMs)
    ).length;

    return {
      totalValueLocked: totalTVL,
      totalYieldEarned: totalYield,
      activeLocks: totalActiveLocks,
      readyForWithdrawal: readyCount,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
}

/**
 * Format currency for display (converts MIST to SUI with 2 decimal places)
 */
export function formatSuiAmount(amountInMist) {
  const sui = mistToSui(amountInMist);
  return sui.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
