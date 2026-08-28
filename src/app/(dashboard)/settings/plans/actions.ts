'use server';

import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';

export async function updatePlan(key: string, formData: FormData): Promise<void> {
  const pricePaisaStr = formData.get('pricePaisa') as string;
  const durationDaysStr = formData.get('durationDays') as string;
  const nameEn = formData.get('nameEn') as string;
  const nameBn = formData.get('nameBn') as string;
  const isActive = formData.get('isActive') === 'on';

  await api(`/admin/subscriptions/plans/${key}`, {
    method: 'PATCH',
    body: {
      pricePaisa: pricePaisaStr ? parseInt(pricePaisaStr, 10) : null,
      durationDays: durationDaysStr ? parseInt(durationDaysStr, 10) : undefined,
      nameI18n: nameEn && nameBn ? { en: nameEn, bn: nameBn } : undefined,
      isActive,
    },
  });
  revalidatePath('/settings/plans');
}
