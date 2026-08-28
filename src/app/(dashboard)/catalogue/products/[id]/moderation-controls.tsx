'use client';

import { useState, useTransition } from 'react';
import type { ProductRow } from '../../types';
import { approveProduct, rejectProduct } from './actions';

interface Props {
  productId: string;
  approvalStatus: ProductRow['approvalStatus'];
  canModerate: boolean;
}

export function ProductModerationControls({ productId, approvalStatus, canModerate }: Props) {
  const [isPending, startTransition] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);

  if (!canModerate) {
    return <div className="text-xs text-zinc-500">You do not have the catalogue.moderate permission.</div>;
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {approvalStatus !== 'APPROVED' ? (
        <button
          disabled={isPending}
          onClick={() => startTransition(() => approveProduct(productId))}
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {isPending ? 'Approving…' : 'Approve product'}
        </button>
      ) : null}

      {approvalStatus !== 'REJECTED' ? (
        <button
          disabled={isPending}
          onClick={() => setRejectOpen(!rejectOpen)}
          className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
        >
          Reject product
        </button>
      ) : null}

      {rejectOpen ? (
        <form
          action={(formData) =>
            startTransition(async () => {
              await rejectProduct(productId, formData);
              setRejectOpen(false);
            })
          }
          className="mt-2 flex w-full flex-col gap-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/20"
        >
          <div className="text-xs font-semibold text-red-800 dark:text-red-300">Reason the vendor will see</div>
          <input
            name="reason"
            required
            placeholder="e.g. Photo does not show the safety seal"
            className="w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={isPending} className="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-500">
              Confirm rejection
            </button>
            <button
              type="button"
              onClick={() => setRejectOpen(false)}
              className="rounded border border-zinc-300 px-3 py-1 text-xs dark:border-zinc-700"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
