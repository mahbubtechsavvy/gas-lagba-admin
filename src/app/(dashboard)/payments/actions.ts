'use server';

import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';

export async function refundPaymentAction(paymentId: string, formData: FormData): Promise<void> {
  const orderId = formData.get('orderId') as string;
  const amountPaisaRaw = formData.get('amountPaisa') as string;
  const reason = formData.get('reason') as string;

  const amountPaisa = amountPaisaRaw ? parseInt(amountPaisaRaw, 10) : undefined;

  await api(`/admin/payments/${paymentId}/refund`, {
    method: 'POST',
    body: {
      orderId,
      amountPaisa,
      reason,
    },
  });

  revalidatePath(`/payments/${paymentId}`);
  revalidatePath('/payments');
}
