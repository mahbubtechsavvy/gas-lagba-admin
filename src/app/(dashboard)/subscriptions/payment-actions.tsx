'use client';

import { useState, useTransition } from 'react';
import { rejectPayment, verifyPayment } from './actions';

interface PaymentActionsProps {
  paymentId: string;
  status: 'SUBMITTED' | 'VERIFIED' | 'REJECTED';
}

export function PaymentActions({ paymentId, status }: PaymentActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  if (status !== 'SUBMITTED') {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        disabled={isPending}
        onClick={() => setVerifyOpen(!verifyOpen)}
        className="rounded bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        Verify
      </button>
      <button
        disabled={isPending}
        onClick={() => setRejectOpen(!rejectOpen)}
        className="rounded bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-500 disabled:opacity-50"
      >
        Reject
      </button>

      {verifyOpen && (
        <form
          action={(formData) => {
            startTransition(async () => {
              await verifyPayment(paymentId, formData);
              setVerifyOpen(false);
            });
          }}
          className="mt-2 flex w-full flex-col gap-2 rounded border border-emerald-200 bg-emerald-50 p-2 dark:border-emerald-900/50 dark:bg-emerald-950/20"
        >
          <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Verification note (optional)</div>
          <input
            name="reviewNote"
            placeholder="e.g. Verified against bank statement"
            className="w-full rounded border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded bg-emerald-600 px-2.5 py-0.5 text-xs font-medium text-white hover:bg-emerald-500"
            >
              Confirm verify & activate
            </button>
            <button
              type="button"
              onClick={() => setVerifyOpen(false)}
              className="rounded border border-zinc-300 px-2 py-0.5 text-xs text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {rejectOpen && (
        <form
          action={(formData) => {
            startTransition(async () => {
              await rejectPayment(paymentId, formData);
              setRejectOpen(false);
            });
          }}
          className="mt-2 flex w-full flex-col gap-2 rounded border border-red-200 bg-red-50 p-2 dark:border-red-900/50 dark:bg-red-950/20"
        >
          <div className="text-xs font-semibold text-red-800 dark:text-red-300">Rejection reason</div>
          <input
            name="reason"
            required
            placeholder="e.g. Transaction ID not found"
            className="w-full rounded border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded bg-red-600 px-2.5 py-0.5 text-xs font-medium text-white hover:bg-red-500"
            >
              Confirm reject
            </button>
            <button
              type="button"
              onClick={() => setRejectOpen(false)}
              className="rounded border border-zinc-300 px-2 py-0.5 text-xs text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
