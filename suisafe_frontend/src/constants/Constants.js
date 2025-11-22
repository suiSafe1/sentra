// src/constants/Constants.js

import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";

// Contract IDs
export const PACKAGE_ID =
  "0xe7f9195e196481c59eb8da4c624e54574f1ec7a7822f2c0532de67668cadf368";
export const REGISTRY_ID =
  "0x15a9045f704069d57cd483c537db8e520b91edf1ed532c8df31443c316a3bae6";
export const PLATFORM_ID =
  "0x7bff4a524702b14783c6abf1b3dca82dd3237da87d9179c7c7933fc72814da29";
export const CLOCK_ID = "0x6";

// Scallop IDs (for SUI redemption)
export const SCALLOP_MAINNET_MARKET_ID =
  "0xa757975255146dc9686aa823b7838b507f315d704f428cbadad2f4ea061939d9";
export const SCALLOP_MAINNET_VERSION_ID =
  "0x07871c4b3c847a0f674510d4978d5cf6f960452795e8ff6f189fd2088a3f6ac7";

// Sui Client Setup
export const client = new SuiClient({ url: getFullnodeUrl("mainnet") });
