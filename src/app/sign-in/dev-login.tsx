/**
 * DEV-LOGIN-BACKDOOR — TEMPORARY. Delete with dev-login-action.ts; see
 * docs/06-security/DEV_LOGIN_BACKDOOR.md.
 */
'use client';

import { useActionState } from 'react';
import { devSignIn } from './dev-login-action';

export function DevLoginButton() {
  const [error, act, pending] = useActionState<string, FormData>(() => devSignIn(), '');

  return (
    <form action={act} className="mt-6 border-t border-dashed border-amber-400 pt-4">
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md border border-amber-400 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100 disabled:opacity-60 dark:border-amber-600 dark:bg-amber-950 dark:text-amber-100"
      >
        {pending ? 'Signing in…' : 'Dev login'}
      </button>
      <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">Frontend testing only — signs in as a throwaway super admin. Removed before production.</p>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
