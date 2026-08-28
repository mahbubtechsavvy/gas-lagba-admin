'use client';

import { useActionState } from 'react';
import { requestCode, verifyCode, type SignInState } from './actions';

const initial: SignInState = { step: 'email', email: '' };

export function SignInForm() {
  const [state, act, pending] = useActionState(
    async (prev: SignInState, formData: FormData) => (prev.step === 'email' ? requestCode(prev, formData) : verifyCode(prev, formData)),
    initial,
  );

  return (
    <form action={act} className="mt-6 space-y-4">
      {state.step === 'email' ? (
        <label className="block text-sm">
          <span className="text-zinc-700 dark:text-zinc-300">Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={state.email}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </label>
      ) : (
        <>
          <input type="hidden" name="email" value={state.email} />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Code sent to <span className="font-medium">{state.email}</span>.
          </p>
          <label className="block text-sm">
            <span className="text-zinc-700 dark:text-zinc-300">One-time code</span>
            <input
              name="code"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              required
              autoFocus
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 tracking-widest text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
          </label>
        </>
      )}
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state.notice && !state.error ? <p className="text-sm text-zinc-500">{state.notice}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900"
      >
        {pending ? 'Please wait…' : state.step === 'email' ? 'Send code' : 'Sign in'}
      </button>
    </form>
  );
}
