import Link from 'next/link';
import { api, pick, type Page } from '@/lib/api';
import { can, requireAdmin } from '@/lib/auth';
import { SuspendButton } from './suspend-button';

export const metadata = { title: 'Users · Gas Lagba Admin' };

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
  const page = await api<Page<AdminUserRow>>('/admin/users', { query: { ...query, limit: 25 } });
  const canSuspend = can(me, 'users.suspend');
  const nextHref = page.nextCursor
    ? `/users?${new URLSearchParams({ ...Object.fromEntries(Object.entries(query).filter((e): e is [string, string] => Boolean(e[1]))), cursor: page.nextCursor }).toString()}`
    : null;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Users</h1>
      <form className="mt-4 flex flex-wrap gap-2 text-sm" action="/users">
        <input
          name="q"
          placeholder="email, name, phone or id"
          defaultValue={query.q ?? ''}
          className="w-72 rounded-md border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-950"
        />
        <select name="kind" defaultValue={query.kind ?? ''} className="rounded-md border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-950">
          <option value="">Any kind</option>
          <option value="CUSTOMER">Customer</option>
          <option value="VENDOR_USER">Vendor user</option>
          <option value="ADMIN">Admin</option>
        </select>
        <select name="status" defaultValue={query.status ?? ''} className="rounded-md border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-950">
          <option value="">Any status</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
        <button type="submit" className="rounded-md bg-zinc-900 px-3 py-1 text-white dark:bg-zinc-50 dark:text-zinc-900">
          Search
        </button>
      </form>
      <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-950">
            <tr>
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">Kind</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Last seen</th>
              {canSuspend ? <th className="px-3 py-2">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {page.items.map((u) => (
              <tr key={u.id} className="border-t border-zinc-100 dark:border-zinc-800">
                <td className="px-3 py-2">
                  <div>{u.fullName || <span className="text-zinc-400">(no name)</span>}</div>
                  <div className="text-xs text-zinc-500">
                    {u.email}
                    {u.phone ? ` · ${u.phone}` : ''}
                  </div>
                  <div className="font-mono text-[11px] text-zinc-400">{u.id}</div>
                </td>
                <td className="px-3 py-2 text-xs">{u.kind}</td>
                <td className="px-3 py-2 text-xs">
                  <span className={u.status === 'ACTIVE' ? 'text-emerald-600' : 'text-red-600'}>{u.status}</span>
                </td>
                <td className="px-3 py-2 text-xs text-zinc-500">
                  {u.lastSeenAt ? new Date(u.lastSeenAt).toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' }) : '—'}
                </td>
                {canSuspend ? (
                  <td className="px-3 py-2">
                    {u.id !== me.id && u.status !== 'DELETED' ? <SuspendButton userId={u.id} suspended={u.status === 'SUSPENDED'} /> : null}
                  </td>
                ) : null}
              </tr>
            ))}
            {page.items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-zinc-500">
                  No users match.
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
