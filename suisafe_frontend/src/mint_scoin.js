#!/usr/bin/env node

/**
 * Mint sCoin Script
 *
 * This script mints sCoin from a base token using Scallop Protocol:
 * 1. Mints MarketCoin from base token (SUI, DEEP, etc.)
 * 2. Converts MarketCoin to sCoin
 *
 * Usage:
 *   node mint-scoin.js <token-symbol> <amount>
 *
 * Example:
 *   node mint-scoin.js SUI 10
 *   node mint-scoin.js DEEP 100
 */

import { Transaction } from "@mysten/sui/transactions";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { fromB64, fromHEX } from "@mysten/sui/utils";
import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";

// ==================== CONFIGURATION ====================

const SCALLOP_MAINNET_MARKET_ID =
  "0xa757975255146dc9686aa823b7838b507f315d704f428cbadad2f4ea061939d9";
const SCALLOP_MAINNET_VERSION_ID =
  "0x07871c4b3c847a0f674510d4978d5cf6f960452795e8ff6f189fd2088a3f6ac7";
const SCALLOP_MINT_PACKAGE =
  "0x83bbe0b3985c5e3857803e2678899b03f3c4a31be75006ab03faf268c014ce41";
const SCALLOP_S_COIN_CONVERTER_PACKAGE =
  "0x80ca577876dec91ae6d22090e56c39bc60dce9086ab0729930c6900bc4162b4c";
const CLOCK_ID = "0x6";

// Token configurations
const TOKENS = {
  SUI: {
    symbol: "SUI",
    type: "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
    decimals: 9,
    scoin: {
      type: "0xaafc4f740de0dd0dde642a31148fb94517087052f19afb0f7bed1dc41a50c77b::scallop_sui::SCALLOP_SUI",
      converterId:
        "0x5c1678c8261ac9eec024d4d630006a9f55c80dc0b1aa38a003fcb1d425818c6b",
    },
  },
  DEEP: {
    symbol: "DEEP",
    type: "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP",
    decimals: 6,
    scoin: {
      type: "0xeb7a05a3224837c5e5503575aed0be73c091d1ce5e43aa3c3e716e0ae614608f::scallop_deep::SCALLOP_DEEP",
      converterId:
        "0xc63838fabe37b25ad897392d89876d920f5e0c6a406bf3abcb84753d2829bc88",
    },
  },
  // Add more tokens as needed
};

// ==================== SETUP ====================

const client = new SuiClient({ url: getFullnodeUrl("mainnet") });

// ⚠️ ADD YOUR PRIVATE KEY HERE ⚠️
// Replace the empty string with your actual private key
const PRIVATE_KEY = "";

if (!PRIVATE_KEY) {
  console.error("❌ Error: PRIVATE_KEY not set");
  console.error(
    "\nPlease add your private key to the PRIVATE_KEY variable in the script"
  );
  console.error("\nYour private key can be in either format:");
  console.error("  - Bech32: suiprivkey1...");
  console.error("  - Base64: ...");
  process.exit(1);
}

let keypair;
try {
  // Try to decode as Bech32 format first (suiprivkey1...)
  if (PRIVATE_KEY.startsWith("suiprivkey")) {
    const { schema, secretKey } = decodeSuiPrivateKey(PRIVATE_KEY);
    keypair = Ed25519Keypair.fromSecretKey(secretKey);
  } else {
    // Try base64 format
    const secretKey = fromB64(PRIVATE_KEY);
    keypair = Ed25519Keypair.fromSecretKey(secretKey);
  }
} catch (error) {
  console.error("❌ Error: Invalid private key format");
  console.error("Make sure your private key is in the correct format:");
  console.error("  - Bech32 format: suiprivkey1...");
  console.error("  - Base64 format");
  console.error("\nError details:", error.message);
  process.exit(1);
}

const address = keypair.toSuiAddress();

// ==================== MAIN FUNCTION ====================

async function mintSCoin(tokenSymbol, amount) {
  const token = TOKENS[tokenSymbol.toUpperCase()];

  if (!token) {
    console.error(`❌ Error: Token '${tokenSymbol}' not supported`);
    console.error(`\nSupported tokens: ${Object.keys(TOKENS).join(", ")}`);
    process.exit(1);
  }

  if (!token.scoin || !token.scoin.type || !token.scoin.converterId) {
    console.error(`❌ Error: sCoin configuration missing for ${tokenSymbol}`);
    process.exit(1);
  }

  console.log("\n🔄 Minting sCoin...");
  console.log(`   Token: ${token.symbol}`);
  console.log(`   Amount: ${amount}`);
  console.log(`   Address: ${address}\n`);

  try {
    const tx = new Transaction();
    tx.setGasBudget(15_000_000);

    const tokenAmount = BigInt(
      Math.floor(parseFloat(amount) * 10 ** token.decimals)
    );

    // Step 1: Get the base coin
    let coin;

    if (token.symbol === "SUI") {
      [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(tokenAmount)]);
    } else {
      const coins = await client.getCoins({
        owner: address,
        coinType: token.type,
      });

      if (!coins.data || coins.data.length === 0) {
        throw new Error(`No ${token.symbol} coins found in wallet`);
      }

      const totalBalance = coins.data.reduce(
        (sum, coin) => sum + BigInt(coin.balance),
        BigInt(0)
      );

      if (totalBalance < tokenAmount) {
        const available = Number(totalBalance) / 10 ** token.decimals;
        throw new Error(
          `Insufficient ${token.symbol} balance. Available: ${available.toFixed(
            token.decimals
          )}`
        );
      }

      const primaryCoinId = coins.data[0].coinObjectId;
      coin = tx.object(primaryCoinId);

      if (
        coins.data.length > 1 &&
        BigInt(coins.data[0].balance) < tokenAmount
      ) {
        const coinsToMerge = coins.data
          .slice(1)
          .map((c) => tx.object(c.coinObjectId));
        tx.mergeCoins(coin, coinsToMerge);
      }

      [coin] = tx.splitCoins(coin, [tx.pure.u64(tokenAmount)]);
    }

    console.log("📝 Step 1: Minting MarketCoin...");

    // Step 2: Mint MarketCoin from Scallop
    const marketCoinHandle = tx.moveCall({
      target: `${SCALLOP_MINT_PACKAGE}::mint::mint`,
      arguments: [
        tx.object(SCALLOP_MAINNET_VERSION_ID),
        tx.object(SCALLOP_MAINNET_MARKET_ID),
        coin,
        tx.object(CLOCK_ID),
      ],
      typeArguments: [token.type],
    });

    console.log("📝 Step 2: Converting to sCoin...");

    // Step 3: Mint sCoin from MarketCoin
    const sCoinHandle = tx.moveCall({
      target: `${SCALLOP_S_COIN_CONVERTER_PACKAGE}::s_coin_converter::mint_s_coin`,
      arguments: [tx.object(token.scoin.converterId), marketCoinHandle],
      typeArguments: [token.scoin.type, token.type],
    });

    // Transfer the sCoin to the sender
    tx.transferObjects([sCoinHandle], address);

    console.log("🔐 Signing and executing transaction...\n");

    const result = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    });

    const digest = result.digest;

    console.log("✅ sCoin minted successfully!");
    console.log(`   Transaction: ${digest}`);
    console.log(`   Explorer: https://suiscan.xyz/mainnet/tx/${digest}\n`);

    // Find created sCoin object
    const createdObjects = result.objectChanges?.filter(
      (c) => c.type === "created"
    );
    const sCoinObj = createdObjects?.find((c) =>
      c.objectType?.includes(token.scoin.type)
    );

    if (sCoinObj) {
      console.log(`   sCoin Object ID: ${sCoinObj.objectId}`);
    }

    return { success: true, txHash: digest };
  } catch (error) {
    console.error("\n❌ Minting failed:", error.message || error);
    process.exit(1);
  }
}

// ==================== CLI HANDLER ====================

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log("\n📘 Usage: node mint-scoin.js <token-symbol> <amount>");
  console.log("\nExamples:");
  console.log("  node mint-scoin.js SUI 10");
  console.log("  node mint-scoin.js DEEP 100");
  console.log(`\nSupported tokens: ${Object.keys(TOKENS).join(", ")}`);
  console.log("\nMake sure to set SUI_PRIVATE_KEY environment variable first:");
  console.log("  export SUI_PRIVATE_KEY='your-private-key-here'\n");
  process.exit(0);
}

const [tokenSymbol, amount] = args;

if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
  console.error("❌ Error: Amount must be a positive number");
  process.exit(1);
}

mintSCoin(tokenSymbol, amount);
