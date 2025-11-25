const APY_CACHE_DURATION = 300000; // 5 minutes
let apyCache = null;
let lastApyFetchTime = 0;

/**
 * Mapping from API symbols to our token symbols
 * The Scallop API returns different symbols than we use
 */
const SYMBOL_MAPPING = {
  SSUI: "SUI",
  SUSDC: "USDC",
  SWAL: "WAL",
  SDEEP: "DEEP",
  SSCA: "SCA",
  SUI: "SUI",
  USDC: "USDC",
  WAL: "WAL",
  DEEP: "DEEP",
  SCA: "SCA",
};

/**
 * Fetch current APY rates from Scallop
 * @returns {Promise<Object>} APY map: { SUI: 8.5, USDC: 5.2, ... }
 */
export async function fetchScallopAPYs() {
  const now = Date.now();

  // Return cached APYs if still valid
  if (apyCache && now - lastApyFetchTime < APY_CACHE_DURATION) {
    return apyCache;
  }

  try {
    const response = await fetch("https://sdk.api.scallop.io/api/market");

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    const apys = {};

    console.log("Raw Scallop API response:", data);

    // Extract APYs from pools array
    if (data.pools && Array.isArray(data.pools)) {
      data.pools.forEach((pool) => {
        if (pool.symbol && pool.supplyApy !== undefined) {
          const apiSymbol = pool.symbol.toUpperCase();

          // Try to map the symbol
          const ourSymbol = SYMBOL_MAPPING[apiSymbol];

          if (ourSymbol) {
            const apy = parseFloat(pool.supplyApy || 0);
            apys[ourSymbol] = apy * 100;
            console.log(
              `Mapped ${apiSymbol} (${pool.symbol}) to ${ourSymbol}: ${
                apy * 100
              }%`
            );
          }
        }
      });
    }

    if (Object.keys(apys).length === 0) {
      console.warn(
        "No matching tokens found. Available pools:",
        data.pools?.map((p) => ({ symbol: p.symbol, apy: p.supplyApy }))
      );
    }

    apyCache = apys;
    lastApyFetchTime = now;

    console.log("Parsed Scallop APYs:", apys);

    const expectedTokens = ["SUI", "USDC", "WAL", "DEEP", "SCA"];
    expectedTokens.forEach((token) => {
      if (!apys[token]) {
        console.warn(`Missing APY for ${token}, using 0`);
        apys[token] = 0;
      }
    });

    return apys;
  } catch (error) {
    console.error("Failed to fetch Scallop APYs:", error);

    if (apyCache) {
      console.log("Using cached APY data");
      return apyCache;
    }

    // Fallback APYs
    const fallbackApys = {
      SUI: 18.5,
      USDC: 15.2,
      WAL: 112.0,
      DEEP: 110.5,
      SCA: 115.0,
    };

    console.log("Using fallback APYs:", fallbackApys);
    return fallbackApys;
  }
}

/**
 * Calculate yield earned based on principal, APY, and time elapsed
 *
 * @param {number} principal
 * @param {number} apy
 * @param {number} startTime
 * @param {number} currentTime
 * @returns {number}
 */
export function calculateYieldEarned(principal, apy, startTime, currentTime) {
  const timeElapsedMs = currentTime - startTime;
  const timeElapsedYears = timeElapsedMs / (365.25 * 24 * 60 * 60 * 1000);

  const yieldAmount = principal * (apy / 100) * timeElapsedYears;

  return yieldAmount;
}
