import { useState, useEffect } from "react";
import { fetchDashboardDataGraphQL as fetchDashboardData } from "../utils/suiGraphQLHelpers";

/**
 * Custom hook to fetch and manage dashboard data for a user
 *
 * @param {string} userAddress - The Sui address of the current user
 * @returns {Object} Dashboard data state
 *
 * Returns:
 * {
 *   totalValueLocked: number,    // Total locked value in MIST
 *   totalYieldEarned: number,    // Total yield earned in MIST
 *   activeLocks: number,         // Count of active locks
 *   readyForWithdrawal: number,  // Count of locks ready to withdraw
 *   loading: boolean,            // Loading state
 *   error: string | null,        // Error message if any
 *   refetch: function            // Manual refetch function
 * }
 */
export function useDashboardData(userAddress) {
  const [data, setData] = useState({
    totalValueLocked: 0,
    totalYieldEarned: 0,
    activeLocks: 0,
    readyForWithdrawal: 0,
    loading: true,
    error: null,
  });

  // Store interval ID for cleanup
  const [intervalId, setIntervalId] = useState(null);

  /**
   * Main fetch function
   */
  const fetchData = async () => {
    if (!userAddress) {
      setData({
        totalValueLocked: 0,
        totalYieldEarned: 0,
        activeLocks: 0,
        readyForWithdrawal: 0,
        loading: false,
        error: null,
      });
      return;
    }

    try {
      setData((prev) => ({ ...prev, loading: true, error: null }));

      const dashboardData = await fetchDashboardData(userAddress);

      setData({
        ...dashboardData,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error in useDashboardData:", error);
      setData((prev) => ({
        ...prev,
        loading: false,
        error: error.message || "Failed to fetch dashboard data",
      }));
    }
  };

  /**
   * Effect: Fetch data when userAddress changes
   */
  useEffect(() => {
    fetchData();

    // Set up auto-refresh every 30 seconds
    const id = setInterval(fetchData, 30000);
    setIntervalId(id);

    return () => {
      if (id) clearInterval(id);
    };
  }, [userAddress]);

  /**
   * Manual refetch function that can be called from components
   */
  const refetch = () => {
    fetchData();
  };

  return {
    ...data,
    refetch,
  };
}
