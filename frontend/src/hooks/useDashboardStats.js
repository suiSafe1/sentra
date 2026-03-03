import { useMemo } from "react";
import { useSuiLocks } from "./useSuiLocks";

export function useDashboardStats(status = "ALL") {
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
    // FILTERED LOCK BY STATUS
    const filteredLocks =
      status === "LOCKED"
        ? userLocks.filter((l) => !l.isExpired)
        : status === "WITHDRAW"
          ? userLocks.filter((l) => l.isExpired)
          : userLocks;
    const tvl = filteredLocks.reduce((sum, lock) => {
      return sum + parseFloat(lock.principalUsd || 0);
    }, 0);

    const totalYield = filteredLocks.reduce((sum, lock) => {
      return sum + parseFloat(lock.yieldEarnedUsd || 0);
    }, 0);

    const activeLocks = filteredLocks.filter((lock) => !lock.isExpired).length;

    const readyForWithdrawal = filteredLocks.filter(
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
