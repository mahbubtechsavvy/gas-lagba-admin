'use server';

import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';

export async function approveVendor(vendorId: string): Promise<void> {
  await api(`/admin/vendors/${vendorId}/approve`, { method: 'POST' });
  revalidatePath(`/vendors/${vendorId}`);
  revalidatePath('/vendors');
}

export async function rejectVendor(vendorId: string, formData: FormData): Promise<void> {
  const reason = (formData.get('reason') as string) || undefined;
  await api(`/admin/vendors/${vendorId}/reject`, {
    method: 'POST',
    body: { reason },
  });
  revalidatePath(`/vendors/${vendorId}`);
  revalidatePath('/vendors');
}

export async function suspendVendor(vendorId: string, formData: FormData): Promise<void> {
  const reason = (formData.get('reason') as string) || undefined;
  await api(`/admin/vendors/${vendorId}/suspend`, {
    method: 'POST',
    body: { reason },
  });
  revalidatePath(`/vendors/${vendorId}`);
  revalidatePath('/vendors');
}

export async function reinstateVendor(vendorId: string): Promise<void> {
  await api(`/admin/vendors/${vendorId}/reinstate`, { method: 'POST' });
  revalidatePath(`/vendors/${vendorId}`);
  revalidatePath('/vendors');
}

export async function setCommission(vendorId: string, formData: FormData): Promise<void> {
  const bpsStr = formData.get('commissionBps') as string;
  const commissionBps = bpsStr ? parseInt(bpsStr, 10) : null;
  await api(`/admin/vendors/${vendorId}/commission`, {
    method: 'PATCH',
    body: { commissionBps },
  });
  revalidatePath(`/vendors/${vendorId}`);
}
