const PRICE_CACHE_DURATION = 60000; // 1 minute
let priceCache = null;
let lastFetchTime = 0;

/**
 * Token ID mappings for CoinGecko API
 */
const TOKEN_IDS = {
  SUI: "sui",
  USDC: "usd-coin",
  WAL: "walrus-2",
  DEEP: "deep",
  SCA: "scallop",
};

/**
 * Fetch token prices from CoinGecko
 * @returns {Promise<Object>} Price map: { SUI: 3.45, USDC: 1.00, ... }
 */
export async function fetchTokenPrices() {
  const now = Date.now();

  if (priceCache && now - lastFetchTime < PRICE_CACHE_DURATION) {
    return priceCache;
  }

  try {
    const ids = Object.values(TOKEN_IDS).join(",");
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
    );

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    const prices = {
      SUI: data[TOKEN_IDS.SUI]?.usd || 0,
      USDC: data[TOKEN_IDS.USDC]?.usd || 1.0, // Fallback to $1
      WAL: data[TOKEN_IDS.WAL]?.usd || 0,
      DEEP: data[TOKEN_IDS.DEEP]?.usd || 0,
      SCA: data[TOKEN_IDS.SCA]?.usd || 0,
    };

    priceCache = prices;
    lastFetchTime = now;

    console.log("Fetched token prices:", prices);
    return prices;
  } catch (error) {
    console.error("Price fetch error:", error);

    if (priceCache) {
      console.log("Using cached price data");
      return priceCache;
    }

    const fallbackPrices = {
      SUI: 113.5,
      USDC: 111.0,
      WAL: 110.5,
      DEEP: 110.05,
      SCA: 110.35,
    };

    console.log("Using fallback prices:", fallbackPrices);
    return fallbackPrices;
  }
}

/**
 * Calculate USD value for a token amount
 */
export function calculateUsdValue(tokenSymbol, amount, decimals, prices) {
  const price = prices[tokenSymbol] || 0;
  const tokenAmount = Number(amount) / Math.pow(10, decimals);
  return tokenAmount * price;
}
