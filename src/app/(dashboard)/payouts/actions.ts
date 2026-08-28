'use server';

import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';

export async function processPayoutAction(payoutId: string, formData: FormData): Promise<void> {
  const status = formData.get('status') as string;
  const externalReference = formData.get('externalReference') as string;
  const failureReason = formData.get('failureReason') as string;

  await api(`/admin/payouts/${payoutId}/process`, {
    method: 'POST',
    body: {
      status,
      externalReference: externalReference || undefined,
      failureReason: failureReason || undefined,
    },
  });

  revalidatePath('/payouts');
}

export async function adjustLedgerAction(formData: FormData): Promise<void> {
  const vendorId = formData.get('vendorId') as string;
  const amountPaisa = parseInt(formData.get('amountPaisa') as string, 10);
  const description = formData.get('description') as string;

  await api('/admin/payouts/adjust', {
    method: 'POST',
    body: {
      vendorId,
      amountPaisa,
      description,
    },
  });

  revalidatePath(`/payouts/${vendorId}/ledger`);
  revalidatePath('/payouts');
}
