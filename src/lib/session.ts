import 'server-only';
import { cookies } from 'next/headers';
import { env } from './env';

/**
 * Admin session = the API's access + refresh tokens held in HttpOnly cookies.
 * Tokens never reach client-side JavaScript; every API call is made server-side.
 */
export interface Session {
  accessToken: string;
  refreshToken: string;
}

const ACCESS_MAX_AGE = 60 * 60; // provider access tokens are ≤ 1 h
const REFRESH_MAX_AGE = 60 * 60 * 24 * 14;

function names(): { access: string; refresh: string } {
  const p = env.cookiePrefix();
  return { access: `${p}_at`, refresh: `${p}_rt` };
}

export async function readSession(): Promise<Session | null> {
  const jar = await cookies();
  const { access, refresh } = names();
  const accessToken = jar.get(access)?.value;
  const refreshToken = jar.get(refresh)?.value;
  if (!accessToken && !refreshToken) {
    return null;
  }
  return { accessToken: accessToken ?? '', refreshToken: refreshToken ?? '' };
}

export async function writeSession(session: Session): Promise<void> {
  const jar = await cookies();
  const { access, refresh } = names();
  const base = { httpOnly: true, secure: env.isProduction(), sameSite: 'lax' as const, path: '/' };
  jar.set(access, session.accessToken, { ...base, maxAge: ACCESS_MAX_AGE });
  jar.set(refresh, session.refreshToken, { ...base, maxAge: REFRESH_MAX_AGE });
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  const { access, refresh } = names();
  jar.delete(access);
  jar.delete(refresh);
}
