'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { reviewPayoutMethod } from './actions';

interface Props {
  methodId: string;
  currentStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export function PayoutReviewButtons({ methodId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleApprove = () => {
    setError(null);
    startTransition(async () => {
      const res = await reviewPayoutMethod(methodId, 'APPROVE');
      if (res.success) {
        router.refresh();
      } else {
        setError(res.error || 'Failed to approve');
      }
    });
  };

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await reviewPayoutMethod(methodId, 'REJECT', adminNote);
      if (res.success) {
        setRejectOpen(false);
        router.refresh();
      } else {
        setError(res.error || 'Failed to reject');
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-1.5">
      {error && <div className="text-[10px] text-red-600 font-medium">{error}</div>}

      <div className="flex items-center gap-1.5">
        {currentStatus !== 'APPROVED' && (
          <button
            onClick={handleApprove}
            disabled={isPending}
            className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {isPending ? 'Saving...' : '✓ Approve'}
          </button>
        )}

        {currentStatus !== 'REJECTED' && (
          <button
            onClick={() => setRejectOpen(!rejectOpen)}
            disabled={isPending}
            className="rounded-lg bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 text-[11px] font-bold hover:bg-red-100 disabled:opacity-50 transition-colors cursor-pointer"
          >
            ✕ Reject
          </button>
        )}
      </div>

      {rejectOpen && (
        <form onSubmit={handleReject} className="mt-2 w-64 rounded-xl border border-red-200 bg-red-50/50 p-2.5 text-left">
          <label className="block text-[11px] font-bold text-red-900 mb-1">Rejection Reason / Note</label>
          <input
            type="text"
            required
            placeholder="e.g. Account number name does not match NID"
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            className="w-full rounded-lg border border-red-200 bg-white px-2 py-1 text-xs text-slate-800 focus:outline-none"
          />
          <div className="flex items-center justify-end gap-1.5 mt-2">
            <button
              type="button"
              onClick={() => setRejectOpen(false)}
              className="rounded px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded bg-red-600 px-2.5 py-0.5 text-[10px] font-bold text-white hover:bg-red-500 disabled:opacity-50"
            >
              {isPending ? 'Rejecting...' : 'Confirm Reject'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
