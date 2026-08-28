/**
 * DEV-LOGIN-BACKDOOR — TEMPORARY. Delete this file, dev-login.tsx, the DEV_LOGIN_ENABLED
 * entries in src/lib/env.ts and .env.example, and the <DevLoginButton /> on the sign-in
 * page once the backend is complete. See docs/06-security/DEV_LOGIN_BACKDOOR.md.
 */
'use server';

import { redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { env } from '@/lib/env';
import { writeSession } from '@/lib/session';

/**
 * Signs in as the API's throwaway super admin, skipping the email code. The page only
 * renders the button when the flag is on, and this re-checks it so a hand-crafted POST
 * to the action endpoint gets nowhere either.
 */
export async function devSignIn(): Promise<string> {
  if (!env.devLoginEnabled()) {
    return 'Dev login is disabled.';
  }
  try {
    const session = await api<{ accessToken: string; refreshToken: string }>('/auth/dev-login', {
      method: 'POST',
      body: { role: 'ADMIN' },
      anonymous: true,
    });
    await writeSession(session);
  } catch {
    return 'Dev login failed. The API needs AUTH_DEV_LOGIN_ENABLED=true and AUTH_IDENTITY_PROVIDER=fake, and a seeded database.';
  }
  redirect('/dashboard');
}
