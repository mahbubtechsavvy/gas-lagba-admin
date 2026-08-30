'use server';

import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';

export async function updateAdminProfile(formData: FormData) {
  await requireAdmin();

  const fullName = (formData.get('fullName') as string) || '';
  const phone = (formData.get('phone') as string) || '';
  const locale = (formData.get('locale') as string) || 'en';
  const avatarKey = (formData.get('avatarKey') as string) || '';

  await api('/users/me', {
    method: 'PATCH',
    body: JSON.stringify({
      fullName: fullName.trim(),
      phone: phone.trim() || null,
      locale,
      ...(avatarKey ? { avatarKey } : {}),
    }),
  });

  revalidatePath('/profile');
  revalidatePath('/', 'layout');
}
