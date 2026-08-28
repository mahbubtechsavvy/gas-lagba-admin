import Link from 'next/link';
import { api, type Page } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { ProcessPayoutModal } from './process-modal';
import { AdjustLedgerModal } from './adjust-modal';

export const metadata = { title: 'Payouts & Ledger · Gas Lagba Admin' };

interface PayoutSummary {
  id: string;
  vendorId: string;
  vendorName: string;
  amountPaisa: number;
  currency: string;
  status: string;
  method: string | null;
  externalReference: string | null;
  failureReason: string | null;
  createdAt: string;
  completedAt: string | null;
}

function payoutStatusBadge(status: string) {
  switch (status) {
    case 'APPROVED':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'PROCESSING':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'COMPLETED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'FAILED':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export default async function PayoutsPage({ searchParams }: { searchParams: Promise<{ cursor?: string; status?: string; vendorId?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  let data: Page<PayoutSummary> = { items: [], nextCursor: null };

  try {
    data = await api<Page<PayoutSummary>>('/admin/payouts', {
      query: {
        cursor: sp.cursor,
        status: sp.status,
        vendorId: sp.vendorId,
        limit: 20,
      },
    });
  } catch {
    // Fallback
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Vendor Payouts & Double-Entry Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Process partner disbursement requests, export bKash/Nagad batches, and audit immutable transaction logs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AdjustLedgerModal />
        </div>
      </div>

      {/* Filter Bar */}
      <form method="get" className="flex flex-wrap items-center gap-3">
        <select
          name="status"
          defaultValue={sp.status ?? ''}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-[#003496] focus:outline-none"
        >
          <option value="">All Disbursement Statuses</option>
          <option value="APPROVED">APPROVED (Pending Transfer)</option>
          <option value="PROCESSING">PROCESSING</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="FAILED">FAILED</option>
        </select>
        <button type="submit" className="rounded-lg bg-[#003496] px-4 py-2 text-xs font-semibold text-white hover:bg-[#002875] transition-colors shadow-xs">
          Filter
        </button>
      </form>

      {/* Payouts Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Payout ID</th>
                <th className="py-3 px-4">Vendor Partner</th>
                <th className="py-3 px-4 text-right">Disbursement Amount</th>
                <th className="py-3 px-4 text-center">Channel</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Bank / MFS Reference</th>
                <th className="py-3 px-4">Requested</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {data.items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No disbursement requests found matching your filter.
                  </td>
                </tr>
              ) : (
                data.items.map((p) => (
                  <tr key={p.id} className="hover:bg-[#E6EEF9]/20 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{p.id}</td>
                    <td className="py-3.5 px-4">
                      <Link href={`/payouts/${p.vendorId}/ledger`} className="font-bold text-slate-900 hover:text-[#003496]">
                        {p.vendorName}
                      </Link>
                      <div className="font-mono text-[10px] text-slate-400">{p.vendorId}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">
                      ৳{(p.amountPaisa / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block rounded bg-slate-100 px-2 py-0.5 font-semibold text-slate-700 text-[10px]">{p.method || 'BANK'}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${payoutStatusBadge(p.status)}`}>{p.status}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {p.externalReference ? (
                        <span className="text-slate-800 font-semibold">{p.externalReference}</span>
                      ) : p.failureReason ? (
                        <span className="text-red-600 font-normal">{p.failureReason}</span>
                      ) : (
                        <span className="text-slate-400 italic font-normal">Pending reference</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-500">{new Date(p.createdAt).toLocaleDateString('en-GB', { dateStyle: 'medium' })}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/payouts/${p.vendorId}/ledger`}
                          className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-[#003496] hover:text-white transition-colors"
                        >
                          Ledger
                        </Link>
                        {p.status !== 'COMPLETED' && <ProcessPayoutModal payoutId={p.id} currentStatus={p.status} amountPaisa={p.amountPaisa} />}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {data.nextCursor && (
          <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-slate-500">Showing up to 20 disbursements per page</span>
            <Link
              href={`/payouts?cursor=${data.nextCursor}${sp.status ? `&status=${sp.status}` : ''}`}
              className="inline-flex items-center rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
            >
              Next Page →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
