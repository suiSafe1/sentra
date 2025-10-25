// src/constants/Constants.js

import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";

// Contract IDs
export const PACKAGE_ID =
  "0x690cc8f7277cbb2622de286387fc3bec5b6de4bdbb155d0ae2a0852d154ab194";
export const REGISTRY_ID =
  "0xa92e808ecf2e5a129b7a801719d8299528c644ae0f609054fa17f902610aa93a";
export const PLATFORM_ID =
  "0x07a716a59b9a44fa761e417ef568367cb2ed3a9cf7cfcf1c281c1ad257d806bc";
export const CLOCK_ID = "0x6";

// Scallop IDs (for SUI redemption)
export const SCALLOP_MAINNET_MARKET_ID =
  "0xa757975255146dc9686aa823b7838b507f315d704f428cbadad2f4ea061939d9";
export const SCALLOP_MAINNET_VERSION_ID =
  "0x07871c4b3c847a0f674510d4978d5cf6f960452795e8ff6f189fd2088a3f6ac7";

// Sui Client Setup
export const client = new SuiClient({ url: getFullnodeUrl("mainnet") });
