'use client';

import { useActionState } from 'react';
import { requestCode, verifyCode, type SignInState } from './actions';

const initial: SignInState = { step: 'email', email: '' };

export function SignInForm() {
  const [state, act, pending] = useActionState(
    async (prev: SignInState, formData: FormData) =>
      prev.step === 'email' ? requestCode(prev, formData) : verifyCode(prev, formData),
    initial,
  );

  return (
    <form action={act} className="space-y-4">
      {state.step === 'email' ? (
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Admin Work Email
          </label>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="admin@gaslagba.com"
            defaultValue={state.email}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-[#FF6600] focus:outline-none focus:ring-2 focus:ring-[#FF6600]/20 transition-all shadow-2xs"
          />
        </div>
      ) : (
        <div className="space-y-3">
          <input type="hidden" name="email" value={state.email} />
          <div className="rounded-xl bg-[#FFF7ED] p-3 text-xs text-slate-700 border border-[#FFEDD5]">
            A 6-digit OTP has been sent to <span className="font-bold text-[#FF6600]">{state.email}</span>.
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              One-Time Verification Code
            </label>
            <input
              name="code"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              placeholder="123456"
              required
              autoFocus
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-center text-lg tracking-widest font-mono font-bold text-slate-900 placeholder-slate-300 focus:border-[#FF6600] focus:outline-none focus:ring-2 focus:ring-[#FF6600]/20 transition-all shadow-2xs"
            />
          </div>
        </div>
      )}

      {state.error && (
        <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
          {state.error}
        </div>
      )}

      {state.notice && !state.error && (
        <div className="rounded-xl bg-slate-100 p-3 text-xs font-medium text-slate-600">
          {state.notice}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-[#FF6600] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#EA580C] disabled:opacity-50 transition-all cursor-pointer"
      >
        {pending ? 'Verifying with Gas Lagba API…' : state.step === 'email' ? 'Send OTP Code →' : 'Authorize & Sign In →'}
      </button>
    </form>
  );
}
