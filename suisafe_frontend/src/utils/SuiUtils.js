// src/utils/SuiUtils.js

export function extractBigInt(fields, ...candidates) {
  // ... (Full implementation of extractBigInt function)
  for (const cand of candidates) {
    if (Array.isArray(cand)) {
      let node = fields;
      let ok = true;
      for (const seg of cand) {
        if (node == null) {
          ok = false;
          break;
        }
        if (node[seg] !== undefined) {
          node = node[seg];
        } else if (node.fields && node.fields[seg] !== undefined) {
          node = node.fields[seg];
        } else {
          ok = false;
          break;
        }
      }
      if (!ok) continue;
      if (typeof node === "string") {
        try {
          return BigInt(node);
        } catch {
          continue;
        }
      }
      if (node?.value !== undefined) {
        try {
          return BigInt(node.value);
        } catch {
          continue;
        }
      }
      if (node?.fields?.value !== undefined) {
        try {
          return BigInt(node.fields.value);
        } catch {
          continue;
        }
      }
    } else {
      const v = fields[cand] ?? fields?.fields?.[cand];
      if (v === undefined) continue;
      if (typeof v === "string") {
        try {
          return BigInt(v);
        } catch {
          continue;
        }
      }
      if (v?.value !== undefined) {
        try {
          return BigInt(v.value);
        } catch {
          continue;
        }
      }
      if (v?.fields?.value !== undefined) {
        try {
          return BigInt(v.fields.value);
        } catch {
          continue;
        }
      }
    }
  }

  return BigInt(0);
}

export function formatTokenAmountRaw(
  bigintValue,
  decimals = 9,
  displayDecimals = 2
) {
  const factor = BigInt(10) ** BigInt(decimals);
  const integer = bigintValue / factor;
  const remainder = bigintValue % factor;
  const frac = Number((remainder * BigInt(10 ** displayDecimals)) / factor);
  return `${integer.toString()}.${frac
    .toString()
    .padStart(displayDecimals, "0")}`;
}

export function extractTimeNumber(fields, ...candidates) {
  const v = extractBigInt(fields, ...candidates);
  const n = Number(v.toString());
  return Number.isFinite(n) ? n : 0;
}

export function prettyTokenNameFromType(typeName) {
  if (!typeName || typeof typeName !== "string") return "TOKEN";
  if (typeName.includes("::sui::SUI")) return "SUI";

  const parts = typeName.split("::");
  return parts[parts.length - 1] ?? typeName;
}

export function extractCoinType(fields) {
  const candidates = [
    fields.coin_type,
    fields?.fields?.coin_type,
    fields.type,
    fields?.fields?.type,
    fields.coinType,
    fields?.fields?.coinType,
  ];

  for (const candidate of candidates) {
    if (candidate && typeof candidate === "string") {
      return candidate;
    }
  }
  return null;
}
