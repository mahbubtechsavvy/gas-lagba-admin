'use server';

import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';

export async function approveRider(riderId: string) {
  await requireAdmin();

  await api(`/admin/riders/${riderId}/approve`, {
    method: 'PATCH',
  });

  revalidatePath('/riders');
}

export async function rejectRider(riderId: string, reason: string) {
  await requireAdmin();

  await api(`/admin/riders/${riderId}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });

  revalidatePath('/riders');
}
