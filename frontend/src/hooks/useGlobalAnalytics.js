import { useState, useEffect, useRef } from "react";
import {
  fetchAllLockObjects,
  calculateTotalTVL,
  getTVLByToken,
  getTopPerformingAssets,
} from "../services/analyticsService";
import { fetchTokenPrices } from "../services/priceService";
import { fetchScallopAPYs } from "../services/apyService";

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

  const isFetchingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const fetchAnalytics = async () => {
      if (isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;
      setIsLoading(true);
      setError(null);

      try {
        const [locks, prices, apys] = await Promise.all([
          fetchAllLockObjects(),
          fetchTokenPrices(),
          fetchScallopAPYs(),
        ]);

        if (!mountedRef.current) {
          return;
        }

        const totalTVL = calculateTotalTVL(locks, prices);
        const tvlByToken = getTVLByToken(locks, prices);
        const topPerforming = getTopPerformingAssets(tvlByToken, apys);

        const totalTVLForAvg = Object.values(tvlByToken).reduce(
          (sum, token) => sum + token.total,
          0,
        );
        const weightedAPY = Object.entries(tvlByToken).reduce(
          (sum, [symbol, data]) => {
            const weight = totalTVLForAvg > 0 ? data.total / totalTVLForAvg : 0;
            return sum + (apys[symbol] || 0) * weight;
          },
          0,
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

        setData(finalData);
      } catch (err) {
        if (mountedRef.current) {
          setError(err.message || "Failed to load analytics");
        }
      } finally {
        isFetchingRef.current = false;
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    fetchAnalytics();

    const interval = setInterval(() => {
      fetchAnalytics();
    }, 180000); // 3 minutes

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, []);

  const refresh = async () => {
    if (!isFetchingRef.current) {
      setIsLoading(true);
    }
  };

  return {
    ...data,
    isLoading,
    error,
    refresh,
  };
}
