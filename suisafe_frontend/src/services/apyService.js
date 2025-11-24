// src/services/apyService.js

const APY_CACHE_DURATION = 300000; // 5 minutes
let apyCache = null;
let lastApyFetchTime = 0;

/**
 * Scallop market IDs for each token
 */
const SCALLOP_MARKET_IDS = {
  SUI: "sui",
  USDC: "usdc",
  WAL: "wal",
  DEEP: "deep",
  SCA: "sca",
};

/**
 * Fetch current APY rates from Scallop
 * @returns {Promise<Object>} APY map: { SUI: 8.5, USDC: 5.2, ... }
 */
export async function fetchScallopAPYs() {
  const now = Date.now();

  if (apyCache && now - lastApyFetchTime < APY_CACHE_DURATION) {
    return apyCache;
  }

  try {
    const response = await fetch("https://sdk.api.scallop.io/api/market");
    const data = await response.json();

    const apys = {};

    // Extract APYs from pools array
    if (data.pools && Array.isArray(data.pools)) {
      data.pools.forEach((pool) => {
        if (pool.symbol && pool.supplyApy !== undefined) {
          const symbol = pool.symbol.toUpperCase().replace(/^S/, "");
          const apy = parseFloat(pool.supplyApy || 0);
          apys[symbol] = apy * 100; // Convert decimal to percentage
        }
      });
    }

    return apys;
  } catch (error) {
    console.error("Failed to fetch Scallop APYs:", error);

    // Fallback APYs
    return {
      SUI: 1,
      USDC: 5.2,
      WAL: 12.0,
      DEEP: 10.5,
      SCA: 15.0,
    };
  }
}

/**
 * Calculate yield earned based on principal, APY, and time elapsed
 *
 * @param {number} principal - Principal amount in token units
 * @param {number} apy - Annual percentage yield (e.g., 8.5 for 8.5%)
 * @param {number} startTime - Lock start timestamp (ms)
 * @param {number} currentTime - Current timestamp (ms)
 * @returns {number} Yield earned in token units
 */
export function calculateYieldEarned(principal, apy, startTime, currentTime) {
  const timeElapsedMs = currentTime - startTime;
  const timeElapsedYears = timeElapsedMs / (365.25 * 24 * 60 * 60 * 1000);

  // Simple interest calculation (adjust for compound interest if needed)
  const yieldAmount = principal * (apy / 100) * timeElapsedYears;

  return yieldAmount;
}
