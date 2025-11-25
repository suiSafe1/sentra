import { useState, useEffect } from "react";
import {
  fetchAllLockObjects,
  calculateTotalTVL,
  getTVLByToken,
  getTopPerformingAssets,
} from "../services/analyticsService";
import { fetchTokenPrices } from "../services/priceService";
import { fetchScallopAPYs } from "../services/apyService";

/**
 * Hook for fetching global platform analytics
 * This provides dashboard-level statistics across ALL users
 */
export function useGlobalAnalytics() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    totalTVL: 0,
    tvlByToken: {},
    totalLocks: 0,
    totalYieldLocks: 0,
    totalUsers: 0,
    supportedAssets: 5,
    topPerformingAssets: [],
    averageAPY: 0,
    prices: {},
    apys: {},
  });

  useEffect(() => {
    let isMounted = true;

    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [locks, prices, apys] = await Promise.all([
          fetchAllLockObjects(),
          fetchTokenPrices(),
          fetchScallopAPYs(),
        ]);

        if (!isMounted) return;

        console.log("🔒 Fetched locks:", {
          regularCount: locks.regular.length,
          yieldCount: locks.yield.length,
        });
        console.log("💰 Prices:", prices);
        console.log("📈 APYs:", apys);

        const totalTVL = calculateTotalTVL(locks, prices);
        console.log("💵 Total TVL:", totalTVL);

        const tvlByToken = getTVLByToken(locks, prices);
        console.log("📊 TVL by token:", tvlByToken);

        const topPerforming = getTopPerformingAssets(tvlByToken, apys);
        console.log("🏆 Top performing:", topPerforming);

        const totalTVLForAvg = Object.values(tvlByToken).reduce(
          (sum, token) => sum + token.total,
          0
        );
        const weightedAPY = Object.entries(tvlByToken).reduce(
          (sum, [symbol, data]) => {
            const weight = totalTVLForAvg > 0 ? data.total / totalTVLForAvg : 0;
            return sum + (apys[symbol] || 0) * weight;
          },
          0
        );

        const uniqueOwners = new Set();
        locks.regular.forEach((lock) => {
          if (lock.data?.content?.fields?.owner) {
            uniqueOwners.add(lock.data.content.fields.owner);
          }
        });
        locks.yield.forEach((lock) => {
          if (lock.data?.content?.fields?.owner) {
            uniqueOwners.add(lock.data.content.fields.owner);
          }
        });

        const finalData = {
          totalTVL,
          tvlByToken,
          totalLocks: locks.regular.length,
          totalYieldLocks: locks.yield.length,
          totalUsers: uniqueOwners.size,
          supportedAssets: 5,
          topPerformingAssets: topPerforming,
          averageAPY: weightedAPY,
          prices,
          apys,
        };

        console.log("✅ Final analytics data:", finalData);
        setData(finalData);
      } catch (err) {
        console.error("❌ Failed to fetch global analytics:", err);
        if (isMounted) {
          setError(err.message || "Failed to load analytics");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchAnalytics();

    const interval = setInterval(fetchAnalytics, 120000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const refresh = async () => {
    setIsLoading(true);
  };

  return {
    ...data,
    isLoading,
    error,
    refresh,
  };
}
