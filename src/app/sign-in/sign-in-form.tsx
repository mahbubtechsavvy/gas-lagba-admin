'use client';

import { useActionState, useState } from 'react';
import { requestCode, verifyCode, type SignInState } from './actions';

const initial: SignInState = { step: 'email', email: '' };

export function SignInForm() {
  const [state, act, pending] = useActionState<SignInState, FormData>(
    async (prev: SignInState, formData: FormData): Promise<SignInState> => {
      if (formData.get('intent') === 'change-email') {
        return { step: 'email', email: prev.email };
      }
      return prev.step === 'email' ? requestCode(prev, formData) : verifyCode(prev, formData);
    },
    initial,
  );

  return (
    <form action={act} className="space-y-4">
      {state.step === 'email' ? (
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            Admin Work Email
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
              </svg>
            </div>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="e.g. admin@gaslagba.com"
              defaultValue={state.email}
              className="w-full rounded-2xl border border-white/15 bg-slate-950/60 pl-10 pr-4 py-3 text-sm font-medium text-white placeholder-slate-500 focus:border-[#FF6600] focus:bg-slate-950/80 focus:outline-none focus:ring-4 focus:ring-[#FF6600]/20 transition-all shadow-inner"
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Enter your authorized administrative email to receive a secure login code.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <input type="hidden" name="email" value={state.email} />

          {/* Email badge with Change option */}
          <div className="flex items-center justify-between rounded-2xl bg-white/5 border border-white/10 p-3.5">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FF6600]/20 text-[#FF8C38] text-xs">
                ✉️
              </span>
              <div className="truncate">
                <p className="text-[10px] uppercase font-bold text-slate-400">Code Sent To</p>
                <p className="text-xs font-bold text-white truncate">{state.email}</p>
              </div>
            </div>
            <button
              type="submit"
              name="intent"
              value="change-email"
              className="shrink-0 px-2.5 py-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            >
              Change
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              8-Digit Authentication Code
            </label>
            <div className="relative">
              <input
                name="code"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={8}
                autoComplete="one-time-code"
                placeholder="• • • • • • • •"
                required
                autoFocus
                className="w-full rounded-2xl border border-white/15 bg-slate-950/60 px-4 py-3 text-center text-xl tracking-[0.3em] font-mono font-black text-[#FF8C38] placeholder-slate-600 focus:border-[#FF6600] focus:bg-slate-950/80 focus:outline-none focus:ring-4 focus:ring-[#FF6600]/20 transition-all shadow-inner"
              />
            </div>
            <p className="text-[11px] text-slate-400 text-center">
              Check your inbox for the 8-digit one-time code. Valid for 10 minutes.
            </p>
          </div>
        </div>
      )}

      {state.error && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-3 text-xs font-semibold text-red-400 flex items-center gap-2">
          <span>❌</span>
          <span>{state.error}</span>
        </div>
      )}

      {state.notice && !state.error && (
        <div className="rounded-2xl bg-white/5 border border-white/10 p-3 text-xs font-medium text-slate-300">
          {state.notice}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full relative flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#FF6600] to-[#FF8C38] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#FF6600]/25 hover:from-[#EA580C] hover:to-[#FF6600] hover:shadow-[#FF6600]/35 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer group"
      >
        {pending ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Verifying with Gas Lagba API…</span>
          </span>
        ) : state.step === 'email' ? (
          <span className="flex items-center gap-2">
            <span>Send Login Code</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <span>Authorize & Enter Console</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </span>
        )}
      </button>
    </form>
  );
}
