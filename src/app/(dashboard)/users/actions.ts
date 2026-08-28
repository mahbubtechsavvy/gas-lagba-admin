'use server';

import { revalidatePath } from 'next/cache';
import { api, ApiError } from '@/lib/api';

export interface SuspendState {
  error?: string;
}

export async function setSuspended(_prev: SuspendState, formData: FormData): Promise<SuspendState> {
  const userId = String(formData.get('userId') ?? '');
  const suspend = formData.get('suspend') === 'true';
  const reason = String(formData.get('reason') ?? '').trim();
  if (!/^usr_[0-9A-Za-z]{22}$/.test(userId)) {
    return { error: 'Invalid user id.' };
  }
  if (reason.length < 5) {
    return { error: 'Give a reason (at least 5 characters) — it is recorded in the audit log.' };
  }
  try {
    await api(`/admin/users/${userId}/${suspend ? 'suspend' : 'reinstate'}`, { method: 'POST', body: { reason } });
    revalidatePath('/users');
    return {};
  } catch (err) {
    return { error: err instanceof ApiError ? err.body.message : 'Request failed.' };
  }
}
