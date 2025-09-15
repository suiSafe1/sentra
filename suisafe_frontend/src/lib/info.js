import {
  CircleDollarSign,
  LockKeyhole,
  TrendingUp,
  CircleCheck,
} from "lucide-react";

export const infos = [
  {
    key: "totalValueLocked",
    title: "Total Value Locked",
    amount: "$12,450.75",
    usdEquivalent: "+5.2% from last month",
    icon: CircleDollarSign,
  },
  {
    key: "yieldEarned",
    title: "Yield Earned",
    amount: "402.12 SUI",
    usdEquivalent: "$1,204.64",
    change: "+5.2% from last month",
    icon: LockKeyhole,
  },
  {
    key: "activeLocks",
    title: "Active Locks",
    count: 7,
    description: "Currently generating yield",
    icon: TrendingUp,
  },
  {
    key: "readyForWithdrawal",
    title: "Ready for Withdrawal",
    count: 3,
    description: "Locks expired",
    icon: CircleCheck,
  },
];
