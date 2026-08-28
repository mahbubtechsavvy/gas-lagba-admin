import Link from 'next/link';
import { api, pick, type Page } from '@/lib/api';
import { can, requireAdmin } from '@/lib/auth';
import { SuspendButton } from './suspend-button';

export const metadata = { title: 'Admin Users · Gas Lagba Admin' };

export interface AdminUserRow {
  id: string;
  kind: 'CUSTOMER' | 'VENDOR_USER' | 'ADMIN';
  email: string;
  fullName: string;
  phone: string | null;
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  locale: string;
  createdAt: string;
  lastSeenAt: string | null;
}

export default async function UsersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const me = await requireAdmin();
  const params = await searchParams;
  const query = pick(params, ['q', 'kind', 'status', 'cursor']);
  let page: Page<AdminUserRow> = { items: [], nextCursor: null };

  try {
    page = await api<Page<AdminUserRow>>('/admin/users', { query: { ...query, limit: 25 } });
  } catch {
    // Fallback
  }

  const canSuspend = can(me, 'users.suspend');
  const nextHref = page.nextCursor
    ? `/users?${new URLSearchParams({ ...Object.fromEntries(Object.entries(query).filter((e): e is [string, string] => Boolean(e[1]))), cursor: page.nextCursor }).toString()}`
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Accounts & Identities</h1>
        <p className="text-xs text-slate-500 mt-0.5">Platform identity store across all customer, vendor, and platform administrator accounts.</p>
      </div>

      <form className="flex flex-wrap items-center gap-2.5 text-xs" action="/users">
        <input
          name="q"
          placeholder="Search email, name, phone or ID..."
          defaultValue={query.q ?? ''}
          className="w-72 rounded-xl border border-slate-200 bg-white px-3.5 py-2 font-medium text-slate-800 placeholder-slate-400 focus:border-[#FF6600] focus:outline-none focus:ring-2 focus:ring-[#FF6600]/20 shadow-2xs"
        />
        <select
          name="kind"
          defaultValue={query.kind ?? ''}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700 focus:border-[#FF6600] focus:outline-none shadow-2xs"
        >
          <option value="">Any Account Kind</option>
          <option value="CUSTOMER">Customer</option>
          <option value="VENDOR_USER">Vendor User</option>
          <option value="ADMIN">Platform Admin</option>
        </select>
        <select
          name="status"
          defaultValue={query.status ?? ''}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700 focus:border-[#FF6600] focus:outline-none shadow-2xs"
        >
          <option value="">Any Status</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
        <button type="submit" className="rounded-xl bg-[#FF6600] px-4 py-2 font-bold text-white shadow-2xs hover:bg-[#EA580C] transition-colors cursor-pointer">
          Search
        </button>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">Account Type</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Last Active</th>
                {canSuspend ? <th className="py-3 px-4 text-right">Actions</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {page.items.map((u) => (
                <tr key={u.id} className="hover:bg-[#FFF7ED]/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{u.fullName || <span className="text-slate-400 italic">(no name)</span>}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {u.email}
                      {u.phone ? ` · ${u.phone}` : ''}
                    </div>
                    <div className="font-mono text-[10px] text-slate-400 mt-0.5">{u.id}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 font-bold text-[10px] text-slate-700">{u.kind}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                        u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[11px] text-slate-500">
                    {u.lastSeenAt ? new Date(u.lastSeenAt).toLocaleString('en-GB', { timeZone: 'Asia/Dhaka', dateStyle: 'short', timeStyle: 'short' }) : '—'}
                  </td>
                  {canSuspend ? (
                    <td className="py-3.5 px-4 text-right">
                      {u.id !== me.id && u.status !== 'DELETED' ? <SuspendButton userId={u.id} suspended={u.status === 'SUSPENDED'} /> : null}
                    </td>
                  ) : null}
                </tr>
              ))}
              {page.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No users match query.
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
