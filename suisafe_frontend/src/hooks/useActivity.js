// src/hooks/useActivity.js

import { useState, useEffect, useCallback, useRef } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import {
  fetchUserActivity,
  getActivitySummary,
} from "../services/activityService";

const ACTIVITY_CACHE_DURATION = 30000; // 30 seconds
const AUTO_REFRESH_INTERVAL = 60000; // 1 minute

export function useActivity() {
  const currentAccount = useCurrentAccount();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const lastFetchTime = useRef(0);
  const lastSeenTimestamp = useRef(
    parseInt(localStorage.getItem("lastSeenActivityTimestamp") || "0")
  );

  /**
   * Fetch activities from blockchain
   */
  const fetchActivities = useCallback(
    async (forceRefresh = false) => {
      if (!currentAccount?.address) {
        setActivities([]);
        setUnreadCount(0);
        return;
      }

      const now = Date.now();

      // Use cache if not forcing refresh
      if (
        !forceRefresh &&
        now - lastFetchTime.current < ACTIVITY_CACHE_DURATION
      ) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log("🔄 Fetching activities...");
        const fetchedActivities = await fetchUserActivity(
          currentAccount.address,
          50
        );

        setActivities(fetchedActivities);
        lastFetchTime.current = now;

        // Calculate unread count (activities after last seen)
        const unread = fetchedActivities.filter(
          (activity) => activity.timestamp > lastSeenTimestamp.current
        ).length;
        setUnreadCount(unread);

        console.log(
          "✅ Activities loaded:",
          fetchedActivities.length,
          "| Unread:",
          unread
        );
      } catch (err) {
        console.error("❌ Failed to fetch activities:", err);
        setError(err.message || "Failed to load activities");
      } finally {
        setIsLoading(false);
      }
    },
    [currentAccount?.address]
  );

  /**
   * Mark all activities as read
   */
  const markAllAsRead = useCallback(() => {
    if (activities.length > 0) {
      const latestTimestamp = activities[0].timestamp;
      lastSeenTimestamp.current = latestTimestamp;
      localStorage.setItem(
        "lastSeenActivityTimestamp",
        latestTimestamp.toString()
      );
      setUnreadCount(0);
    }
  }, [activities]);

  /**
   * Refresh activities manually
   */
  const refresh = useCallback(() => {
    return fetchActivities(true);
  }, [fetchActivities]);

  /**
   * Add a new activity (after user performs action)
   */
  const addActivity = useCallback((newActivity) => {
    setActivities((prev) => {
      const updated = [newActivity, ...prev];
      // Keep only last 50
      return updated.slice(0, 50);
    });
    setUnreadCount((prev) => prev + 1);
  }, []);

  // Initial fetch on mount and account change
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Auto-refresh interval
  useEffect(() => {
    if (!currentAccount?.address) return;

    const interval = setInterval(() => {
      fetchActivities(false); // Use cache unless expired
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [currentAccount?.address, fetchActivities]);

  // Get activity summary
  const summary = getActivitySummary(activities);

  return {
    activities,
    isLoading,
    error,
    unreadCount,
    summary,
    refresh,
    markAllAsRead,
    addActivity,
  };
}
