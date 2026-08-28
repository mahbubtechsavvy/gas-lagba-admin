'use server';

import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';

export async function approveProduct(productId: string): Promise<void> {
  await api(`/admin/products/${productId}/approve`, { method: 'POST' });
  revalidatePath(`/catalogue/products/${productId}`);
  revalidatePath('/catalogue/products');
}

export async function rejectProduct(productId: string, formData: FormData): Promise<void> {
  const reason = (formData.get('reason') as string) || undefined;
  await api(`/admin/products/${productId}/reject`, { method: 'POST', body: { reason } });
  revalidatePath(`/catalogue/products/${productId}`);
  revalidatePath('/catalogue/products');
}
