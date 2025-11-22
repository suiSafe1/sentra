// ============================================================================
// FILE: src/utils/suiGraphQLHelpers.js
// PURPOSE: Alternative data fetching using GraphQL (more efficient for large datasets)
// NOTE: This requires @mysten/sui/graphql package
// ============================================================================

import { SuiGraphQLClient } from "@mysten/sui/graphql";
import { graphql } from "@mysten/sui/graphql/schemas/latest";

const GRAPHQL_URL = "https://graphql.mainnet.sui.io/graphql";
const gqlClient = new SuiGraphQLClient({ url: GRAPHQL_URL });

export const PACKAGE_ID =
  "0x42c0b7b63930789bf081639163f2f451101d20ca61ead1a237dc9a74119a76f5";

// ============================================================================
// GRAPHQL QUERIES
// ============================================================================

/**
 * Fetch all Lock objects for a user using GraphQL
 * This is more efficient than JSON RPC for fetching multiple objects
 */
export async function fetchUserLocksGraphQL(userAddress) {
  const query = graphql(`
    query FetchUserLocks($owner: SuiAddress!, $lockType: String!) {
      objects(filter: { owner: $owner, type: $lockType }, first: 50) {
        nodes {
          address
          asMoveObject {
            contents {
              json
              type {
                repr
              }
            }
          }
        }
      }
    }
  `);

  try {
    // Query for Lock objects (prefix match)
    const lockTypePrefix = `${PACKAGE_ID}::sentra::Lock`;

    const result = await gqlClient.query({
      query,
      variables: {
        owner: userAddress,
        lockType: lockTypePrefix,
      },
    });

    const locks = result.data?.objects?.nodes || [];

    return locks.map((node) => {
      const content = node.asMoveObject?.contents;
      const json =
        typeof content.json === "string"
          ? JSON.parse(content.json)
          : content.json;

      return {
        id: node.address,
        type: content.type.repr,
        owner: json.owner,
        balance: parseInt(json.balance || 0),
        startTime: parseInt(json.start_time || 0),
        durationMs: parseInt(json.duration_ms || 0),
        strategy: json.strategy,
      };
    });
  } catch (error) {
    console.error("GraphQL error fetching locks:", error);
    return [];
  }
}

/**
 * Fetch all YieldLock objects for a user using GraphQL
 */
export async function fetchUserYieldLocksGraphQL(userAddress) {
  const query = graphql(`
    query FetchUserYieldLocks($owner: SuiAddress!, $yieldLockType: String!) {
      objects(filter: { owner: $owner, type: $yieldLockType }, first: 50) {
        nodes {
          address
          asMoveObject {
            contents {
              json
              type {
                repr
              }
            }
          }
        }
      }
    }
  `);

  try {
    const yieldLockTypePrefix = `${PACKAGE_ID}::sentra::YieldLock`;

    const result = await gqlClient.query({
      query,
      variables: {
        owner: userAddress,
        yieldLockType: yieldLockTypePrefix,
      },
    });

    const yieldLocks = result.data?.objects?.nodes || [];

    return yieldLocks.map((node) => {
      const content = node.asMoveObject?.contents;
      const json =
        typeof content.json === "string"
          ? JSON.parse(content.json)
          : content.json;

      return {
        id: node.address,
        type: content.type.repr,
        owner: json.owner,
        principalAmount: parseInt(json.principal_amount || 0),
        marketBalance: parseInt(json.market_balance || 0),
        startTime: parseInt(json.start_time || 0),
        durationMs: parseInt(json.duration_ms || 0),
        strategy: json.strategy,
        coinType: json.coin_type,
      };
    });
  } catch (error) {
    console.error("GraphQL error fetching yield locks:", error);
    return [];
  }
}

/**
 * Fetch YieldLockWithdrawn events using GraphQL
 */
export async function fetchYieldEventsGraphQL(userAddress) {
  const query = graphql(`
    query FetchYieldEvents($eventType: String!, $limit: Int!) {
      events(filter: { eventType: $eventType }, first: $limit) {
        nodes {
          json
          timestamp
          sendingModule {
            package {
              address
            }
          }
        }
      }
    }
  `);

  try {
    const eventType = `${PACKAGE_ID}::sentra::YieldLockWithdrawn`;

    const result = await gqlClient.query({
      query,
      variables: {
        eventType,
        limit: 50,
      },
    });

    const events = result.data?.events?.nodes || [];

    // Filter for user's events and sum yield
    const userEvents = events.filter((event) => {
      const json =
        typeof event.json === "string" ? JSON.parse(event.json) : event.json;
      return json.owner === userAddress;
    });

    const totalYield = userEvents.reduce((sum, event) => {
      const json =
        typeof event.json === "string" ? JSON.parse(event.json) : event.json;
      return sum + (parseInt(json.user_yield_amount) || 0);
    }, 0);

    return totalYield;
  } catch (error) {
    console.error("GraphQL error fetching yield events:", error);
    return 0;
  }
}

/**
 * Main GraphQL-based dashboard data fetcher
 * Use this as a drop-in replacement for fetchDashboardData in suiHelpers.js
 */
export async function fetchDashboardDataGraphQL(userAddress) {
  if (!userAddress) {
    return {
      totalValueLocked: 0,
      totalYieldEarned: 0,
      activeLocks: 0,
      readyForWithdrawal: 0,
    };
  }

  try {
    // Fetch all data in parallel
    const [locks, yieldLocks, realizedYield] = await Promise.all([
      fetchUserLocksGraphQL(userAddress),
      fetchUserYieldLocksGraphQL(userAddress),
      fetchYieldEventsGraphQL(userAddress),
    ]);

    // Calculate TVL
    const regularTVL = locks.reduce((sum, lock) => sum + lock.balance, 0);
    const yieldTVL = yieldLocks.reduce(
      (sum, lock) => sum + lock.principalAmount,
      0
    );
    const totalTVL = regularTVL + yieldTVL;

    // Calculate yield
    const unrealizedYield = yieldLocks.reduce((sum, lock) => {
      return sum + Math.max(0, lock.marketBalance - lock.principalAmount);
    }, 0);
    const totalYield = realizedYield + unrealizedYield;

    // Count locks
    const totalActiveLocks = locks.length + yieldLocks.length;

    // Count ready for withdrawal
    const now = Date.now();
    const readyCount = [...locks, ...yieldLocks].filter((lock) => {
      const unlockTime = lock.startTime + lock.durationMs;
      return now >= unlockTime;
    }).length;

    return {
      totalValueLocked: totalTVL,
      totalYieldEarned: totalYield,
      activeLocks: totalActiveLocks,
      readyForWithdrawal: readyCount,
    };
  } catch (error) {
    console.error("Error fetching dashboard data via GraphQL:", error);
    throw error;
  }
}

// ============================================================================
// USAGE INSTRUCTIONS
// ============================================================================

/*
TO USE GRAPHQL INSTEAD OF JSON RPC:

1. Install the GraphQL package:
   npm install @mysten/sui

2. In src/utils/suiHelpers.js, replace the import:
   
   // OLD:
   import { fetchDashboardData } from "../utils/suiHelpers";
   
   // NEW:
   import { fetchDashboardDataGraphQL as fetchDashboardData } from "../utils/suiGraphQLHelpers";

3. That's it! The hook will now use GraphQL for data fetching.

BENEFITS OF GRAPHQL:
- Faster queries for multiple objects
- Less bandwidth usage
- More flexible filtering
- Better for pagination with large datasets

WHEN TO USE JSON RPC VS GRAPHQL:
- JSON RPC: Single object queries, simple use cases
- GraphQL: Multiple objects, complex filtering, better performance at scale
*/
