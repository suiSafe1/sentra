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

function getTokenSymbolFromType(typeStr) {
  if (!typeStr) {
    return "TOKEN";
  }

  if (TOKEN_TYPES[typeStr]) {
    return TOKEN_TYPES[typeStr];
  }

  for (const [key, symbol] of Object.entries(TOKEN_TYPES)) {
    if (typeStr.includes(key)) {
      return symbol;
    }
  }

  const match = typeStr.match(/::([a-z]+)::[A-Z]+$/i);
  if (match) {
    return match[1].toUpperCase();
  }

  const upperType = typeStr.toUpperCase();
  for (const symbol of Object.values(TOKEN_TYPES)) {
    if (upperType.includes(symbol)) {
      return symbol;
    }
  }

  return "TOKEN";
}

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

function getTokenDecimals(symbol) {
  if (symbol === "USDC" || symbol === "DEEP") return 6;
  return 9;
}

async function fetchSwapTokenInfo(txDigest, suiClient) {
  try {
    const txDetails = await suiClient.getTransactionBlock({
      digest: txDigest,
      options: {
        showEvents: true,
        showBalanceChanges: true,
      },
    });

    const confirmSwapEvent = txDetails.events?.find((evt) =>
      evt.type.includes("ConfirmSwapEvent")
    );

    if (confirmSwapEvent?.parsedJson) {
      const fromType = confirmSwapEvent.parsedJson.from?.name;
      const targetType = confirmSwapEvent.parsedJson.target?.name;
      const amountIn = confirmSwapEvent.parsedJson.amount_in;
      const amountOut = confirmSwapEvent.parsedJson.amount_out;

      if (fromType && targetType) {
        return {
          coinInType: fromType,
          coinOutType: targetType,
          amountIn: amountIn || "0",
          amountOut: amountOut || "0",
        };
      }
    }

    const balanceChanges = txDetails.balanceChanges || [];
    const negative = balanceChanges.find((bc) => Number(bc.amount) < 0);
    const positive = balanceChanges.find((bc) => Number(bc.amount) > 0);

    if (negative && positive) {
      return {
        coinInType: negative.coinType,
        coinOutType: positive.coinType,
        amountIn: Math.abs(Number(negative.amount)).toString(),
        amountOut: Math.abs(Number(positive.amount)).toString(),
      };
    }

    return null;
  } catch (error) {
    console.error("Failed to fetch swap token info:", error);
    return null;
  }
}

export async function parseEventToActivity(event, suiClient = null) {
  try {
    const { type, parsedJson, timestampMs, id } = event;
    const txDigest = id?.txDigest || "";

    const eventTypeMatch = type.match(/::([^:<]+)(<.*>)?$/);
    if (!eventTypeMatch) {
      return null;
    }

    const eventName = eventTypeMatch[1];
    const typeArgs = eventTypeMatch[2] || "";

    if (eventName === "SwapEvent") {
      console.log("🔄 SwapEvent detected, fetching transaction details...");

      let swapInfo = null;
      if (suiClient && txDigest) {
        swapInfo = await fetchSwapTokenInfo(txDigest, suiClient);
      }

      let coinInType = swapInfo?.coinInType || parsedJson?.coin_in_type;
      let coinOutType = swapInfo?.coinOutType || parsedJson?.coin_out_type;
      const amountIn = swapInfo?.amountIn || parsedJson?.amount_in || "0";
      const amountOut = swapInfo?.amountOut || parsedJson?.amount_out || "0";

      if (typeof coinInType === "object" && coinInType?.name) {
        coinInType = coinInType.name;
      } else if (Array.isArray(coinInType)) {
        coinInType = String.fromCharCode(...coinInType);
      }

      if (typeof coinOutType === "object" && coinOutType?.name) {
        coinOutType = coinOutType.name;
      } else if (Array.isArray(coinOutType)) {
        coinOutType = String.fromCharCode(...coinOutType);
      }

      console.log("🔄 Extracted:", {
        coinInType,
        coinOutType,
        amountIn,
        amountOut,
      });

      const fromToken = getTokenSymbolFromType(coinInType || "");
      const toToken = getTokenSymbolFromType(coinOutType || "");
      const fromDecimals = getTokenDecimals(fromToken);
      const toDecimals = getTokenDecimals(toToken);
      const fromIcon = TOKEN_ICONS[fromToken] || sui_logo;
      const toIcon = TOKEN_ICONS[toToken] || sui_logo;

      return {
        id: `${txDigest}-${timestampMs}`,
        type: "swap",
        token: fromToken,
        icon: fromIcon,
        toToken: toToken,
        toIcon: toIcon,
        amount: formatAmount(amountIn, fromDecimals),
        amountOut: formatAmount(amountOut, toDecimals),
        timestamp: Number(timestampMs),
        description: `Swapped ${formatAmount(
          amountIn,
          fromDecimals
        )} ${fromToken} to ${formatAmount(amountOut, toDecimals)} ${toToken}`,
        txDigest,
        status: "success",
      };
    }

    let coinType = "";

    const coinTypeMatch = typeArgs.match(/<([^>]+)>/);
    if (coinTypeMatch) {
      coinType = coinTypeMatch[1];
    }

    if (!coinType && parsedJson?.coin_type) {
      if (
        typeof parsedJson.coin_type === "object" &&
        parsedJson.coin_type.name
      ) {
        coinType = parsedJson.coin_type.name;
      } else if (typeof parsedJson.coin_type === "string") {
        coinType = parsedJson.coin_type;
      }
    }

    if (!coinType && parsedJson?.type) {
      coinType = parsedJson.type;
    }

    const tokenSymbol = getTokenSymbolFromType(coinType);
    const decimals = getTokenDecimals(tokenSymbol);
    const tokenIcon = TOKEN_ICONS[tokenSymbol] || sui_logo;

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

      default:
        return null;
    }
  } catch (error) {
    console.error("Failed to parse event:", error, event);
    return null;
  }
}

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
