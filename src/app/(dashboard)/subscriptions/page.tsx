import Link from 'next/link';
import { api, pick, type Page } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { PaymentActions } from './payment-actions';

export const metadata = { title: 'Partner Subscriptions · Gas Lagba Admin' };

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
  let page: Page<AdminPaymentRow> = { items: [], nextCursor: null };

  try {
    page = await api<Page<AdminPaymentRow>>('/admin/subscriptions/payments', {
      query: { ...query, limit: 25 },
    });
  } catch {
    // Fallback
  }

  const nextHref = page.nextCursor
    ? `/subscriptions?${new URLSearchParams({
        ...Object.fromEntries(Object.entries(query).filter((e): e is [string, string] => Boolean(e[1]))),
        cursor: page.nextCursor,
      }).toString()}`
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Partner SaaS Subscriptions & Billing</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Adjudicate manual distributor subscription fee payments (bKash/Nagad TrxID) and plan upgrades.
          </p>
        </div>
      </div>

      <form className="flex flex-wrap items-center gap-2.5 text-xs" action="/subscriptions">
        <select
          name="status"
          defaultValue={query.status ?? ''}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 font-medium text-slate-700 focus:border-[#FF6600] focus:outline-none shadow-2xs"
        >
          <option value="">All Payment Statuses</option>
          <option value="SUBMITTED">Pending Review (Submitted)</option>
          <option value="VERIFIED">Verified & Active</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <button
          type="submit"
          className="rounded-xl bg-[#FF6600] px-4 py-2 font-bold text-white shadow-2xs hover:bg-[#EA580C] transition-colors cursor-pointer"
        >
          Filter
        </button>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Vendor / Plan</th>
                <th className="py-3 px-4">Payment Method & TrxID</th>
                <th className="py-3 px-4 text-right">Fee Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {page.items.map((p) => (
                <tr key={p.id} className="hover:bg-[#FFF7ED]/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{p.vendorLegalName || '—'}</div>
                    <div className="font-mono text-[10px] text-slate-400 mt-0.5">Sub ID: {p.subscriptionPublicId || '—'}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    <div className="font-bold text-slate-900">{p.method}</div>
                    <div className="font-mono text-[11px] text-[#FF6600] font-semibold mt-0.5">Ref: {p.transactionRef}</div>
                    {p.proofKey && <div className="text-[10px] text-slate-400 mt-0.5">Proof File: {p.proofKey}</div>}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">
                    ৳{(p.amountPaisa / 100).toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                        p.status === 'VERIFIED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : p.status === 'SUBMITTED'
                          ? 'bg-[#FFF7ED] text-[#FF6600] border-[#FFEDD5]'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[11px] text-slate-500">
                    {new Date(p.createdAt).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <PaymentActions paymentId={p.id} status={p.status} />
                  </td>
                </tr>
              ))}
              {page.items.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No pending subscription payments in queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {nextHref && (
          <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-slate-500">Showing up to 25 payment requests</span>
            <Link
              href={nextHref}
              className="inline-flex items-center rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-[#FFF7ED] hover:text-[#FF6600] shadow-2xs"
            >
              Next Page →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
