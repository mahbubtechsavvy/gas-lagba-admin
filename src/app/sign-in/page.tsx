import { redirect } from 'next/navigation';
import { readSession } from '@/lib/session';
import { SignInForm } from './sign-in-form';

export const metadata = { title: 'Admin Console Sign In · Gas Lagba' };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  const session = await readSession();
  const { reason } = await searchParams;
  if (session?.accessToken && !reason) {
    redirect('/dashboard');
  }
  const reasonText =
    reason === 'not-admin'
      ? 'This account does not have administrator privileges.'
      : reason === 'expired'
        ? 'Your admin session has expired. Please authenticate again.'
        : undefined;

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#0B132B] px-4 py-12 selection:bg-[#FF6600] selection:text-white overflow-hidden">
      {/* Ambient background glow & grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-slate-900/40 to-[#0B132B] pointer-events-none" />
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-[#FF6600]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-[440px] rounded-3xl border border-white/10 bg-slate-900/85 backdrop-blur-xl p-8 sm:p-10 shadow-2xl ring-1 ring-white/5">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#FF6600] to-[#FF8C38] text-white font-black text-2xl shadow-lg shadow-[#FF6600]/25 ring-4 ring-[#FF6600]/20 mb-4 transition-transform hover:scale-105 duration-300">
            GL
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-semibold text-amber-400 mb-2">
            <span>🛡️</span> Master Operations Console
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Gas Lagba Admin</h1>
          <p className="mt-1.5 text-xs text-slate-400 max-w-xs leading-relaxed">
            Authorized management gateway for nationwide LPG distributors, inventory & live dispatches.
          </p>
        </div>

        {reasonText && (
          <div className="mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-3.5 text-xs font-semibold text-amber-300 flex items-start gap-2.5">
            <span className="text-base leading-none">⚠️</span>
            <div className="leading-tight">{reasonText}</div>
          </div>
        )}

        {/* Authentication Form */}
        <SignInForm />

        {/* Security & System Footer */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>End-to-End Encrypted</span>
            <span className="text-slate-600">·</span>
            <span>OTP Protected</span>
          </div>
          <p className="mt-2 text-[10px] text-slate-500">
            © {new Date().getFullYear()} Gas Lagba Platform · Bangladesh Energy Operations
          </p>
        </div>
      </div>
    </main>
  );
}
