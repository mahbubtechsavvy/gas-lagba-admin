import { redirect } from 'next/navigation';
import { readSession } from '@/lib/session';
import { SignInForm } from './sign-in-form';

export const metadata = { title: 'Sign in · Gas Lagba Admin' };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  const session = await readSession();
  const { reason } = await searchParams;
  if (session?.accessToken && !reason) {
    redirect('/dashboard');
  }
  const reasonText =
    reason === 'not-admin' ? 'This account is not an administrator.' : reason === 'expired' ? 'Your session has expired. Sign in again.' : undefined;
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Gas Lagba Admin</h1>
        <p className="mt-1 text-sm text-zinc-500">Sign in with your email. We&apos;ll send a one-time code.</p>
        {reasonText ? <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">{reasonText}</p> : null}
        <SignInForm />
      </div>
    </main>
  );
}
