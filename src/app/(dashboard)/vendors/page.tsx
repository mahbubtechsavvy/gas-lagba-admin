import Link from 'next/link';
import { api, pick, type Page } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';

export const metadata = { title: 'Vendor Partners · Gas Lagba Admin' };

export interface AdminVendorRow {
  id: string;
  legalName: string;
  displayNameI18n: Record<string, string>;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'SUSPENDED' | 'REJECTED';
  statusReason: string | null;
  contactEmail: string;
  contactPhone: string;
  tradeLicenseNo: string | null;
  ratingAvg: number | null;
  ratingCount: number;
  createdAt: string;
  branches?: Array<{ id: string }>;
}

function vendorStatusBadge(status: string) {
  switch (status) {
    case 'APPROVED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'PENDING_APPROVAL':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'SUSPENDED':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'REJECTED':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const query = pick(params, ['q', 'status', 'cursor']);
  let page: Page<AdminVendorRow> = { items: [], nextCursor: null };

  try {
    page = await api<Page<AdminVendorRow>>('/admin/vendors', {
      query: { ...query, limit: 25 },
    });
  } catch {
    // Fallback
  }

  const nextHref = page.nextCursor
    ? `/vendors?${new URLSearchParams({
        ...Object.fromEntries(Object.entries(query).filter((e): e is [string, string] => Boolean(e[1]))),
        cursor: page.nextCursor,
      }).toString()}`
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Vendor Partner Network</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage certified LPG distributor accounts, branch coverage, and compliance moderation</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <form className="flex flex-wrap items-center gap-3" action="/vendors">
        <div className="relative flex-1 min-w-[240px]">
          <input
            name="q"
            placeholder="Search by legal name, trade license, phone, email..."
            defaultValue={query.q ?? ''}
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#003496] focus:outline-none focus:ring-1 focus:ring-[#003496]"
          />
        </div>
        <select
          name="status"
          defaultValue={query.status ?? ''}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-[#003496] focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="PENDING_APPROVAL">Pending Approval</option>
          <option value="APPROVED">Approved</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <button
          type="submit"
          className="rounded-lg bg-[#003496] px-4 py-2 text-xs font-semibold text-white hover:bg-[#002875] transition-colors shadow-xs"
        >
          Search
        </button>
      </form>

      {/* Table Container */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Vendor Details</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Trade License</th>
                <th className="py-3 px-4 text-center">Rating</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {page.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No vendor partners found matching your search.
                  </td>
                </tr>
              ) : (
                page.items.map((v) => (
                  <tr key={v.id} className="hover:bg-[#E6EEF9]/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{v.legalName}</div>
                      <div className="text-[11px] text-slate-500">
                        {v.displayNameI18n?.en || v.displayNameI18n?.bn || '—'}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400 mt-0.5">{v.id}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="font-semibold">{v.contactPhone}</div>
                      <div className="text-[11px] text-slate-400">{v.contactEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${vendorStatusBadge(v.status)}`}>
                        {v.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {v.tradeLicenseNo ? (
                        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-700 border border-slate-200">
                          📜 {v.tradeLicenseNo}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Unsubmitted</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {v.ratingAvg ? (
                        <div className="flex items-center justify-center gap-1 text-amber-600 font-bold">
                          <span>⭐</span> {v.ratingAvg.toFixed(1)}
                          <span className="text-[10px] text-slate-400 font-normal">({v.ratingCount})</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">No reviews</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-500">
                      {new Date(v.createdAt).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/vendors/${v.id}`}
                          className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-[#003496] hover:text-white transition-colors"
                        >
                          Profile
                        </Link>
                        <Link
                          href={`/vendors/${v.id}/branches`}
                          className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-[#003496] hover:text-white transition-colors"
                        >
                          Branches
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {nextHref && (
          <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-slate-500">Showing up to 25 vendors per page</span>
            <Link
              href={nextHref}
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
