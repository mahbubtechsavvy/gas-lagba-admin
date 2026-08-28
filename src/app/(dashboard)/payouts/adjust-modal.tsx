'use client';

import { useState } from 'react';
import { adjustLedgerAction } from './actions';

export function AdjustLedgerModal({ vendorId }: { vendorId?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [targetVendorId, setTargetVendorId] = useState(vendorId || '');
  const [amountPaisa, setAmountPaisa] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);
    try {
      const fd = new FormData();
      fd.append('vendorId', targetVendorId);
      fd.append('amountPaisa', String(amountPaisa));
      fd.append('description', description);

      await adjustLedgerAction(fd);
      setIsOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Adjustment failed');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
      >
        Manual Ledger Adjustment
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Manual Compensating Ledger Entry</h3>
            <p className="mt-1 text-xs text-zinc-500">Posts an append-only audit adjustment entry to the vendor&apos;s financial ledger (DECISION-004).</p>

            {error && <div className="mt-3 rounded-md bg-rose-50 p-2 text-xs font-medium text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">{error}</div>}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {!vendorId && (
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">Vendor Public ID</label>
                  <input
                    type="text"
                    value={targetVendorId}
                    onChange={(e) => setTargetVendorId(e.target.value)}
                    placeholder="vnd_..."
                    className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Adjustment Amount in Paisa (Positive for Credit, Negative for Debit)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 5000 (+50 BDT) or -2000 (-20 BDT)"
                  value={amountPaisa}
                  onChange={(e) => setAmountPaisa(e.target.value ? parseInt(e.target.value, 10) : '')}
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                  required
                />
                <p className="mt-1 text-2xs text-zinc-500">
                  {amountPaisa !== '' && (
                    <span>
                      {amountPaisa >= 0 ? 'Credit ' : 'Debit '} ৳{(Math.abs(amountPaisa) / 100).toFixed(2)}
                    </span>
                  )}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">Audit Reason / Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Incentive bonus / penalty correction / dispute resolution..."
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                  rows={3}
                  required
                />
              </div>

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
                  {isPending ? 'Posting…' : 'Post Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
