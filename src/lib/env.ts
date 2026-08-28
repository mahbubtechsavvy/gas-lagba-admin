import 'server-only';

/**
 * Server-side environment for the admin panel. The panel never talks to Supabase or
 * the database directly (ARCHITECTURE_AUDIT §6.6, §IV.4) — only to the Gas Lagba API.
 * Nothing here is exposed to the browser.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value;
}

export const env = {
  /** e.g. https://api.gaslagba.example — no trailing slash; never an IP. */
  apiBaseUrl: () => required('API_BASE_URL').replace(/\/$/, ''),
  /** Cookie name prefix; keeps sessions distinct per environment. */
  cookiePrefix: () => process.env['SESSION_COOKIE_PREFIX'] ?? 'gl_admin',
  isProduction: () => process.env['NODE_ENV'] === 'production',
} as const;
