import { useMemo } from "react";
import { useSuiLocks } from "./useSuiLocks";

export function useDashboardStats() {
  const { userLocks, isLoading, prices } = useSuiLocks();

  const stats = useMemo(() => {
    if (isLoading || userLocks.length === 0) {
      return {
        totalValueLocked: "0.00",
        totalYieldEarned: "0.00",
        activeLocks: 0,
        readyForWithdrawal: 0,
        loading: isLoading,
      };
    }

    const tvl = userLocks.reduce((sum, lock) => {
      return sum + parseFloat(lock.principalUsd || 0);
    }, 0);

    const totalYield = userLocks.reduce((sum, lock) => {
      return sum + parseFloat(lock.yieldEarnedUsd || 0);
    }, 0);

    const activeLocks = userLocks.filter((lock) => !lock.isExpired).length;

    const readyForWithdrawal = userLocks.filter(
      (lock) => lock.isExpired
    ).length;

    const mockMonthChange = 5.2;

    return {
      totalValueLocked: tvl.toFixed(2),
      totalYieldEarned: totalYield.toFixed(2),
      activeLocks,
      readyForWithdrawal,
      monthChange: mockMonthChange,
      loading: false,
    };
  }, [userLocks, isLoading, prices]);

  return stats;
}
