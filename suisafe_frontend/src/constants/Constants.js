// src/constants/Constants.js

import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";

// Contract IDs
export const PACKAGE_ID =
  "0x7b9640dc7446fdc540a17ce6a0673be6f95447862ea63685daa7594f57f32601";
export const REGISTRY_ID =
  "0x1cb927b87f8d1c00aadf70e36d315abfe156dbf8ea37bf9fcaaeb2bbd4ea43ba";
export const PLATFORM_ID =
  "0x38648bb04fd4304ccc4ecb28fbf5ac3003103d5f3ae58b172463f73818d10fa5";
export const CLOCK_ID = "0x6";

// Scallop IDs (for SUI redemption)
export const SCALLOP_MAINNET_MARKET_ID =
  "0xa757975255146dc9686aa823b7838b507f315d704f428cbadad2f4ea061939d9";
export const SCALLOP_MAINNET_VERSION_ID =
  "0x07871c4b3c847a0f674510d4978d5cf6f960452795e8ff6f189fd2088a3f6ac7";

// Sui Client Setup
export const client = new SuiClient({ url: getFullnodeUrl("mainnet") });
