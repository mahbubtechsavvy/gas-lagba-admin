'use client';

import { useTransition, useState } from 'react';
import { approveVendor, rejectVendor, reinstateVendor, setCommission, suspendVendor } from './actions';

interface ModerationProps {
  vendorId: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'SUSPENDED' | 'REJECTED';
  commissionBps: number | null;
  canApprove: boolean;
  canFinance: boolean;
}

export function ModerationControls({ vendorId, status, commissionBps, canApprove, canFinance }: ModerationProps) {
  const [isPending, startTransition] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {canApprove && status === 'PENDING_APPROVAL' && (
        <button
          disabled={isPending}
          onClick={() => startTransition(() => approveVendor(vendorId))}
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50"
        >
          {isPending ? 'Approving...' : 'Approve vendor'}
        </button>
      )}

      {canApprove && (status === 'PENDING_APPROVAL' || status === 'APPROVED') && (
        <button
          disabled={isPending}
          onClick={() => setRejectOpen(!rejectOpen)}
          className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-red-500 disabled:opacity-50"
        >
          Reject application
        </button>
      )}

      {canApprove && status === 'APPROVED' && (
        <button
          disabled={isPending}
          onClick={() => setSuspendOpen(!suspendOpen)}
          className="rounded-md bg-orange-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-orange-500 disabled:opacity-50"
        >
          Suspend vendor
        </button>
      )}

      {canApprove && status === 'SUSPENDED' && (
        <button
          disabled={isPending}
          onClick={() => startTransition(() => reinstateVendor(vendorId))}
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50"
        >
          {isPending ? 'Reinstating...' : 'Reinstate vendor'}
        </button>
      )}

      {rejectOpen && (
        <form
          action={(formData) => {
            startTransition(async () => {
              await rejectVendor(vendorId, formData);
              setRejectOpen(false);
            });
          }}
          className="mt-2 flex w-full flex-col gap-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/20"
        >
          <div className="text-xs font-semibold text-red-800 dark:text-red-300">Reason for rejection</div>
          <input
            name="reason"
            required
            placeholder="e.g. Invalid trade license documentation"
            className="w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={isPending} className="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-500">
              Confirm rejection
            </button>
            <button
              type="button"
              onClick={() => setRejectOpen(false)}
              className="rounded border border-zinc-300 px-3 py-1 text-xs text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {suspendOpen && (
        <form
          action={(formData) => {
            startTransition(async () => {
              await suspendVendor(vendorId, formData);
              setSuspendOpen(false);
            });
          }}
          className="mt-2 flex w-full flex-col gap-2 rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-900/50 dark:bg-orange-950/20"
        >
          <div className="text-xs font-semibold text-orange-800 dark:text-orange-300">Reason for suspension</div>
          <input
            name="reason"
            required
            placeholder="e.g. Safety compliance violation"
            className="w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={isPending} className="rounded bg-orange-600 px-3 py-1 text-xs font-medium text-white hover:bg-orange-500">
              Confirm suspension
            </button>
            <button
              type="button"
              onClick={() => setSuspendOpen(false)}
              className="rounded border border-zinc-300 px-3 py-1 text-xs text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {canFinance && (
        <form action={(formData) => startTransition(() => setCommission(vendorId, formData))} className="flex items-center gap-2">
          <label className="text-xs text-zinc-500">Commission (bps):</label>
          <input
            type="number"
            name="commissionBps"
            min="0"
            max="10000"
            defaultValue={commissionBps ?? ''}
            placeholder="Default"
            className="w-24 rounded border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-950"
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Save rate
          </button>
        </form>
      )}
    </div>
  );
}
