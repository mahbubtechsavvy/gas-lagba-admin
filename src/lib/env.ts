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
  /**
   * DEV-LOGIN-BACKDOOR (TEMPORARY) — shows the "Dev login" button on /sign-in and lets
   * the matching server action run. Off unless explicitly set, and ignored outright in a
   * production build, so a stray DEV_LOGIN_ENABLED=true on Vercel cannot open a door.
   * Remove with the rest of the backdoor: docs/06-security/DEV_LOGIN_BACKDOOR.md.
   */
  devLoginEnabled: () => process.env['DEV_LOGIN_ENABLED'] === 'true' && process.env['NODE_ENV'] !== 'production',
} as const;
