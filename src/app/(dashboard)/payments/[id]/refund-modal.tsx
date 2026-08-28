'use client';

import { useState } from 'react';
import { refundPaymentAction } from '../actions';

export function RefundModal({
  paymentId,
  orders,
}: {
  paymentId: string;
  orders: Array<{ id: string; orderNumber: string; allocatedPaisa: number }>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0]?.id || '');
  const [amountPaisa, setAmountPaisa] = useState<number | ''>('');
  const [reason, setReason] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);
    try {
      const fd = new FormData();
      fd.append('orderId', selectedOrderId);
      if (amountPaisa !== '') {
        fd.append('amountPaisa', String(amountPaisa));
      }
      fd.append('reason', reason);

      await refundPaymentAction(paymentId, fd);
      setIsOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Refund operation failed');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-500"
      >
        Issue Refund
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Issue Payment Refund</h3>
            <p className="mt-1 text-xs text-zinc-500">
              Initiates an immediate partial or full gateway refund and writes compensating ledger adjustments.
            </p>

            {error && (
              <div className="mt-3 rounded-md bg-rose-50 p-2 text-xs font-medium text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">Target Order</label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                  required
                >
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      Order #{o.orderNumber} (Max: ৳{(o.allocatedPaisa / 100).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Refund Amount in Paisa (Leave empty for full order refund: ৳
                  {selectedOrder ? (selectedOrder.allocatedPaisa / 100).toFixed(2) : 0})
                </label>
                <input
                  type="number"
                  placeholder={selectedOrder ? String(selectedOrder.allocatedPaisa) : '0'}
                  value={amountPaisa}
                  onChange={(e) => setAmountPaisa(e.target.value ? parseInt(e.target.value, 10) : '')}
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">Reason for Refund</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Customer returned defective cylinder / cancelled order..."
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
                  className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-500 disabled:opacity-50"
                >
                  {isPending ? 'Processing Refund…' : 'Confirm Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
