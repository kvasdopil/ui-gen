/**
 * Generate a consistent project ID from a user's email address.
 * This ensures the same user on different browsers/devices uses the same project.
 */
export async function getProjectIdFromEmail(email: string | null | undefined): Promise<string> {
  if (!email) {
    // console.log("[ProjectID] No email provided, using default project ID");
    return "default";
  }

  // Use Web Crypto API to hash the email (available in both browser and Node.js)
  const encoder = new TextEncoder();
  const data = encoder.encode(email.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  // Use first 16 characters as project ID (64 bits of entropy is plenty)
  const projectId = hashHex.substring(0, 16);
  // // console.log("[ProjectID] Generated project ID from email", {
  //   email: email.toLowerCase().trim(),
  //   projectId,
  // });
  return projectId;
}

/**
 * Synchronous version for cases where we can't use async (like in some callbacks).
 * Uses a simple hash function instead of crypto.subtle.
 */
export function getProjectIdFromEmailSync(email: string | null | undefined): string {
  if (!email) {
    // console.log("[ProjectID] No email provided (sync), using default project ID");
    return "default";
  }

  // Simple hash function (djb2-like)
  let hash = 5381;
  const normalizedEmail = email.toLowerCase().trim();
  for (let i = 0; i < normalizedEmail.length; i++) {
    hash = ((hash << 5) + hash) + normalizedEmail.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Convert to hex and take first 16 characters
  const hashHex = Math.abs(hash).toString(16).padStart(8, "0");
  // Add some more entropy by hashing the hash again
  let hash2 = 5381;
  for (let i = 0; i < hashHex.length; i++) {
    hash2 = ((hash2 << 5) + hash2) + hashHex.charCodeAt(i);
    hash2 = hash2 & hash2;
  }
  const hash2Hex = Math.abs(hash2).toString(16).padStart(8, "0");
  
  const projectId = (hashHex + hash2Hex).substring(0, 16);
  // console.log("[ProjectID] Generated project ID from email (sync)", {
  //   email: normalizedEmail,
  //   projectId,
  // });
  return projectId;
}

