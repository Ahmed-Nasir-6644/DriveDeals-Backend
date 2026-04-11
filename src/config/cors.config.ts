/**
 * CORS configuration utility for consistent cross-origin handling
 * Used by both HTTP (main.ts) and WebSocket gateways (bids, chat)
 */

export function getCorsOrigin(): string | string[] {
  const corsOriginEnv = process.env.CORS_ORIGIN;

  // If no environment variable is set, use localhost defaults
  if (!corsOriginEnv) {
    return ['http://localhost:5173', 'http://localhost:5000'];
  }

  // If it's a single URL (no commas), return as string
  if (!corsOriginEnv.includes(',')) {
    return corsOriginEnv.trim();
  }

  // If it contains commas, split into array and trim each
  return corsOriginEnv.split(',').map((url) => url.trim());
}
