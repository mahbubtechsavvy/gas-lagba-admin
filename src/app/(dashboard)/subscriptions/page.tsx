import Link from 'next/link';
import { api, pick, type Page } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { PaymentActions } from './payment-actions';

export const metadata = { title: 'Subscriptions · Gas Lagba Admin' };

export interface AdminPaymentRow {
  id: string;
  method: string;
  transactionRef: string;
  amountPaisa: number;
  proofKey: string | null;
  status: 'SUBMITTED' | 'VERIFIED' | 'REJECTED';
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  createdAt: string;
  subscriptionPublicId?: string;
  vendorLegalName?: string;
}

export default async function SubscriptionsQueuePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const query = pick(params, ['status', 'cursor']);
  const page = await api<Page<AdminPaymentRow>>('/admin/subscriptions/payments', {
    query: { ...query, limit: 25 },
  });

  const nextHref = page.nextCursor
    ? `/subscriptions?${new URLSearchParams({
        ...Object.fromEntries(Object.entries(query).filter((e): e is [string, string] => Boolean(e[1]))),
        cursor: page.nextCursor,
      }).toString()}`
    : null;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Subscription Payments</h1>
      </div>

      <form className="mt-4 flex flex-wrap gap-2 text-sm" action="/subscriptions">
        <select
          name="status"
          defaultValue={query.status ?? ''}
          className="rounded-md border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="">All payment statuses</option>
          <option value="SUBMITTED">Pending review (Submitted)</option>
          <option value="VERIFIED">Verified & Active</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-3 py-1 text-white dark:bg-zinc-50 dark:text-zinc-900"
        >
          Filter
        </button>
      </form>

      <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-950">
            <tr>
              <th className="px-3 py-2">Vendor / Subscription</th>
              <th className="px-3 py-2">Payment Details</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Submitted</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {page.items.map((p) => (
              <tr key={p.id} className="border-t border-zinc-100 dark:border-zinc-800">
                <td className="px-3 py-2">
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">{p.vendorLegalName || '—'}</div>
                  <div className="font-mono text-[11px] text-zinc-400">Sub: {p.subscriptionPublicId || '—'}</div>
                </td>
                <td className="px-3 py-2 text-xs">
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200">{p.method}</div>
                  <div className="font-mono text-zinc-500">Ref: {p.transactionRef}</div>
                  {p.proofKey && <div className="text-[11px] text-zinc-400">Proof: {p.proofKey}</div>}
                </td>
                <td className="px-3 py-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  ৳{(p.amountPaisa / 100).toFixed(2)}
                </td>
                <td className="px-3 py-2 text-xs">
                  <span
                    className={`inline-block rounded px-2 py-0.5 font-medium ${
                      p.status === 'VERIFIED'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : p.status === 'SUBMITTED'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                          : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                    }`}
                  >
                    {p.status}
                  </span>
                  {p.reviewNote && <div className="mt-0.5 text-[11px] text-zinc-400">{p.reviewNote}</div>}
                </td>
                <td className="px-3 py-2 text-xs text-zinc-500">
                  {new Date(p.createdAt).toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' })}
                </td>
                <td className="px-3 py-2 text-xs">
                  <PaymentActions paymentId={p.id} status={p.status} />
                </td>
              </tr>
            ))}
            {page.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-zinc-500">
                  No subscription payments found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {nextHref ? (
        <Link href={nextHref} className="mt-4 inline-block text-sm underline">
          Next page →
        </Link>
      ) : null}
    </div>
  );
}
