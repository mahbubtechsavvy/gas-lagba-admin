'use server';

import { revalidatePath } from 'next/cache';
import { api, ApiError } from '@/lib/api';

export interface UpdateSettingState {
  error?: string;
  saved?: boolean;
}

export async function updateSetting(_prev: UpdateSettingState, formData: FormData): Promise<UpdateSettingState> {
  const key = String(formData.get('key') ?? '');
  const raw = String(formData.get('value') ?? '').trim();
  if (!/^[a-z0-9_.]+$/.test(key)) {
    return { error: 'Invalid setting key.' };
  }
  if (!/^-?\d+$/.test(raw)) {
    return { error: 'Enter a whole number.' };
  }
  try {
    await api(`/admin/settings/${key}`, { method: 'PUT', body: { value: Number(raw) } });
    revalidatePath('/settings');
    return { saved: true };
  } catch (err) {
    if (err instanceof ApiError) {
      return { error: err.status === 403 ? 'You do not have permission to change this setting.' : err.body.message };
    }
    return { error: 'Could not save. Try again.' };
  }
}
