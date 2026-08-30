import Link from 'next/link';
import { api, pick, type Page } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { PayoutReviewButtons } from './payout-review-buttons';

export const metadata = { title: 'Vendor Payment Receiving Accounts · Gas Lagba Admin' };

interface VendorPayoutMethodRow {
  id: string;
  vendorId: string;
  vendorName?: string;
  type: 'BKASH' | 'NAGAD' | 'ROCKET' | 'BANK';
  accountType: string;
  accountNumber: string;
  accountName: string | null;
  bankName: string | null;
  branchName: string | null;
  routingNumber: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNote: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export default async function VendorPayoutMethodsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const query = pick(params, ['status', 'vendorId', 'cursor']);
  let page: Page<VendorPayoutMethodRow> = { items: [], nextCursor: null };

  try {
    page = await api<Page<VendorPayoutMethodRow>>('/admin/vendors/payout-methods/all', {
      query: { ...query, limit: 25 },
    });
  } catch {
    // Fallback
  }

  const nextHref = page.nextCursor
    ? `/payouts/methods?${new URLSearchParams({
        ...Object.fromEntries(Object.entries(query).filter((e): e is [string, string] => Boolean(e[1]))),
        cursor: page.nextCursor,
      }).toString()}`
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/payouts" className="text-xs font-semibold text-slate-500 hover:text-slate-800">
              ← Payouts & Ledger
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">Vendor Payment Receiving Accounts</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review and approve vendor bKash, Nagad, Rocket, and Bank payout accounts before funds disbursement.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/payouts/methods?status=PENDING"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#FFF7ED] px-3.5 py-2 text-xs font-bold text-[#FF6600] border border-[#FFEDD5] hover:bg-[#FFEDD5] transition-colors shadow-2xs"
          >
            <span>⏳</span> Pending Moderation Queue
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <form className="flex flex-wrap items-center gap-2.5 text-xs" action="/payouts/methods">
        <input
          name="vendorId"
          placeholder="Filter by Vendor ID"
          defaultValue={query.vendorId ?? ''}
          className="w-48 rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-800 placeholder-slate-400 focus:border-[#FF6600] focus:outline-none shadow-2xs"
        />
        <select
          name="status"
          defaultValue={query.status ?? ''}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700 focus:border-[#FF6600] focus:outline-none shadow-2xs"
        >
          <option value="">All Verification Statuses</option>
          <option value="PENDING">Pending Approval</option>
          <option value="APPROVED">Approved / Active</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <button type="submit" className="rounded-xl bg-[#FF6600] px-4 py-2 font-bold text-white shadow-2xs hover:bg-[#EA580C] transition-colors cursor-pointer">
          Filter
        </button>
      </form>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4">Channel & Type</th>
                <th className="py-3 px-4">Account Number / Name</th>
                <th className="py-3 px-4">Bank / Branch Details</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {page.items.map((m) => (
                <tr key={m.id} className="hover:bg-[#FFF7ED]/30 transition-colors align-top">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{m.vendorName ?? 'Vendor Store'}</div>
                    <div className="font-mono text-[10px] text-slate-400">{m.id}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">{m.type}</span>
                      {m.isDefault && (
                        <span className="rounded bg-blue-50 text-blue-700 px-1.5 py-0.2 text-[9px] font-bold">DEFAULT</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500">{m.accountType}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-slate-900">{m.accountNumber}</div>
                    {m.accountName && <div className="text-[11px] text-slate-600">{m.accountName}</div>}
                  </td>
                  <td className="py-3.5 px-4">
                    {m.type === 'BANK' ? (
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-800">{m.bankName || '—'}</div>
                        <div className="text-[11px] text-slate-500">
                          Branch: {m.branchName || '—'} | Routing: {m.routingNumber || '—'}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400">MFS Mobile Wallet</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                        m.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : m.status === 'PENDING'
                            ? 'bg-[#FFF7ED] text-[#FF6600] border-[#FFEDD5]'
                            : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {m.status}
                    </span>
                    {m.adminNote && (
                      <div className="text-[10px] text-red-600 mt-1 max-w-[160px] truncate" title={m.adminNote}>
                        Note: {m.adminNote}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <PayoutReviewButtons methodId={m.id} currentStatus={m.status} />
                  </td>
                </tr>
              ))}
              {page.items.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No vendor payment receiving accounts found matching query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {nextHref && (
          <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-slate-500">Showing up to 25 accounts</span>
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
