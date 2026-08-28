'use server';

import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';

export async function verifyPayment(paymentId: string, formData: FormData): Promise<void> {
  const reviewNote = (formData.get('reviewNote') as string) || undefined;
  await api(`/admin/subscriptions/payments/${paymentId}/verify`, {
    method: 'POST',
    body: { reviewNote },
  });
  revalidatePath('/subscriptions');
}

export async function rejectPayment(paymentId: string, formData: FormData): Promise<void> {
  const reason = (formData.get('reason') as string) || 'Payment could not be verified';
  await api(`/admin/subscriptions/payments/${paymentId}/reject`, {
    method: 'POST',
    body: { reason },
  });
  revalidatePath('/subscriptions');
}
