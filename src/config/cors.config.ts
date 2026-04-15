/**
 * CORS configuration utility for consistent cross-origin handling
 * Used by both HTTP (main.ts) and WebSocket gateways (bids, chat)
 */

export function getCorsOrigin(): string | string[] {
  const corsOriginEnv = process.env.CORS_ORIGIN;
  const nodeEnv = process.env.NODE_ENV;
  const vercelUrl = process.env.VERCEL_URL;

  console.log('CORS Configuration:');
  console.log('- CORS_ORIGIN env:', corsOriginEnv);
  console.log('- NODE_ENV:', nodeEnv);
  console.log('- VERCEL_URL:', vercelUrl);

  // If explicit CORS_ORIGIN is provided, use it
  if (corsOriginEnv) {
    if (!corsOriginEnv.includes(',')) {
      const origin = corsOriginEnv.trim();
      console.log('Using explicit CORS origin:', origin);
      return origin;
    }

    const origins = corsOriginEnv.split(',').map((url) => url.trim());
    console.log('Using explicit CORS origins:', origins);
    return origins;
  }

  // Production defaults (Vercel or other production environments)
  const productionOrigins = [
    'https://drivedeals-steel.vercel.app',
    'https://drive-deals-frontend.vercel.app',
    'https://drivedeals.vercel.app',
  ];

  // Local development defaults
  const developmentOrigins = [
    'http://localhost:5173',
    'http://localhost:5000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5000',
  ];

  // Determine which defaults to use
  const isProduction = nodeEnv === 'production' || vercelUrl || process.env.VERCEL === '1';
  const defaults = isProduction ? productionOrigins : developmentOrigins;

  console.log(`Using default CORS origins (${isProduction ? 'production' : 'development'}):`, defaults);
  return defaults;
}
