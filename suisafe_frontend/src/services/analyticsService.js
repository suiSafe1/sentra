// src/services/analyticsService.js

import {
  client,
  PACKAGE_ID,
  PLATFORM_ID,
  REGISTRY_ID,
} from "../constants/Constants";

/**
 * Your analytics module package ID
 * Update this with your actual analytics module package ID
 */
const ANALYTICS_PACKAGE_ID = PACKAGE_ID; // Assuming analytics is part of main package

/**
 * Supported token types - must match your Move contract
 */
const TOKEN_TYPES = {
  SUI: "0x2::sui::SUI",
  USDC: "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
  WAL: "0x356a26eb9e012a68958082340d4c4116e7f55615cf27affcff209cf0ae544f59::wal::WAL",
  DEEP: "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP",
  SCA: "0x7016aae72cfc67f2fadf55769c0a7dd54291a583b63051a5ed71081cce836ac6::sca::SCA",
};

const SCOIN_TYPES = {
  SUI: "0xaafc4f740de0dd0dde642a31148fb94517087052f19afb0f7bed1dc41a50c77b::scallop_sui::SCALLOP_SUI",
  USDC: "0x854950aa624b1df59fe64e630b2ba7c550642e9342267a33061d59fb31582da5::scallop_usdc::SCALLOP_USDC",
  WAL: "0x622345b3f80ea5947567760eec7b9639d0582adcfd6ab9fccb85437aeda7c0d0::scallop_wal::SCALLOP_WAL",
  DEEP: "0xeb7a05a3224837c5e5503575aed0be73c091d1ce5e43aa3c3e716e0ae614608f::scallop_deep::SCALLOP_DEEP",
  SCA: "0x5ca17430c1d046fae9edeaa8fd76c7b4193a00d764a0ecfa9418d733ad27bc1e::scallop_sca::SCALLOP_SCA",
};

/**
 * Fetch global TVL stats for all tokens
 * Uses analytics::get_all_tvl() from your Move module
 */
export async function fetchGlobalTVL() {
  try {
    const txb = await client.devInspectTransactionBlock({
      transactionBlock: {
        kind: "moveCall",
        target: `${ANALYTICS_PACKAGE_ID}::analytics::get_all_tvl`,
        arguments: [PLATFORM_ID],
        typeArguments: [],
      },
      sender:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
    });

    if (!txb.results || !txb.results[0]) {
      throw new Error("No results from TVL query");
    }

    // Parse the returned vector<TVLStats>
    const returnValues = txb.results[0].returnValues;
    if (!returnValues || returnValues.length === 0) {
      return [];
    }

    // Decode the BCS data
    const [data] = returnValues;
    // This would need proper BCS deserialization
    // For now, we'll use the alternative approach below

    return [];
  } catch (error) {
    console.error("Failed to fetch global TVL:", error);
    return [];
  }
}

/**
 * Fetch TVL for a specific token
 * Uses analytics::get_tvl_stats<CoinType>()
 */
export async function fetchTokenTVL(tokenSymbol) {
  const coinType = TOKEN_TYPES[tokenSymbol];
  if (!coinType) return null;

  try {
    const txb = await client.devInspectTransactionBlock({
      transactionBlock: {
        kind: "moveCall",
        target: `${ANALYTICS_PACKAGE_ID}::analytics::get_tvl_stats`,
        arguments: [PLATFORM_ID],
        typeArguments: [coinType],
      },
      sender:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
    });

    // Parse results
    return txb.results;
  } catch (error) {
    console.error(`Failed to fetch TVL for ${tokenSymbol}:`, error);
    return null;
  }
}

/**
 * Fetch global lock statistics
 * Uses analytics::get_global_lock_stats()
 */
export async function fetchGlobalLockStats() {
  try {
    const txb = await client.devInspectTransactionBlock({
      transactionBlock: {
        kind: "moveCall",
        target: `${ANALYTICS_PACKAGE_ID}::analytics::get_global_lock_stats`,
        arguments: [PLATFORM_ID, REGISTRY_ID],
        typeArguments: [],
      },
      sender:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
    });

    return txb.results;
  } catch (error) {
    console.error("Failed to fetch global lock stats:", error);
    return null;
  }
}

/**
 * Fetch platform statistics (supported tokens, pause status, etc.)
 * Uses analytics::get_platform_stats()
 */
export async function fetchPlatformStats() {
  try {
    const txb = await client.devInspectTransactionBlock({
      transactionBlock: {
        kind: "moveCall",
        target: `${ANALYTICS_PACKAGE_ID}::analytics::get_platform_stats`,
        arguments: [PLATFORM_ID],
        typeArguments: [],
      },
      sender:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
    });

    return txb.results;
  } catch (error) {
    console.error("Failed to fetch platform stats:", error);
    return null;
  }
}

/**
 * Fetch global lock IDs from the Platform object
 * Uses dynamic field access to get the global lock lists
 */
export async function fetchGlobalLockIds() {
  try {
    // Fetch the Platform object to get global lock lists
    const platformObj = await client.getObject({
      id: PLATFORM_ID,
      options: {
        showContent: true,
      },
    });

    if (!platformObj?.data?.content?.fields) {
      console.warn("Could not access Platform fields");
      return { regularLockIds: [], yieldLockIds: [] };
    }

    const fields = platformObj.data.content.fields;

    // Extract lock IDs from global_lock_list and global_yield_lock_list
    const regularLockIds = fields.global_lock_list || [];
    const yieldLockIds = fields.global_yield_lock_list || [];

    return {
      regularLockIds,
      yieldLockIds,
    };
  } catch (error) {
    console.error("Failed to fetch global lock IDs:", error);
    return { regularLockIds: [], yieldLockIds: [] };
  }
}

/**
 * Fetch all lock objects from the blockchain
 * Uses the global lock ID lists from the Platform object
 */
export async function fetchAllLockObjects() {
  try {
    const { regularLockIds, yieldLockIds } = await fetchGlobalLockIds();

    const locks = {
      regular: [],
      yield: [],
    };

    // Fetch regular locks in batches
    if (regularLockIds.length > 0) {
      try {
        // Batch fetch (max 50 at a time due to RPC limits)
        const batchSize = 50;
        for (let i = 0; i < regularLockIds.length; i += batchSize) {
          const batch = regularLockIds.slice(i, i + batchSize);
          const results = await client.multiGetObjects({
            ids: batch,
            options: {
              showContent: true,
              showType: true,
            },
          });

          locks.regular.push(...results.filter((r) => r.data));
        }
      } catch (err) {
        console.warn("Failed to fetch regular locks:", err);
      }
    }

    // Fetch yield locks in batches
    if (yieldLockIds.length > 0) {
      try {
        const batchSize = 50;
        for (let i = 0; i < yieldLockIds.length; i += batchSize) {
          const batch = yieldLockIds.slice(i, i + batchSize);
          const results = await client.multiGetObjects({
            ids: batch,
            options: {
              showContent: true,
              showType: true,
            },
          });

          locks.yield.push(...results.filter((r) => r.data));
        }
      } catch (err) {
        console.warn("Failed to fetch yield locks:", err);
      }
    }

    return locks;
  } catch (error) {
    console.error("Failed to fetch all lock objects:", error);
    return { regular: [], yield: [] };
  }
}

/**
 * Parse lock object data and extract relevant info
 */
export function parseLockObject(lockData) {
  try {
    if (!lockData?.data?.content?.fields) return null;

    const fields = lockData.data.content.fields;

    // Handle balance field (can be nested)
    let balance = "0";
    if (fields.balance) {
      if (typeof fields.balance === "object" && fields.balance.fields) {
        balance = fields.balance.fields.value || "0";
      } else if (typeof fields.balance === "string") {
        balance = fields.balance;
      } else {
        balance = fields.balance.toString();
      }
    }

    return {
      objectId: lockData.data.objectId,
      balance: balance,
      owner: fields.owner,
      startTime: fields.start_time,
      durationMs: fields.duration_ms,
      strategy: fields.strategy,
      type: lockData.data.type,
    };
  } catch (error) {
    console.error("Failed to parse lock object:", error);
    return null;
  }
}

/**
 * Parse yield lock object data
 */
export function parseYieldLockObject(lockData) {
  try {
    if (!lockData?.data?.content?.fields) return null;

    const fields = lockData.data.content.fields;

    // Handle s_coin_balance field
    let sCoinBalance = "0";
    if (fields.s_coin_balance) {
      if (
        typeof fields.s_coin_balance === "object" &&
        fields.s_coin_balance.fields
      ) {
        sCoinBalance = fields.s_coin_balance.fields.value || "0";
      } else if (typeof fields.s_coin_balance === "string") {
        sCoinBalance = fields.s_coin_balance;
      } else {
        sCoinBalance = fields.s_coin_balance.toString();
      }
    }

    // Handle coin_type field
    let coinType = "";
    if (fields.coin_type) {
      if (typeof fields.coin_type === "object" && fields.coin_type.name) {
        coinType = fields.coin_type.name;
      } else if (typeof fields.coin_type === "string") {
        coinType = fields.coin_type;
      }
    }

    return {
      objectId: lockData.data.objectId,
      owner: fields.owner,
      principalAmount: fields.principal_amount || "0",
      sCoinBalance: sCoinBalance,
      startTime: fields.start_time,
      durationMs: fields.duration_ms,
      coinType: coinType,
      strategy: fields.strategy,
      type: lockData.data.type,
    };
  } catch (error) {
    console.error("Failed to parse yield lock object:", error);
    return null;
  }
}

/**
 * Calculate total TVL in USD from all locks
 */
export function calculateTotalTVL(locks, prices) {
  let totalTVL = 0;

  // Process regular locks
  locks.regular.forEach((lockObj) => {
    const lock = parseLockObject(lockObj);
    if (!lock) return;

    // Extract token type from the object type
    const symbol = getTokenSymbolFromType(lock.type || lockObj.data.type);
    if (!symbol) return;

    const decimals = getTokenDecimals(symbol);
    const price = prices[symbol] || 0;

    // Parse balance safely
    const balanceStr =
      typeof lock.balance === "object" && lock.balance.value
        ? lock.balance.value
        : lock.balance;
    const amount = Number(balanceStr) / Math.pow(10, decimals);

    if (!isNaN(amount) && amount > 0) {
      totalTVL += amount * price;
    }
  });

  // Process yield locks
  locks.yield.forEach((lockObj) => {
    const lock = parseYieldLockObject(lockObj);
    if (!lock) return;

    // Get token type from coinType field or from object type
    let symbol = getTokenSymbolFromType(lock.coinType);
    if (!symbol) {
      // Fallback: try to extract from object type
      const typeMatch = (lock.type || lockObj.data.type).match(/<([^>]+)>/);
      if (typeMatch) {
        // This is an sCoin type, need to map back to base token
        symbol = getTokenSymbolFromScoinType(typeMatch[1]);
      }
    }

    if (!symbol) return;

    const decimals = getTokenDecimals(symbol);
    const price = prices[symbol] || 0;

    const amount = Number(lock.principalAmount) / Math.pow(10, decimals);

    if (!isNaN(amount) && amount > 0) {
      totalTVL += amount * price;
    }
  });

  return totalTVL;
}

/**
 * Helper: Get token symbol from coin type string
 */
function getTokenSymbolFromType(coinType) {
  if (!coinType) return null;

  for (const [symbol, type] of Object.entries(TOKEN_TYPES)) {
    if (
      coinType.includes(type) ||
      type.includes(coinType) ||
      coinType.includes(`::${symbol.toLowerCase()}::`) ||
      coinType.toUpperCase().includes(symbol)
    ) {
      return symbol;
    }
  }
  return null;
}

/**
 * Helper: Get token symbol from sCoin type
 */
function getTokenSymbolFromScoinType(scoinType) {
  if (!scoinType) return null;

  for (const [symbol, type] of Object.entries(SCOIN_TYPES)) {
    if (scoinType.includes(type) || type.includes(scoinType)) {
      return symbol;
    }
  }

  // Fallback: check if scoin type contains token name
  const upperType = scoinType.toUpperCase();
  for (const symbol of Object.keys(TOKEN_TYPES)) {
    if (upperType.includes(`SCALLOP_${symbol}`) || upperType.includes(symbol)) {
      return symbol;
    }
  }

  return null;
}

/**
 * Helper: Get token decimals
 */
function getTokenDecimals(symbol) {
  if (symbol === "USDC" || symbol === "DEEP") return 6;
  return 9;
}

/**
 * Get TVL breakdown by token
 */
export function getTVLByToken(locks, prices) {
  const tvlByToken = {};

  // Initialize
  Object.keys(TOKEN_TYPES).forEach((symbol) => {
    tvlByToken[symbol] = {
      locked: 0,
      yieldLocked: 0,
      total: 0,
      count: 0,
    };
  });

  // Process regular locks
  locks.regular.forEach((lockObj) => {
    const lock = parseLockObject(lockObj);
    if (!lock) return;

    const symbol = getTokenSymbolFromType(lock.type || lockObj.data.type);
    if (!symbol || !tvlByToken[symbol]) return;

    const decimals = getTokenDecimals(symbol);
    const price = prices[symbol] || 0;

    const balanceStr =
      typeof lock.balance === "object" && lock.balance.value
        ? lock.balance.value
        : lock.balance;
    const amount = Number(balanceStr) / Math.pow(10, decimals);

    if (!isNaN(amount) && amount > 0) {
      const usdValue = amount * price;
      tvlByToken[symbol].locked += usdValue;
      tvlByToken[symbol].total += usdValue;
      tvlByToken[symbol].count++;
    }
  });

  // Process yield locks
  locks.yield.forEach((lockObj) => {
    const lock = parseYieldLockObject(lockObj);
    if (!lock) return;

    let symbol = getTokenSymbolFromType(lock.coinType);
    if (!symbol) {
      const typeMatch = (lock.type || lockObj.data.type).match(/<([^>]+)>/);
      if (typeMatch) {
        symbol = getTokenSymbolFromScoinType(typeMatch[1]);
      }
    }

    if (!symbol || !tvlByToken[symbol]) return;

    const decimals = getTokenDecimals(symbol);
    const price = prices[symbol] || 0;

    const amount = Number(lock.principalAmount) / Math.pow(10, decimals);

    if (!isNaN(amount) && amount > 0) {
      const usdValue = amount * price;
      tvlByToken[symbol].yieldLocked += usdValue;
      tvlByToken[symbol].total += usdValue;
      tvlByToken[symbol].count++;
    }
  });

  return tvlByToken;
}

/**
 * Get top performing assets by TVL and APY
 */
export function getTopPerformingAssets(tvlByToken, apys) {
  const assets = Object.entries(tvlByToken)
    .map(([symbol, data]) => ({
      symbol,
      tvl: data.total,
      apy: apys[symbol] || 0,
      count: data.count,
      // Performance score = TVL * APY (simple metric)
      score: data.total * (apys[symbol] || 0),
    }))
    .filter((asset) => asset.tvl > 0)
    .sort((a, b) => b.score - a.score);

  return assets;
}
