import Link from 'next/link';
import { api, type Page } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';

export const metadata = { title: 'Payments & Transactions · Gas Lagba Admin' };

interface PaymentSummary {
  id: string;
  checkoutId: string;
  method: string;
  status: string;
  amountPaisa: number;
  currency: string;
  providerReference: string | null;
  capturedAt: string | null;
  createdAt: string;
}

function paymentStatusBadge(status: string) {
  switch (status) {
    case 'CAPTURED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'INITIATED':
    case 'PENDING':
      return 'bg-[#FFF7ED] text-[#FF6600] border-[#FFEDD5]';
    case 'REFUNDED':
    case 'PARTIALLY_REFUNDED':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'FAILED':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string; status?: string; method?: string; query?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;

  let data: Page<PaymentSummary> = { items: [], nextCursor: null };
  try {
    data = await api<Page<PaymentSummary>>('/admin/payments', {
      query: {
        cursor: sp.cursor,
        status: sp.status,
        method: sp.method,
        query: sp.query,
        limit: 20,
      },
    });
  } catch {
    // Fallback
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Payments & Gateway Settlements</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Monitor digital gateway checkouts (SSLCOMMERZ, bKash, Nagad), cash-on-delivery (COD) receipts, and refund reconciliations.
        </p>
      </div>

      {/* Filter Bar */}
      <form method="get" className="flex flex-wrap items-center gap-2.5 text-xs">
        <input
          type="text"
          name="query"
          defaultValue={sp.query ?? ''}
          placeholder="Search payment ID or gateway ref..."
          className="w-64 rounded-xl border border-slate-200 bg-white px-3.5 py-2 font-medium text-slate-800 placeholder-slate-400 focus:border-[#FF6600] focus:outline-none focus:ring-2 focus:ring-[#FF6600]/20 shadow-2xs"
        />
        <select
          name="status"
          defaultValue={sp.status ?? ''}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700 focus:border-[#FF6600] focus:outline-none shadow-2xs"
        >
          <option value="">All Statuses</option>
          <option value="CAPTURED">CAPTURED</option>
          <option value="INITIATED">INITIATED</option>
          <option value="PENDING">PENDING</option>
          <option value="REFUNDED">REFUNDED</option>
          <option value="PARTIALLY_REFUNDED">PARTIALLY_REFUNDED</option>
          <option value="FAILED">FAILED</option>
        </select>
        <select
          name="method"
          defaultValue={sp.method ?? ''}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700 focus:border-[#FF6600] focus:outline-none shadow-2xs"
        >
          <option value="">All Payment Methods</option>
          <option value="COD">COD (Cash on Delivery)</option>
          <option value="SSLCOMMERZ">SSLCOMMERZ</option>
          <option value="BKASH">bKash MFS</option>
          <option value="NAGAD">Nagad MFS</option>
        </select>
        <button
          type="submit"
          className="rounded-xl bg-[#FF6600] px-4 py-2 font-bold text-white shadow-2xs hover:bg-[#EA580C] transition-colors cursor-pointer"
        >
          Filter
        </button>
      </form>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Payment ID</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Provider Reference</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {data.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                data.items.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FFF7ED]/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <Link href={`/payments/${p.id}`} className="hover:text-[#FF6600]">
                        {p.id}
                      </Link>
                      <div className="font-mono text-[10px] text-slate-400">Checkout: {p.checkoutId}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 font-bold text-[10px] text-slate-700">
                        {p.method}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">
                      ৳{(p.amountPaisa / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${paymentStatusBadge(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {p.providerReference || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-500">
                      {new Date(p.createdAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/payments/${p.id}`}
                        className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:bg-[#FF6600] hover:text-white transition-colors"
                      >
                        Inspect →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data.nextCursor && (
          <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-slate-500">Showing up to 20 payments</span>
            <Link
              href={`/payments?cursor=${data.nextCursor}${sp.status ? `&status=${sp.status}` : ''}`}
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
