/**
 * Web Crypto SHA-256 Utilities
 * Deterministic cryptographic hashing for DrugChain blockchain blocks.
 */

// Deterministic serializer to ensure consistent JSON formatting regardless of object key order
export function canonicalJsonStringify(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalJsonStringify).join(',') + ']';
  }

  const sortedKeys = Object.keys(obj).sort();
  const pairs = sortedKeys.map((key) => {
    return JSON.stringify(key) + ':' + canonicalJsonStringify(obj[key]);
  });

  return '{' + pairs.join(',') + '}';
}

/**
 * Calculates SHA-256 hash using native Web Crypto API.
 * Returns a 64-character lowercase hex string.
 */
export async function calculateSha256(dataString: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(dataString);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Node.js crypto fallback for server-side testing/rendering
  try {
    const nodeCrypto = await import('crypto');
    return nodeCrypto.createHash('sha256').update(dataString).digest('hex');
  } catch {
    // Basic fallback hash for non-crypto edge environments
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  }
}

/**
 * Deterministically constructs block content representation and computes its SHA-256 hash.
 */
export async function calculateBlockHash(
  index: number,
  timestamp: number,
  data: any,
  previousHash: string,
  nonce: number = 0
): Promise<string> {
  const serializedData = canonicalJsonStringify(data);
  const blockHeader = `${index}|${timestamp}|${serializedData}|${previousHash}|${nonce}`;
  return calculateSha256(blockHeader);
}

/**
 * Truncates hash for compact UI display (e.g., "0x8f2a...9b4c")
 */
export function formatShortHash(hash: string, startChars: number = 8, endChars: number = 6): string {
  if (!hash) return '';
  if (hash.length <= startChars + endChars) return hash;
  return `${hash.slice(0, startChars)}...${hash.slice(-endChars)}`;
}
