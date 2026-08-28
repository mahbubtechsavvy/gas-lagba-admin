import Link from 'next/link';
import { api, pick, type Page } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';

export const metadata = { title: 'Customers · Gas Lagba Admin' };

export interface AdminCustomerListItem {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string | null;
  status: string;
  marketingOptIn: boolean;
  firstOrderAt: string | null;
  createdAt: string;
  defaultAddress?: {
    area: string;
    district: string;
  } | null;
}

export default async function CustomersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();

  const params = await searchParams;
  const query = pick(params, ['q', 'cursor']);
  let page: Page<AdminCustomerListItem> = { items: [], nextCursor: null };

  try {
    page = await api<Page<AdminCustomerListItem>>('/admin/customers', {
      query: { ...query, limit: 25 },
    });
  } catch {
    // Fallback
  }

  const nextHref = page.nextCursor
    ? `/customers?${new URLSearchParams({
        ...Object.fromEntries(Object.entries(query).filter((e): e is [string, string] => Boolean(e[1]))),
        cursor: page.nextCursor,
      }).toString()}`
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Customer User Registry</h1>
        <p className="text-xs text-slate-500 mt-0.5">Manage customer accounts, verified phone/email records, and saved delivery addresses.</p>
      </div>

      {/* Search Bar */}
      <form className="flex flex-wrap items-center gap-2.5 text-xs" action="/customers">
        <input
          name="q"
          placeholder="Search by customer name, email, phone, or customer ID..."
          defaultValue={query.q ?? ''}
          className="w-80 rounded-xl border border-slate-200 bg-white px-3.5 py-2 font-medium text-slate-800 placeholder-slate-400 focus:border-[#FF6600] focus:outline-none focus:ring-2 focus:ring-[#FF6600]/20 shadow-2xs"
        />
        <button type="submit" className="rounded-xl bg-[#FF6600] px-4 py-2 font-bold text-white shadow-2xs hover:bg-[#EA580C] transition-colors cursor-pointer">
          Search
        </button>
      </form>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Primary Delivery Area</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Marketing</th>
                <th className="py-3 px-4">Member Since</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {page.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No customers found matching query.
                  </td>
                </tr>
              ) : (
                page.items.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FFF7ED]/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{c.fullName || <span className="text-slate-400 italic">(Unnamed User)</span>}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {c.email}
                        {c.phone ? ` · ${c.phone}` : ''}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400 mt-0.5">{c.id}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {c.defaultAddress ? (
                        <span className="font-medium">
                          📍 {c.defaultAddress.area}, {c.defaultAddress.district}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">No saved address</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                          c.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {c.marketingOptIn ? (
                        <span className="inline-flex rounded bg-[#FFF7ED] px-2 py-0.5 text-[10px] font-bold text-[#FF6600] border border-[#FFEDD5]">
                          OPTED IN
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Opted out</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-500">{new Date(c.createdAt).toLocaleDateString('en-GB', { dateStyle: 'medium' })}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/customers/${c.id}`}
                        className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:bg-[#FF6600] hover:text-white transition-colors"
                      >
                        Profile →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {nextHref && (
          <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-slate-500">Showing up to 25 customers</span>
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
