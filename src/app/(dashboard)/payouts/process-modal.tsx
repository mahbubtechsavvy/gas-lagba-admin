'use client';

import { useState } from 'react';
import { processPayoutAction } from './actions';

export function ProcessPayoutModal({
  payoutId,
  currentStatus,
  amountPaisa,
}: {
  payoutId: string;
  currentStatus: string;
  amountPaisa: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState(currentStatus === 'APPROVED' ? 'COMPLETED' : 'APPROVED');
  const [externalReference, setExternalReference] = useState('');
  const [failureReason, setFailureReason] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);
    try {
      const fd = new FormData();
      fd.append('status', status);
      fd.append('externalReference', externalReference);
      fd.append('failureReason', failureReason);

      await processPayoutAction(payoutId, fd);
      setIsOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Processing failed');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
      >
        Process
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Process Disbursement #{payoutId}</h3>
            <p className="mt-1 text-xs text-zinc-500">
              Amount: ৳{(amountPaisa / 100).toFixed(2)}. Updating to FAILED will automatically refund the vendor ledger
              balance.
            </p>

            {error && (
              <div className="mt-3 rounded-md bg-rose-50 p-2 text-xs font-medium text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">Action Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                  required
                >
                  <option value="APPROVED">APPROVED</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="COMPLETED">COMPLETED (Funds Transferred)</option>
                  <option value="FAILED">FAILED (Reject & Refund Balance)</option>
                </select>
              </div>

              {status === 'COMPLETED' && (
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Bank / MFS Transaction Reference
                  </label>
                  <input
                    type="text"
                    value={externalReference}
                    onChange={(e) => setExternalReference(e.target.value)}
                    placeholder="BEFTN-99882233 or bKash TrxID..."
                    className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                    required
                  />
                </div>
              )}

              {status === 'FAILED' && (
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">Rejection Reason</label>
                  <textarea
                    value={failureReason}
                    onChange={(e) => setFailureReason(e.target.value)}
                    placeholder="Invalid bank account number or branch IFSC code..."
                    className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                    rows={3}
                    required
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 disabled:opacity-50"
                >
                  {isPending ? 'Updating…' : 'Save Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
