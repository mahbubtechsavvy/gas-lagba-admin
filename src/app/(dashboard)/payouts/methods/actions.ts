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
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to review payout method' };
  }
}
