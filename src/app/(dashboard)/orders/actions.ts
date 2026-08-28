'use server';

import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';

export async function cancelOrderAction(orderId: string, formData: FormData): Promise<void> {
  const reason = formData.get('reason') as string;
  await api(`/admin/orders/${orderId}/cancel`, {
    method: 'POST',
    body: { reason },
  });
  revalidatePath(`/orders/${orderId}`);
  revalidatePath('/orders');
  revalidatePath('/orders/escalations');
}

export async function overrideOrderStatusAction(orderId: string, formData: FormData): Promise<void> {
  const toStatus = formData.get('toStatus') as string;
  const reason = formData.get('reason') as string;
  await api(`/admin/orders/${orderId}/override-status`, {
    method: 'POST',
    body: { toStatus, reason },
  });
  revalidatePath(`/orders/${orderId}`);
  revalidatePath('/orders');
  revalidatePath('/orders/escalations');
}

export async function resolveEscalationAction(escalationId: string, formData: FormData): Promise<void> {
  const resolutionNote = formData.get('resolutionNote') as string;
  await api(`/admin/orders/escalations/${escalationId}/resolve`, {
    method: 'POST',
    body: { resolutionNote },
  });
  revalidatePath('/orders/escalations');
  revalidatePath('/orders');
}
