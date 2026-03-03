const APY_CACHE_DURATION = 300000; // 5 minutes
let apyCache = null;
let lastApyFetchTime = 0;

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
 * @returns {Promise<Object>}
 */
export async function fetchScallopAPYs() {
  const now = Date.now();

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

    if (data.pools && Array.isArray(data.pools)) {
      data.pools.forEach((pool) => {
        if (pool.symbol && pool.supplyApy !== undefined) {
          const apiSymbol = pool.symbol.toUpperCase();

          const ourSymbol = SYMBOL_MAPPING[apiSymbol];

          if (ourSymbol) {
            const apy = parseFloat(pool.supplyApy || 0);
            apys[ourSymbol] = apy * 100;
          }
        }
      });
    }

    if (Object.keys(apys).length === 0) {
    }

    apyCache = apys;
    lastApyFetchTime = now;

    const expectedTokens = ["SUI", "USDC", "WAL", "DEEP", "SCA"];
    expectedTokens.forEach((token) => {
      if (!apys[token]) {
        apys[token] = 0;
      }
    });

    return apys;
  } catch (error) {
    if (apyCache) {
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
