'use server';

import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';

export async function reviewPayoutMethod(
  id: string,
  decision: 'APPROVE' | 'REJECT',
  adminNote?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await api(`/admin/vendors/payout-methods/${id}/review`, {
      method: 'POST',
      body: {
        decision,
        adminNote: adminNote?.trim() || undefined,
      },
    });

    revalidatePath('/payouts/methods');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to review payout method' };
  }
}
