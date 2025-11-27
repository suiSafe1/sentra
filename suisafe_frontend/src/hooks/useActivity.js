// src/hooks/useActivity.js - FIXED VERSION

import { useState, useEffect, useCallback, useRef } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { client, PACKAGE_ID, PACKAGE_ID_V1 } from "../constants/Constants";
import {
  parseEventToActivity,
  getActivitySummary,
} from "../services/activityService";

const ACTIVITY_CACHE_KEY = "sui_activities_cache";
const LAST_SEEN_KEY = "lastSeenActivityTimestamp";
const MAX_ACTIVITIES = 50;

// Fee router package for swap events
const FEE_ROUTER_PACKAGE =
  "0xf6e33c23ef17c81796b8995b493e906a7446686a3dce763bb3259e2fe59df737";

export function useActivity() {
  const currentAccount = useCurrentAccount();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const subscriptionsRef = useRef([]);
  const lastSeenTimestamp = useRef(
    parseInt(localStorage.getItem(LAST_SEEN_KEY) || "0")
  );
  const reconnectTimeoutRef = useRef(null);

  /**
   * Load cached activities from localStorage
   */
  const loadCachedActivities = useCallback(() => {
    try {
      const cached = localStorage.getItem(ACTIVITY_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setActivities(parsed);

          // Calculate unread count
          const unread = parsed.filter(
            (activity) => activity.timestamp > lastSeenTimestamp.current
          ).length;
          setUnreadCount(unread);
        }
      }
    } catch (err) {
      console.warn("Failed to load cached activities:", err);
    }
  }, []);

  /**
   * Save activities to localStorage
   */
  const saveActivitiesToCache = useCallback((activitiesToCache) => {
    try {
      localStorage.setItem(
        ACTIVITY_CACHE_KEY,
        JSON.stringify(activitiesToCache)
      );
    } catch (err) {
      console.warn("Failed to cache activities:", err);
    }
  }, []);

  /**
   * Add new activity and prevent duplicates
   */
  const addActivity = useCallback(
    (newActivity) => {
      setActivities((prev) => {
        // Check if activity already exists
        const isDuplicate = prev.some((act) => act.id === newActivity.id);
        if (isDuplicate) {
          return prev;
        }

        // Add new activity and sort by timestamp
        const updated = [newActivity, ...prev]
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, MAX_ACTIVITIES);

        // Save to cache
        saveActivitiesToCache(updated);

        return updated;
      });

      // Increment unread count
      setUnreadCount((prev) => prev + 1);
    },
    [saveActivitiesToCache]
  );

  /**
   * Setup event listeners for real-time updates
   */
  const setupEventListeners = useCallback(
    async (userAddress) => {
      if (!userAddress) return;

      console.log("🔌 Setting up real-time event listeners for:", userAddress);

      try {
        // Event types to listen to from sentra package
        const sentraEventTypes = [
          "LockCreated",
          "YieldLockCreated",
          "LockWithdrawn",
          "YieldLockWithdrawn",
          "LockExtended",
          "YieldLockExtended",
        ];

        // Subscribe to events from BOTH package versions
        const packages = [PACKAGE_ID, PACKAGE_ID_V1];

        for (const pkg of packages) {
          for (const eventType of sentraEventTypes) {
            try {
              const unsubscribe = await client.subscribeEvent({
                filter: {
                  MoveEventType: `${pkg}::sentra::${eventType}`,
                },
                onMessage: async (event) => {
                  try {
                    // Check if event belongs to current user
                    const owner = event.parsedJson?.owner;
                    if (
                      owner &&
                      owner.toLowerCase() === userAddress.toLowerCase()
                    ) {
                      console.log("📨 New event received:", eventType, event);

                      // Parse event to activity format
                      const activity = await parseEventToActivity(
                        event,
                        client
                      );
                      if (activity) {
                        addActivity(activity);
                      }
                    }
                  } catch (err) {
                    console.error("Failed to process event:", err);
                  }
                },
              });

              subscriptionsRef.current.push(unsubscribe);
            } catch (err) {
              console.warn(`Failed to subscribe to ${eventType}:`, err);
            }
          }
        }

        // Subscribe to swap events
        try {
          const swapUnsubscribe = await client.subscribeEvent({
            filter: {
              MoveEventType: `${FEE_ROUTER_PACKAGE}::fee_router::SwapEvent`,
            },
            onMessage: async (event) => {
              try {
                console.log("🔄 RAW Swap event received:", event);

                const user = event.parsedJson?.user;

                // Check if event belongs to current user
                if (user && user.toLowerCase() === userAddress.toLowerCase()) {
                  console.log("✅ Swap event for current user:", event);

                  // Parse swap event with proper data extraction
                  const activity = await parseEventToActivity(event, client);
                  if (activity) {
                    addActivity(activity);
                  }
                }
              } catch (err) {
                console.error("Failed to process swap event:", err);
              }
            },
          });

          subscriptionsRef.current.push(swapUnsubscribe);
          console.log("✅ Swap event listener setup complete");
        } catch (err) {
          console.warn("Failed to subscribe to swap events:", err);
        }

        setIsConnected(true);
        console.log("✅ Event listeners setup complete");
      } catch (err) {
        console.error("❌ Failed to setup event listeners:", err);
        setError("Failed to connect to event stream");
        setIsConnected(false);

        // Retry connection after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("🔄 Retrying event listener connection...");
          setupEventListeners(userAddress);
        }, 5000);
      }
    },
    [addActivity]
  );

  /**
   * Cleanup event listeners
   */
  const cleanupEventListeners = useCallback(() => {
    console.log("🧹 Cleaning up event listeners");

    // Unsubscribe from all active subscriptions
    subscriptionsRef.current.forEach((unsubscribe) => {
      try {
        if (typeof unsubscribe === "function") {
          unsubscribe();
        }
      } catch (err) {
        console.warn("Failed to unsubscribe:", err);
      }
    });

    subscriptionsRef.current = [];

    // Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setIsConnected(false);
  }, []);

  /**
   * Fetch historical activities (fallback/initial load)
   */
  const fetchHistoricalActivities = useCallback(async () => {
    if (!currentAccount?.address) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log("📚 Fetching historical activities...");

      const eventTypes = [
        "LockCreated",
        "YieldLockCreated",
        "LockWithdrawn",
        "YieldLockWithdrawn",
        "LockExtended",
        "YieldLockExtended",
      ];

      const allActivities = [];
      const packages = [PACKAGE_ID, PACKAGE_ID_V1];

      // Fetch sentra events
      for (const pkg of packages) {
        for (const eventType of eventTypes) {
          try {
            const response = await client.queryEvents({
              query: { MoveEventType: `${pkg}::sentra::${eventType}` },
              limit: 50,
              order: "descending",
            });

            if (response?.data) {
              const userEvents = response.data.filter((event) => {
                const owner = event.parsedJson?.owner;
                return (
                  owner &&
                  owner.toLowerCase() === currentAccount.address.toLowerCase()
                );
              });

              // Parse events with client
              const parsedEvents = await Promise.all(
                userEvents.map((event) => parseEventToActivity(event, client))
              );

              const validEvents = parsedEvents.filter(Boolean);
              allActivities.push(...validEvents);
            }
          } catch (err) {
            console.warn(`Failed to fetch ${eventType}:`, err);
          }
        }
      }

      // Fetch historical swap events
      try {
        const swapResponse = await client.queryEvents({
          query: {
            MoveEventType: `${FEE_ROUTER_PACKAGE}::fee_router::SwapEvent`,
          },
          limit: 50,
          order: "descending",
        });

        if (swapResponse?.data) {
          const userSwaps = swapResponse.data.filter((event) => {
            const user = event.parsedJson?.user;
            return (
              user &&
              user.toLowerCase() === currentAccount.address.toLowerCase()
            );
          });

          // Parse swap events with client (async)
          const parsedSwaps = await Promise.all(
            userSwaps.map((event) => parseEventToActivity(event, client))
          );

          const validSwaps = parsedSwaps.filter(Boolean);

          console.log("📊 Found swap events:", validSwaps.length);
          allActivities.push(...validSwaps);
        }
      } catch (err) {
        console.warn("Failed to fetch swap events:", err);
      }

      // Remove duplicates by ID
      const uniqueActivities = Array.from(
        new Map(allActivities.map((item) => [item.id, item])).values()
      );

      // Sort by timestamp (newest first)
      uniqueActivities.sort((a, b) => b.timestamp - a.timestamp);

      // Limit to MAX_ACTIVITIES
      const limitedActivities = uniqueActivities.slice(0, MAX_ACTIVITIES);

      setActivities(limitedActivities);
      saveActivitiesToCache(limitedActivities);

      // Calculate unread count
      const unread = limitedActivities.filter(
        (activity) => activity.timestamp > lastSeenTimestamp.current
      ).length;
      setUnreadCount(unread);

      console.log("✅ Historical activities loaded:", limitedActivities.length);
    } catch (err) {
      console.error("❌ Failed to fetch historical activities:", err);
      setError(err.message || "Failed to load activities");
    } finally {
      setIsLoading(false);
    }
  }, [currentAccount?.address, saveActivitiesToCache]);

  /**
   * Mark all activities as read
   */
  const markAllAsRead = useCallback(() => {
    if (activities.length > 0) {
      const latestTimestamp = activities[0].timestamp;
      lastSeenTimestamp.current = latestTimestamp;
      localStorage.setItem(LAST_SEEN_KEY, latestTimestamp.toString());
      setUnreadCount(0);
    }
  }, [activities]);

  /**
   * Refresh activities manually
   */
  const refresh = useCallback(() => {
    return fetchHistoricalActivities();
  }, [fetchHistoricalActivities]);

  // Setup event listeners on account change
  useEffect(() => {
    if (currentAccount?.address) {
      // Load cached activities first (instant)
      loadCachedActivities();

      // Fetch historical activities (initial load)
      fetchHistoricalActivities();

      // Setup real-time listeners
      setupEventListeners(currentAccount.address);
    } else {
      setActivities([]);
      setUnreadCount(0);
      cleanupEventListeners();
    }

    return () => {
      cleanupEventListeners();
    };
  }, [
    currentAccount?.address,
    setupEventListeners,
    cleanupEventListeners,
    fetchHistoricalActivities,
    loadCachedActivities,
  ]);

  // Get activity summary
  const summary = getActivitySummary(activities);

  return {
    activities,
    isLoading,
    error,
    unreadCount,
    summary,
    isConnected,
    refresh,
    markAllAsRead,
    addActivity,
  };
}
