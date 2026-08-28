'use client';

import { useState, useTransition } from 'react';
import { cancelOrderAction, overrideOrderStatusAction } from '../actions';

export function OrderAdminActions({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const [isPending, startTransition] = useTransition();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [reason, setReason] = useState('');
  const [overrideStatus, setOverrideStatus] = useState(currentStatus);
  const [error, setError] = useState<string | null>(null);

  const isTerminal = currentStatus === 'DELIVERED' || currentStatus === 'CANCELLED' || currentStatus === 'REJECTED';

  const handleCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('A cancellation reason is required');
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('reason', reason);
        await cancelOrderAction(orderId, formData);
        setShowCancelModal(false);
        setReason('');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Cancellation failed');
      }
    });
  };

  const handleOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('An override audit reason is required');
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('toStatus', overrideStatus);
        formData.append('reason', reason);
        await overrideOrderStatusAction(orderId, formData);
        setShowOverrideModal(false);
        setReason('');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Status override failed');
      }
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {!isTerminal && (
        <button
          onClick={() => {
            setError(null);
            setShowCancelModal(true);
          }}
          className="rounded-md border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300"
        >
          Cancel Order
        </button>
      )}

      <button
        onClick={() => {
          setError(null);
          setShowOverrideModal(true);
        }}
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        Override Status
      </button>

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-lg font-semibold text-rose-600 dark:text-rose-400">Force Cancel Order</h3>
            <p className="mt-1 text-xs text-zinc-500">
              This action will cancel the order, restore reserved branch inventory, and notify the customer and vendor.
            </p>

            <form onSubmit={handleCancel} className="mt-4">
              {error && <div className="mb-3 rounded bg-rose-50 p-2 text-xs text-rose-600 dark:bg-rose-950 dark:text-rose-300">{error}</div>}
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">Reason for cancellation *</label>
              <textarea
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Customer requested via phone, out of delivery zone, payment issue"
                rows={3}
                className="mt-1 w-full rounded-md border border-zinc-300 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setShowCancelModal(false)}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-md bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  {isPending ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showOverrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Override Order Status</h3>
            <p className="mt-1 text-xs text-zinc-500">Admin status override will record an audited transition entry in the order status history.</p>

            <form onSubmit={handleOverride} className="mt-4">
              {error && <div className="mb-3 rounded bg-rose-50 p-2 text-xs text-rose-600 dark:bg-rose-950 dark:text-rose-300">{error}</div>}

              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">Target Status *</label>
              <select
                value={overrideStatus}
                onChange={(e) => setOverrideStatus(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              >
                <option value="PENDING">PENDING</option>
                <option value="ACCEPTED">ACCEPTED</option>
                <option value="PREPARING">PREPARING</option>
                <option value="READY">READY</option>
                <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="REJECTED">REJECTED</option>
              </select>

              <label className="mt-3 block text-xs font-medium text-zinc-700 dark:text-zinc-300">Audit Reason *</label>
              <textarea
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for manual operational override"
                rows={3}
                className="mt-1 w-full rounded-md border border-zinc-300 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setShowOverrideModal(false)}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-md bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 disabled:opacity-50"
                >
                  {isPending ? 'Updating...' : 'Apply Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
