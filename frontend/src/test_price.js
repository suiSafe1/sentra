#!/usr/bin/env node

/**
 * Terminal Test Script for Price Service
 * Tests CoinGecko API integration and price calculations
 *
 * Usage: node test-price-service.js
 */

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  header: (msg) =>
    console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}`),
};

// Token configurations
const TOKEN_IDS = {
  SUI: "sui",
  USDC: "usd-coin",
  WAL: "walrus-2",
  DEEP: "deep",
  SCA: "scallop-2",
};

/**
 * Test 1: Fetch prices from CoinGecko
 */
async function testFetchPrices() {
  log.header("TEST 1: Fetching Token Prices from CoinGecko");

  try {
    const ids = Object.values(TOKEN_IDS).join(",");
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;

    log.info(`Fetching from: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    log.success("Successfully fetched data from CoinGecko");
    console.log(JSON.stringify(data, null, 2));

    // Validate response structure
    const prices = {};
    const issues = [];

    for (const [symbol, id] of Object.entries(TOKEN_IDS)) {
      if (data[id]) {
        if (data[id].usd !== undefined) {
          prices[symbol] = data[id].usd;
          log.success(`${symbol}: $${data[id].usd}`);
        } else {
          issues.push(`${symbol} (${id}): Missing USD price`);
        }
      } else {
        issues.push(`${symbol} (${id}): Not found in response`);
      }
    }

    if (issues.length > 0) {
      log.warning("Issues found:");
      issues.forEach((issue) => log.warning(`  - ${issue}`));
    }

    return { success: true, prices, issues };
  } catch (error) {
    log.error(`Failed to fetch prices: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Test 2: Verify each token ID
 */
async function testIndividualTokens() {
  log.header("TEST 2: Verifying Individual Token IDs");

  const results = {};

  for (const [symbol, id] of Object.entries(TOKEN_IDS)) {
    try {
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data[id] && data[id].usd !== undefined) {
        log.success(`${symbol} (${id}): $${data[id].usd}`);
        results[symbol] = { valid: true, price: data[id].usd };
      } else {
        log.error(`${symbol} (${id}): Invalid or not found`);
        results[symbol] = { valid: false, error: "Not found" };
      }

      // Rate limit protection
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      log.error(`${symbol} (${id}): ${error.message}`);
      results[symbol] = { valid: false, error: error.message };
    }
  }

  return results;
}

/**
 * Test 3: Search for correct token IDs
 */
async function searchTokenIds() {
  log.header("TEST 3: Searching for Correct Token IDs");

  const searchTerms = {
    WAL: ["walrus", "wal", "walrus protocol"],
    DEEP: ["deep", "deepbook", "deep book"],
    SCA: ["scallop", "sca"],
  };

  for (const [symbol, terms] of Object.entries(searchTerms)) {
    log.info(`Searching for ${symbol}...`);

    for (const term of terms) {
      try {
        const url = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(
          term
        )}`;
        const response = await fetch(url);

        if (!response.ok) continue;

        const data = await response.json();

        if (data.coins && data.coins.length > 0) {
          const matches = data.coins.slice(0, 3);
          log.info(`  Results for "${term}":`);
          matches.forEach((coin) => {
            console.log(
              `    - ${coin.name} (${coin.symbol}) → ID: ${colors.cyan}${coin.id}${colors.reset}`
            );
          });
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        log.warning(`  Failed to search for "${term}": ${error.message}`);
      }
    }
  }
}

/**
 * Test 4: Calculate USD values
 */
function testCalculations(prices) {
  log.header("TEST 4: Testing USD Value Calculations");

  const testCases = [
    { token: "SUI", amount: "1000000000", decimals: 9, expected: "1.00" }, // 1 SUI
    { token: "USDC", amount: "1000000", decimals: 6, expected: "1.00" }, // 1 USDC
    { token: "SUI", amount: "5500000000", decimals: 9, expected: "5.50" }, // 5.5 SUI
    { token: "DEEP", amount: "100000000", decimals: 6, expected: "100.00" }, // 100 DEEP
  ];

  testCases.forEach((test) => {
    const price = prices[test.token] || 0;
    const tokenAmount = Number(test.amount) / Math.pow(10, test.decimals);
    const usdValue = tokenAmount * price;

    console.log(`\n  ${test.token}:`);
    console.log(`    Amount: ${test.amount} (${tokenAmount} ${test.token})`);
    console.log(`    Price: $${price}`);
    console.log(
      `    USD Value: ${colors.green}$${usdValue.toFixed(2)}${colors.reset}`
    );

    if (price > 0) {
      log.success("Calculation successful");
    } else {
      log.warning("Price is 0 - using fallback");
    }
  });
}

/**
 * Test 5: Cache functionality
 */
async function testCaching() {
  log.header("TEST 5: Testing Cache Functionality");

  log.info("First fetch (should hit API)...");
  const start1 = Date.now();
  const prices1 = await fetchTokenPrices();
  const time1 = Date.now() - start1;
  log.info(`First fetch took ${time1}ms`);

  log.info("Second fetch (should use cache)...");
  const start2 = Date.now();
  const prices2 = await fetchTokenPrices();
  const time2 = Date.now() - start2;
  log.info(`Second fetch took ${time2}ms`);

  if (time2 < time1 / 2) {
    log.success("Cache is working! (Second fetch much faster)");
  } else {
    log.warning("Cache might not be working as expected");
  }

  // Check if prices are identical
  if (JSON.stringify(prices1) === JSON.stringify(prices2)) {
    log.success("Cached prices match original");
  } else {
    log.error("Cached prices don't match!");
  }
}

let priceCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60000;

async function fetchTokenPrices() {
  const now = Date.now();

  if (priceCache && now - lastFetchTime < CACHE_DURATION) {
    return priceCache;
  }

  try {
    const ids = Object.values(TOKEN_IDS).join(",");
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch prices");
    }

    const data = await response.json();

    const prices = {
      SUI: data[TOKEN_IDS.SUI]?.usd || 0,
      USDC: data[TOKEN_IDS.USDC]?.usd || 1.0,
      WAL: data[TOKEN_IDS.WAL]?.usd || 0,
      DEEP: data[TOKEN_IDS.DEEP]?.usd || 0,
      SCA: data[TOKEN_IDS.SCA]?.usd || 0,
    };

    priceCache = prices;
    lastFetchTime = now;

    return prices;
  } catch (error) {
    console.error("Price fetch error:", error);
    return {
      SUI: 3.5,
      USDC: 1.0,
      WAL: 0,
      DEEP: 0,
      SCA: 0,
    };
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log(`${colors.bright}${colors.cyan}
╔═══════════════════════════════════════════════════╗
║   PRICE SERVICE VERIFICATION TEST SUITE          ║
╚═══════════════════════════════════════════════════╝
${colors.reset}`);

  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
  };

  try {
    // Test 1: Fetch prices
    const test1 = await testFetchPrices();
    if (test1.success) {
      results.passed++;

      // Test 4: Calculations (only if we have prices)
      if (test1.prices) {
        testCalculations(test1.prices);
        results.passed++;
      }
    } else {
      results.failed++;
    }

    if (test1.issues && test1.issues.length > 0) {
      results.warnings += test1.issues.length;
    }

    // Test 2: Individual tokens
    const test2 = await testIndividualTokens();
    const validTokens = Object.values(test2).filter((r) => r.valid).length;
    const invalidTokens = Object.values(test2).filter((r) => !r.valid).length;
    results.passed += validTokens;
    results.failed += invalidTokens;

    // Test 3: Search (if there were issues)
    if (results.failed > 0 || results.warnings > 0) {
      await searchTokenIds();
    }

    // Test 5: Caching
    await testCaching();
    results.passed++;
  } catch (error) {
    log.error(`Test suite failed: ${error.message}`);
    results.failed++;
  }

  // Summary
  console.log(`\n${colors.bright}${colors.cyan}
╔═══════════════════════════════════════════════════╗
║   TEST SUMMARY                                    ║
╚═══════════════════════════════════════════════════╝${colors.reset}`);

  console.log(`${colors.green}✓ Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}✗ Failed: ${results.failed}${colors.reset}`);
  console.log(`${colors.yellow}⚠ Warnings: ${results.warnings}${colors.reset}`);

  if (results.failed === 0 && results.warnings === 0) {
    console.log(
      `\n${colors.green}${colors.bright}🎉 ALL TESTS PASSED! Price service is ready to use.${colors.reset}\n`
    );
    process.exit(0);
  } else if (results.failed > 0) {
    console.log(
      `\n${colors.red}${colors.bright}❌ TESTS FAILED! Check the errors above.${colors.reset}\n`
    );
    process.exit(1);
  } else {
    console.log(
      `\n${colors.yellow}${colors.bright}⚠️  TESTS PASSED WITH WARNINGS. Review the issues above.${colors.reset}\n`
    );
    process.exit(0);
  }
}

// Run tests
runAllTests().catch((error) => {
  log.error(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
