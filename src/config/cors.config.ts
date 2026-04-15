/**
 * CORS configuration utility for consistent cross-origin handling
 * Used by both HTTP (main.ts) and WebSocket gateways (bids, chat)
 */

export function getCorsOrigin(): string | string[] {
  const corsOriginEnv = process.env.CORS_ORIGIN;
  const nodeEnv = process.env.NODE_ENV;

  console.log('CORS_ORIGIN env var:', corsOriginEnv);
  console.log('NODE_ENV:', nodeEnv);

  // If no environment variable is set, use defaults based on environment
  if (!corsOriginEnv) {
    const defaults = nodeEnv === 'production'
      ? [
          'https://drivedeals-steel.vercel.app',
          'https://drive-deals-frontend.vercel.app',
        ]
      : ['http://localhost:5173', 'http://localhost:5000', 'http://127.0.0.1:5173'];
    console.log('Using default CORS origins:', defaults);
    return defaults;
  }

  // If it's a single URL (no commas), return as string
  if (!corsOriginEnv.includes(',')) {
    const origin = corsOriginEnv.trim();
    console.log('Using CORS origin:', origin);
    return origin;
  }

  // If it contains commas, split into array and trim each
  const origins = corsOriginEnv.split(',').map((url) => url.trim());
  console.log('Using CORS origins:', origins);
  return origins;
}
