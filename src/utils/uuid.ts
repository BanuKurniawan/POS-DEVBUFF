/**
 * Generates a unique UUID v4 string safely across all client and server environments.
 *
 * Why this fallback is needed:
 * Browsers only expose `window.crypto.randomUUID()` in Secure Contexts (HTTPS or localhost).
 * When accessed over local network HTTP (e.g. `http://192.168.1.11:3000`), `crypto.randomUUID`
 * is undefined and throws TypeError.
 */
export function generateUUID(): string {
  // 1. Standard crypto.randomUUID (HTTPS, localhost, Node.js)
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {
      // Fall through to fallback
    }
  }

  // 2. crypto.getRandomValues (RFC4122 version 4)
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    try {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
      bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10xx
      const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    } catch {
      // Fall through to fallback
    }
  }

  // 3. High-entropy timestamp-seeded pseudo-random fallback
  let d = Date.now();
  let d2 = (typeof performance !== "undefined" && performance.now && performance.now() * 1000) || 0;
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    let r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else if (d2 > 0) {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    } else {
      r = r | 0;
    }
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}
