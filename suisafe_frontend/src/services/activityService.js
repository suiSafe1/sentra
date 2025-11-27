// src/services/activityService.js

import sui_logo from "../assets/sui.png";
import wal_logo from "../assets/wal.png";
import deep_logo from "../assets/deep.png";
import usdc_logo from "../assets/usdc.png";
import scal_logo from "../assets/scal.png";

const TOKEN_ICONS = {
  SUI: sui_logo,
  WAL: wal_logo,
  DEEP: deep_logo,
  USDC: usdc_logo,
  SCA: scal_logo,
};

const TOKEN_TYPES = {
  "0x2::sui::SUI": "SUI",
  "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI":
    "SUI",
  "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC":
    "USDC",
  "0x356a26eb9e012a68958082340d4c4116e7f55615cf27affcff209cf0ae544f59::wal::WAL":
    "WAL",
  "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP":
    "DEEP",
  "0x7016aae72cfc67f2fadf55769c0a7dd54291a583b63051a5ed71081cce836ac6::sca::SCA":
    "SCA",
};

/**
 * Extract token symbol from type string
 */
function getTokenSymbolFromType(typeStr) {
  if (!typeStr) {
    return "TOKEN";
  }

  // Direct lookup - exact match
  if (TOKEN_TYPES[typeStr]) {
    return TOKEN_TYPES[typeStr];
  }

  // Check for partial matches in the type string
  for (const [key, symbol] of Object.entries(TOKEN_TYPES)) {
    if (typeStr.includes(key)) {
      return symbol;
    }
  }

  // Extract from type name (e.g., "::sui::SUI" -> "SUI")
  const match = typeStr.match(/::([a-z]+)::[A-Z]+$/i);
  if (match) {
    return match[1].toUpperCase();
  }

  // Try to find any known token name in the string
  const upperType = typeStr.toUpperCase();
  for (const symbol of Object.values(TOKEN_TYPES)) {
    if (upperType.includes(symbol)) {
      return symbol;
    }
  }

  return "TOKEN";
}

/**
 * Format amount with decimals
 */
function formatAmount(amount, decimals = 9) {
  const num = Number(amount) / Math.pow(10, decimals);
  if (num >= 1000) {
    return num.toFixed(0);
  } else if (num >= 1) {
    return num.toFixed(2);
  } else {
    return num.toFixed(4);
  }
}

/**
 * Get decimals for a token
 */
function getTokenDecimals(symbol) {
  if (symbol === "USDC" || symbol === "DEEP") return 6;
  return 9;
}

/**
 * Parse event data into activity item
 *
 * THIS IS THE MAIN FUNCTION USED BY THE EVENT LISTENER
 */
export function parseEventToActivity(event) {
  try {
    const { type, parsedJson, timestampMs, id } = event;
    const txDigest = id?.txDigest || "";

    // Extract event type from the full type string
    const eventTypeMatch = type.match(/::([^:<]+)(<.*>)?$/);
    if (!eventTypeMatch) {
      return null;
    }

    const eventName = eventTypeMatch[1];
    const typeArgs = eventTypeMatch[2] || "";

    // Try to extract coin type from multiple sources
    let coinType = "";

    // 1. Try from type arguments (angle brackets)
    const coinTypeMatch = typeArgs.match(/<([^>]+)>/);
    if (coinTypeMatch) {
      coinType = coinTypeMatch[1];
    }

    // 2. Try from parsedJson.coin_type - HANDLE OBJECT FORMAT
    if (!coinType && parsedJson?.coin_type) {
      // Check if coin_type is an object with a 'name' property
      if (
        typeof parsedJson.coin_type === "object" &&
        parsedJson.coin_type.name
      ) {
        coinType = parsedJson.coin_type.name;
      } else if (typeof parsedJson.coin_type === "string") {
        coinType = parsedJson.coin_type;
      }
    }

    // 3. Try from parsedJson.type
    if (!coinType && parsedJson?.type) {
      coinType = parsedJson.type;
    }

    const tokenSymbol = getTokenSymbolFromType(coinType);
    const decimals = getTokenDecimals(tokenSymbol);
    const tokenIcon = TOKEN_ICONS[tokenSymbol] || sui_logo;

    // Parse based on event type
    switch (eventName) {
      case "LockCreated": {
        const amount = parsedJson?.amount || "0";
        return {
          id: `${txDigest}-${timestampMs}`,
          type: "lock",
          token: tokenSymbol,
          icon: tokenIcon,
          amount: formatAmount(amount, decimals),
          timestamp: Number(timestampMs),
          description: `Locked ${formatAmount(
            amount,
            decimals
          )} ${tokenSymbol}`,
          txDigest,
          status: "success",
        };
      }

      case "YieldLockCreated": {
        const amount = parsedJson?.principal_amount || "0";
        const desc = parsedJson?.description || "";
        return {
          id: `${txDigest}-${timestampMs}`,
          type: "yield_lock",
          token: tokenSymbol,
          icon: tokenIcon,
          amount: formatAmount(amount, decimals),
          timestamp: Number(timestampMs),
          description: `Created Yield Lock: ${formatAmount(
            amount,
            decimals
          )} ${tokenSymbol}${desc ? ` - ${desc}` : ""}`,
          txDigest,
          status: "success",
        };
      }

      case "LockWithdrawn": {
        const amount = parsedJson?.amount_withdrawn || "0";
        return {
          id: `${txDigest}-${timestampMs}`,
          type: "unlock",
          token: tokenSymbol,
          icon: tokenIcon,
          amount: formatAmount(amount, decimals),
          timestamp: Number(timestampMs),
          description: `Unlocked ${formatAmount(
            amount,
            decimals
          )} ${tokenSymbol}`,
          txDigest,
          status: "success",
        };
      }

      case "YieldLockWithdrawn": {
        const principal = parsedJson?.principal_withdrawn || "0";
        const yieldEarned = parsedJson?.user_yield_amount || "0";
        const totalWithdrawn = Number(principal) + Number(yieldEarned);
        return {
          id: `${txDigest}-${timestampMs}`,
          type: "yield_unlock",
          token: tokenSymbol,
          icon: tokenIcon,
          amount: formatAmount(totalWithdrawn, decimals),
          timestamp: Number(timestampMs),
          description: `Unlocked ${formatAmount(
            totalWithdrawn,
            decimals
          )} ${tokenSymbol} (+ ${formatAmount(yieldEarned, decimals)} yield)`,
          txDigest,
          status: "success",
        };
      }

      case "LockExtended": {
        const amount = parsedJson?.added_amount || "0";
        return {
          id: `${txDigest}-${timestampMs}`,
          type: "deposit",
          token: tokenSymbol,
          icon: tokenIcon,
          amount: formatAmount(amount, decimals),
          timestamp: Number(timestampMs),
          description: `Added ${formatAmount(
            amount,
            decimals
          )} ${tokenSymbol} to lock`,
          txDigest,
          status: "success",
        };
      }

      case "YieldLockExtended": {
        const amount = parsedJson?.added_amount || "0";
        return {
          id: `${txDigest}-${timestampMs}`,
          type: "deposit",
          token: tokenSymbol,
          icon: tokenIcon,
          amount: formatAmount(amount, decimals),
          timestamp: Number(timestampMs),
          description: `Added ${formatAmount(
            amount,
            decimals
          )} ${tokenSymbol} to yield lock`,
          txDigest,
          status: "success",
        };
      }

      case "SwapEvent": {
        return {
          id: `${txDigest}-${timestampMs}`,
          type: "swap",
          token: "SWAP",
          icon: sui_logo,
          amount: "N/A",
          timestamp: Number(timestampMs),
          description: "Executed token swap",
          txDigest,
          status: "success",
        };
      }

      default:
        return null;
    }
  } catch (error) {
    console.error("Failed to parse event:", error, event);
    return null;
  }
}

/**
 * Get activity summary (counts by type)
 */
export function getActivitySummary(activities) {
  const summary = {
    total: activities.length,
    locks: 0,
    unlocks: 0,
    deposits: 0,
    swaps: 0,
  };

  activities.forEach((activity) => {
    if (activity.type === "lock" || activity.type === "yield_lock") {
      summary.locks++;
    } else if (activity.type === "unlock" || activity.type === "yield_unlock") {
      summary.unlocks++;
    } else if (activity.type === "deposit") {
      summary.deposits++;
    } else if (activity.type === "swap") {
      summary.swaps++;
    }
  });

  return summary;
}

/**
 * Format timestamp to readable date/time
 */
export function formatActivityTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return "Just now";
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }
}

/**
 * DEPRECATED: This function is no longer used
 * Real-time listeners replaced the need for manual fetching
 */
export async function fetchUserActivity() {
  console.warn("fetchUserActivity is deprecated. Use event listeners instead.");
  return [];
}
