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

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const query = pick(params, ['q', 'cursor']);
  const page = await api<Page<AdminCustomerListItem>>('/admin/customers', {
    query: { ...query, limit: 25 },
  });

  const nextHref = page.nextCursor
    ? `/customers?${new URLSearchParams({
        ...Object.fromEntries(Object.entries(query).filter((e): e is [string, string] => Boolean(e[1]))),
        cursor: page.nextCursor,
      }).toString()}`
    : null;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Customers</h1>
          <p className="text-sm text-zinc-500">Manage customer accounts and view delivery address profiles</p>
        </div>
      </div>

      <form className="mt-4 flex flex-wrap gap-2 text-sm" action="/customers">
        <input
          name="q"
          placeholder="Search by name, email, phone or ID"
          defaultValue={query.q ?? ''}
          className="w-80 rounded-md border border-zinc-300 px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-950"
        />
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900"
        >
          Search
        </button>
      </form>

      <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-950">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Default Location</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Marketing</th>
              <th className="px-4 py-3">Registered</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {page.items.map((c) => (
              <tr key={c.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                <td className="px-4 py-3">
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">
                    {c.fullName || <span className="text-zinc-400 italic">(no name)</span>}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {c.email}
                    {c.phone ? ` · ${c.phone}` : ''}
                  </div>
                  <div className="font-mono text-[11px] text-zinc-400">{c.id}</div>
                </td>
                <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400">
                  {c.defaultAddress ? `${c.defaultAddress.area}, ${c.defaultAddress.district}` : '—'}
                </td>
                <td className="px-4 py-3 text-xs">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 font-medium ${
                      c.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-zinc-500">
                  {c.marketingOptIn ? (
                    <span className="text-emerald-600">Opted In</span>
                  ) : (
                    <span className="text-zinc-400">Opted Out</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-zinc-500">
                  {new Date(c.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/customers/${c.id}`}
                    className="inline-flex rounded border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
            {page.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  No customers match the search criteria.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {nextHref ? (
        <div className="mt-4">
          <Link
            href={nextHref}
            className="inline-flex items-center text-sm font-medium text-zinc-700 hover:underline dark:text-zinc-300"
          >
            Next page →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
