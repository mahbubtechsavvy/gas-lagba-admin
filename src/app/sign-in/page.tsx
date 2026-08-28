import { redirect } from 'next/navigation';
import { env } from '@/lib/env';
import { readSession } from '@/lib/session';
import { DevLoginButton } from './dev-login';
import { SignInForm } from './sign-in-form';

export const metadata = { title: 'Sign In · Gas Lagba Admin' };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  const session = await readSession();
  const { reason } = await searchParams;
  if (session?.accessToken && !reason) {
    redirect('/dashboard');
  }
  const reasonText =
    reason === 'not-admin'
      ? 'This account is not authorized for administrator access.'
      : reason === 'expired'
      ? 'Your admin session has expired. Please sign in again.'
      : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF6600] text-white font-black text-2xl shadow-sm ring-4 ring-[#FF6600]/15 mb-3">
            GL
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Gas Lagba Admin</h1>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Authorized Administrator Access & Operations Console
          </p>
        </div>

        {reasonText && (
          <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs font-semibold text-amber-800">
            {reasonText}
          </div>
        )}

        <SignInForm />

        {/* DEV LOGIN HELPER */}
        {env.devLoginEnabled() && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <DevLoginButton />
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-[11px] text-slate-400">
            Protected by Bangladesh OTP Authentication · Gas Lagba Operations
          </p>
        </div>
      </div>
    </main>
  );
}
