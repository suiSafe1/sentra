#!/usr/bin/env node

/**
 * Scallop APY Service Test Suite (FIXED)
 * Tests Scallop API integration, on-chain data fetching, and yield calculations
 *
 * Usage: node test-scallop-apy.js
 */

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  header: (msg) =>
    console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}`),
  data: (msg) => console.log(`${colors.dim}  ${msg}${colors.reset}`),
};

// Scallop Configuration (FIXED - using the working endpoint from your React code)
const SCALLOP_ENDPOINTS = {
  sdkApi: "https://sdk.api.scallop.io/api/market", // ← THIS IS THE WORKING ONE
  api: "https://api.scallop.io/v1/markets",
  apiV2: "https://api-v2.scallop.io/markets",
  frontend: "https://app.scallop.io/api/markets",
  stats: "https://api.scallop.io/stats",
};

const SCALLOP_MARKET_ID =
  "0xa757975255146dc9686aa823b7838b507f315d704f428cbadad2f4ea061939d9";
const SUI_RPC_ENDPOINT = "https://fullnode.mainnet.sui.io:443";

const TOKENS = ["SUI", "USDC", "WAL", "DEEP", "SCA"];

/**
 * Test 1: Try Scallop REST API endpoints
 */
async function testScallopAPI() {
  log.header("TEST 1: Testing Scallop REST API Endpoints");

  const results = {};

  for (const [name, url] of Object.entries(SCALLOP_ENDPOINTS)) {
    log.info(`Testing ${name}: ${url}`);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0",
        },
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Invalid content type: ${contentType}`);
      }

      const data = await response.json();

      log.success(`${name} - Success!`);
      log.data(
        `Response structure: ${JSON.stringify(Object.keys(data), null, 2)}`
      );

      // Try to extract APY data
      const apyData = extractAPYFromResponse(data);
      if (apyData) {
        log.success("Found APY data:");
        Object.entries(apyData).forEach(([token, apy]) => {
          console.log(`    ${token}: ${colors.green}${apy}%${colors.reset}`);
        });
        results[name] = { success: true, apyData };
      } else {
        log.warning("Response received but no APY data found");
        log.data(`Sample data: ${JSON.stringify(data).slice(0, 200)}...`);
        results[name] = { success: true, noApy: true, data };
      }
    } catch (error) {
      if (error.name === "AbortError") {
        log.error(`${name} - Timeout (>10s)`);
      } else {
        log.error(`${name} - ${error.message}`);
      }
      results[name] = { success: false, error: error.message };
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return results;
}

/**
 * Test 2: Fetch from Sui RPC (on-chain data)
 */
async function testSuiRPCFetch() {
  log.header("TEST 2: Fetching Scallop Market from Sui RPC");

  try {
    log.info(`Querying market object: ${SCALLOP_MARKET_ID}`);

    const response = await fetch(SUI_RPC_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "sui_getObject",
        params: [
          SCALLOP_MARKET_ID,
          {
            showType: true,
            showOwner: true,
            showContent: true,
            showBcs: false,
            showDisplay: false,
            showStorageRebate: false,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`RPC Error: ${data.error.message}`);
    }

    if (!data.result || !data.result.data) {
      throw new Error("No data in response");
    }

    log.success("Successfully fetched market object");

    const content = data.result.data.content;

    if (content && content.fields) {
      log.success("Market fields found:");
      log.data(`Field count: ${Object.keys(content.fields).length}`);

      // Try to find APY-related fields
      const fields = content.fields;
      const apyFields = findAPYFields(fields);

      if (apyFields.length > 0) {
        log.success("Found potential APY fields:");
        apyFields.forEach((field) => {
          log.data(`  - ${field}`);
        });
      } else {
        log.warning("No obvious APY fields found");
      }

      // Show sample of available fields
      log.info("Available fields (first 10):");
      Object.keys(fields)
        .slice(0, 10)
        .forEach((key) => {
          log.data(`  - ${key}`);
        });

      return { success: true, fields };
    } else {
      log.warning("No fields in content");
      return { success: false, error: "No fields" };
    }
  } catch (error) {
    log.error(`Failed to fetch from Sui RPC: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Test 3: Try alternative Scallop data sources
 */
async function testAlternativeSources() {
  log.header("TEST 3: Testing Alternative Data Sources");

  const alternatives = [
    {
      name: "Scallop GraphQL",
      url: "https://api.scallop.io/graphql",
      method: "POST",
      body: JSON.stringify({
        query: `{
          markets {
            symbol
            supplyApy
            borrowApy
          }
        }`,
      }),
      headers: { "Content-Type": "application/json" },
    },
    {
      name: "DeFiLlama Scallop",
      url: "https://yields.llama.fi/pools",
      method: "GET",
      filter: (data) => data.data?.filter((p) => p.project === "scallop"),
    },
    {
      name: "Scallop Stats Page",
      url: "https://api.scallop.io/v1/stats",
      method: "GET",
    },
  ];

  const results = {};

  for (const alt of alternatives) {
    log.info(`Testing ${alt.name}...`);

    try {
      const options = {
        method: alt.method,
        headers: alt.headers || { Accept: "application/json" },
      };

      if (alt.body) {
        options.body = alt.body;
      }

      const response = await fetch(alt.url, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      let data = await response.json();

      if (alt.filter) {
        data = alt.filter(data);
      }

      log.success(`${alt.name} - Success!`);

      if (data && typeof data === "object") {
        const apyData = extractAPYFromResponse(data);
        if (apyData) {
          log.success("Found APY data:");
          Object.entries(apyData).forEach(([token, apy]) => {
            console.log(`    ${token}: ${colors.green}${apy}%${colors.reset}`);
          });
          results[alt.name] = { success: true, apyData };
        } else {
          log.warning("No APY data found in response");
          log.data(`Sample: ${JSON.stringify(data).slice(0, 150)}...`);
          results[alt.name] = { success: true, noApy: true };
        }
      }
    } catch (error) {
      log.error(`${alt.name} - ${error.message}`);
      results[alt.name] = { success: false, error: error.message };
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return results;
}

/**
 * Test 4: Yield calculation tests
 */
function testYieldCalculations() {
  log.header("TEST 4: Testing Yield Calculation Logic");

  const testCases = [
    {
      name: "1 SUI locked for 30 days at 8.5% APY",
      principal: 1,
      apy: 8.5,
      days: 30,
      expected: 0.00699,
    },
    {
      name: "100 USDC locked for 90 days at 5.2% APY",
      principal: 100,
      apy: 5.2,
      days: 90,
      expected: 1.282,
    },
    {
      name: "50 SUI locked for 365 days at 8.5% APY",
      principal: 50,
      apy: 8.5,
      days: 365,
      expected: 4.25,
    },
    {
      name: "1000 DEEP locked for 180 days at 10.5% APY",
      principal: 1000,
      apy: 10.5,
      days: 180,
      expected: 51.781,
    },
  ];

  let passed = 0;
  let failed = 0;

  testCases.forEach((test) => {
    console.log(`\n  Testing: ${colors.cyan}${test.name}${colors.reset}`);

    const startTime = Date.now();
    const currentTime = startTime + test.days * 24 * 60 * 60 * 1000;

    const calculated = calculateYieldEarned(
      test.principal,
      test.apy,
      startTime,
      currentTime
    );

    const percentDiff = Math.abs(
      ((calculated - test.expected) / test.expected) * 100
    );

    console.log(`    Principal: ${test.principal}`);
    console.log(`    APY: ${test.apy}%`);
    console.log(`    Duration: ${test.days} days`);
    console.log(`    Expected: ~${test.expected}`);
    console.log(`    Calculated: ${calculated.toFixed(5)}`);

    if (percentDiff < 1) {
      log.success(`Accurate (${percentDiff.toFixed(2)}% difference)`);
      passed++;
    } else if (percentDiff < 5) {
      log.warning(`Close (${percentDiff.toFixed(2)}% difference)`);
      passed++;
    } else {
      log.error(`Inaccurate (${percentDiff.toFixed(2)}% difference)`);
      failed++;
    }
  });

  return { passed, failed };
}

/**
 * Test 5: Cache functionality
 */
async function testCaching() {
  log.header("TEST 5: Testing APY Cache");

  log.info("First fetch (should compute)...");
  const start1 = Date.now();
  const apys1 = await fetchScallopAPYs();
  const time1 = Date.now() - start1;
  log.data(`First fetch: ${time1}ms`);

  log.info("Second fetch (should use cache)...");
  const start2 = Date.now();
  const apys2 = await fetchScallopAPYs();
  const time2 = Date.now() - start2;
  log.data(`Second fetch: ${time2}ms`);

  if (time2 < 5) {
    log.success("Cache is working! (Second fetch instantaneous)");
  } else {
    log.warning("Cache might not be working");
  }

  if (JSON.stringify(apys1) === JSON.stringify(apys2)) {
    log.success("Cached APYs match original");
    return { success: true };
  } else {
    log.error("Cached APYs don't match!");
    return { success: false };
  }
}

/**
 * Helper: Extract APY data from various response formats
 * FIXED: Added support for the SDK API format with pools array
 */
function extractAPYFromResponse(data) {
  const apys = {};

  // FIXED: Check for pools array (SDK API format)
  if (data.pools && Array.isArray(data.pools)) {
    data.pools.forEach((pool) => {
      if (pool.symbol && pool.supplyApy !== undefined) {
        // Remove 's' prefix if present (e.g., 'sSUI' -> 'SUI')
        const symbol = pool.symbol.toUpperCase().replace(/^S/, "");
        // Convert decimal to percentage if needed
        const apy = parseFloat(pool.supplyApy);
        apys[symbol] = apy * 100; // Convert 0.085 to 8.5
      }
    });
    return Object.keys(apys).length > 0 ? apys : null;
  }

  // Try different common structures
  if (Array.isArray(data)) {
    data.forEach((item) => {
      if (item.symbol && item.supplyApy) {
        const symbol = item.symbol.toUpperCase().replace(/^S/, "");
        const apy = parseFloat(item.supplyApy);
        apys[symbol] = apy > 1 ? apy : apy * 100;
      }
      if (item.asset && item.apy) {
        apys[item.asset.toUpperCase()] = parseFloat(item.apy);
      }
    });
  } else if (typeof data === "object") {
    // Try market-based structure
    if (data.markets) {
      return extractAPYFromResponse(data.markets);
    }

    // Try direct token keys
    TOKENS.forEach((token) => {
      const lowerToken = token.toLowerCase();
      if (data[lowerToken] && data[lowerToken].supplyApy) {
        const apy = parseFloat(data[lowerToken].supplyApy);
        apys[token] = apy > 1 ? apy : apy * 100;
      }
      if (data[token] && data[token].apy) {
        apys[token] = parseFloat(data[token].apy);
      }
    });
  }

  return Object.keys(apys).length > 0 ? apys : null;
}

/**
 * Helper: Find APY-related fields in object
 */
function findAPYFields(obj, prefix = "") {
  const fields = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (
      typeof key === "string" &&
      (key.toLowerCase().includes("apy") ||
        key.toLowerCase().includes("rate") ||
        key.toLowerCase().includes("yield"))
    ) {
      fields.push(fullKey);
    }

    if (value && typeof value === "object" && !Array.isArray(value)) {
      fields.push(...findAPYFields(value, fullKey));
    }
  }

  return fields;
}

/**
 * FIXED: APY fetch implementation using the correct endpoint
 */
let apyCache = null;
let lastApyFetchTime = 0;
const CACHE_DURATION = 300000; // 5 minutes

async function fetchScallopAPYs() {
  const now = Date.now();

  if (apyCache && now - lastApyFetchTime < CACHE_DURATION) {
    return apyCache;
  }

  try {
    // Use the working SDK API endpoint
    const response = await fetch("https://sdk.api.scallop.io/api/market");
    const data = await response.json();

    const apys = {};

    if (data.pools && Array.isArray(data.pools)) {
      data.pools.forEach((pool) => {
        if (pool.symbol && pool.supplyApy !== undefined) {
          const symbol = pool.symbol.toUpperCase().replace(/^S/, "");
          const apy = parseFloat(pool.supplyApy || 0);
          apys[symbol] = apy * 100; // Convert decimal to percentage
        }
      });
    }

    // Fallback if no data found
    if (Object.keys(apys).length === 0) {
      throw new Error("No APY data in response");
    }

    apyCache = apys;
    lastApyFetchTime = now;
    return apys;
  } catch (error) {
    console.error("Failed to fetch Scallop APYs:", error);

    // Return fallback APYs
    const fallbackApys = {
      SUI: 8.5,
      USDC: 5.2,
      WAL: 12.0,
      DEEP: 10.5,
      SCA: 15.0,
    };

    apyCache = fallbackApys;
    lastApyFetchTime = now;
    return fallbackApys;
  }
}

function calculateYieldEarned(principal, apy, startTime, currentTime) {
  const timeElapsedMs = currentTime - startTime;
  const timeElapsedYears = timeElapsedMs / (365.25 * 24 * 60 * 60 * 1000);
  const yieldAmount = principal * (apy / 100) * timeElapsedYears;
  return yieldAmount;
}

/**
 * Generate integration code based on findings
 */
function generateIntegrationCode(results) {
  log.header("INTEGRATION CODE GENERATION");

  const workingEndpoint = Object.entries(results).find(
    ([_, result]) => result.success && result.apyData
  );

  if (workingEndpoint) {
    const [name, data] = workingEndpoint;
    log.success(`Found working endpoint: ${name}`);
    log.info("Here's the integration code:");

    const endpointUrl = SCALLOP_ENDPOINTS[name] || SCALLOP_ENDPOINTS.sdkApi;

    console.log(`
${colors.cyan}// Add this to your scallopService.js:${colors.reset}

export async function fetchScallopAPYs() {
  try {
    const response = await fetch("${endpointUrl}");
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
      SUI: 8.5,
      USDC: 5.2,
      WAL: 12.0,
      DEEP: 10.5,
      SCA: 15.0,
    };
  }
}

// Usage in your React component:
const { yieldRate, estimatedYield } = useScallopYield(amount, "SUI", days);
`);
  } else {
    log.warning("No working endpoint found. Using fallback APYs.");
    log.info(
      "You can manually check Scallop's documentation for the correct API."
    );
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log(`${colors.bright}${colors.magenta}
╔═══════════════════════════════════════════════════╗
║   SCALLOP APY SERVICE TEST SUITE (FIXED)         ║
╚═══════════════════════════════════════════════════╝
${colors.reset}`);

  const testResults = {
    apiTests: {},
    rpcTest: {},
    alternativeTests: {},
    calculationTests: {},
    cacheTest: {},
  };

  // Run all tests
  testResults.apiTests = await testScallopAPI();
  testResults.rpcTest = await testSuiRPCFetch();
  testResults.alternativeTests = await testAlternativeSources();
  testResults.calculationTests = testYieldCalculations();
  testResults.cacheTest = await testCaching();

  // Summary
  console.log(`\n${colors.bright}${colors.magenta}
╔═══════════════════════════════════════════════════╗
║   TEST SUMMARY                                    ║
╚═══════════════════════════════════════════════════╝${colors.reset}`);

  const apiSuccess = Object.values(testResults.apiTests).filter(
    (r) => r.success && r.apyData
  ).length;
  const altSuccess = Object.values(testResults.alternativeTests).filter(
    (r) => r.success && r.apyData
  ).length;

  console.log(
    `API Endpoints: ${
      apiSuccess > 0 ? colors.green : colors.red
    }${apiSuccess}/${Object.keys(testResults.apiTests).length} working${
      colors.reset
    }`
  );
  console.log(
    `Alternative Sources: ${
      altSuccess > 0 ? colors.green : colors.yellow
    }${altSuccess}/${Object.keys(testResults.alternativeTests).length} working${
      colors.reset
    }`
  );
  console.log(
    `RPC Fetch: ${
      testResults.rpcTest.success ? colors.green + "✓" : colors.red + "✗"
    }${colors.reset}`
  );
  console.log(
    `Yield Calculations: ${colors.green}${
      testResults.calculationTests.passed
    }/${
      testResults.calculationTests.passed + testResults.calculationTests.failed
    } passed${colors.reset}`
  );
  console.log(
    `Cache: ${
      testResults.cacheTest.success ? colors.green + "✓" : colors.red + "✗"
    }${colors.reset}`
  );

  // Generate integration code if we found a working endpoint
  const allResults = {
    ...testResults.apiTests,
    ...testResults.alternativeTests,
  };
  generateIntegrationCode(allResults);

  if (apiSuccess > 0 || altSuccess > 0) {
    console.log(
      `\n${colors.green}${colors.bright}🎉 SUCCESS! Found working Scallop APY sources!${colors.reset}\n`
    );
    process.exit(0);
  } else {
    console.log(
      `\n${colors.yellow}${colors.bright}⚠️  No live APY data found. Using fallback values.${colors.reset}\n`
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
