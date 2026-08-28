import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { RefundModal } from './refund-modal';

interface PaymentDetail {
  id: string;
  checkoutId: string;
  method: string;
  status: string;
  amountPaisa: number;
  currency: string;
  providerReference: string | null;
  capturedAt: string | null;
  createdAt: string;
  orders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    allocatedPaisa: number;
  }>;
  refunds: Array<{
    id: string;
    orderId: string;
    amountPaisa: number;
    reason: string;
    status: string;
    providerRefundId: string | null;
    completedAt: string | null;
    createdAt: string;
  }>;
}

export default async function PaymentInspectorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  let payment: PaymentDetail;
  try {
    payment = await api<PaymentDetail>(`/admin/payments/${id}`);
  } catch {
    notFound();
  }

  const totalRefundedPaisa = payment.refunds.reduce((acc, r) => acc + r.amountPaisa, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/payments" className="text-xs text-zinc-500 hover:text-zinc-700">
              ← Back to Payments
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight font-mono">{payment.id}</h1>
          <p className="text-xs text-zinc-500">Checkout Reference: {payment.checkoutId}</p>
        </div>

        <div className="flex items-center gap-2">
          {payment.status === 'CAPTURED' && payment.orders.length > 0 && (
            <RefundModal paymentId={payment.id} orders={payment.orders} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Financial Summary */}
        <div className="rounded-lg border border-zinc-200 bg-white p-5 space-y-3 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Transaction Status</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Status</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{payment.status}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Payment Gateway</span>
              <span className="font-semibold">{payment.method}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Gross Paid</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                ৳{(payment.amountPaisa / 100).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Total Refunded</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400">
                ৳{(totalRefundedPaisa / 100).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-500">Gateway Ref</span>
              <span className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
                {payment.providerReference || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Allocated Orders */}
        <div className="rounded-lg border border-zinc-200 bg-white p-5 space-y-3 md:col-span-2 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Allocated Orders</h2>
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {payment.orders.map((o) => (
              <div key={o.id} className="flex items-center justify-between py-3">
                <div>
                  <Link href={`/orders/${o.id}`} className="font-semibold text-sm hover:underline text-blue-600 dark:text-blue-400">
                    Order #{o.orderNumber}
                  </Link>
                  <div className="text-xs text-zinc-500">Status: {o.status}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm">৳{(o.allocatedPaisa / 100).toFixed(2)}</div>
                  <div className="text-xs text-zinc-500">Order Allocation</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Refunds History */}
      <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Refunds History</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-500 uppercase dark:border-zinc-800 dark:bg-zinc-950">
            <tr>
              <th className="px-4 py-2.5">Refund ID</th>
              <th className="px-4 py-2.5">Order Ref</th>
              <th className="px-4 py-2.5">Amount</th>
              <th className="px-4 py-2.5">Reason</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Gateway Refund ID</th>
              <th className="px-4 py-2.5">Completed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {payment.refunds.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-zinc-500">
                  No refunds issued for this transaction.
                </td>
              </tr>
            ) : (
              payment.refunds.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-mono text-xs font-medium">{r.id}</td>
                  <td className="px-4 py-3 font-mono text-xs">{r.orderId}</td>
                  <td className="px-4 py-3 font-semibold text-rose-600 dark:text-rose-400">
                    ৳{(r.amountPaisa / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400">{r.reason}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">{r.providerRefundId || '—'}</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {r.completedAt ? new Date(r.completedAt).toLocaleString('en-GB') : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
