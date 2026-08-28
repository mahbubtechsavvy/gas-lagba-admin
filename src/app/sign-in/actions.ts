'use server';

import { redirect } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { clearSession, writeSession } from '@/lib/session';

export interface SignInState {
  step: 'email' | 'code';
  email: string;
  error?: string;
  notice?: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function requestCode(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  if (!EMAIL.test(email)) {
    return { step: 'email', email, error: 'Enter a valid email address.' };
  }
  try {
    const res = await api<{ message: string }>('/auth/otp/request', { method: 'POST', body: { email, locale: 'en' }, anonymous: true });
    return { step: 'code', email, notice: res.message };
  } catch (err) {
    if (err instanceof ApiError && err.status === 429) {
      const wait = (err.body.details as { retryAfterSeconds?: number } | undefined)?.retryAfterSeconds;
      return { step: 'email', email, error: `Too many requests. Try again in ${wait ?? 60} seconds.` };
    }
    return { step: 'email', email, error: 'Could not send a code right now. Please try again shortly.' };
  }
}

export async function verifyCode(prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get('email') ?? prev.email)
    .trim()
    .toLowerCase();
  const code = String(formData.get('code') ?? '').trim();
  if (!/^\d{6,8}$/.test(code)) {
    return { step: 'code', email, error: 'Enter the 6-digit code from your email.' };
  }
  try {
    const session = await api<{ accessToken: string; refreshToken: string }>('/auth/otp/verify', {
      method: 'POST',
      body: { email, code },
      anonymous: true,
    });
    await writeSession(session);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      return { step: 'code', email, error: 'That code is invalid or has expired.' };
    }
    return { step: 'code', email, error: 'Sign-in failed. Please try again.' };
  }
  redirect('/dashboard');
}

export async function signOut(): Promise<void> {
  try {
    await api<void>('/auth/logout', { method: 'POST' });
  } catch {
    // The cookie is cleared regardless; the API's revocation is best-effort here.
  }
  await clearSession();
  redirect('/sign-in');
}
