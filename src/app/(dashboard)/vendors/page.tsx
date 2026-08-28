import Link from 'next/link';
import { api, pick, type Page } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';

export const metadata = { title: 'Vendors · Gas Lagba Admin' };

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

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const query = pick(params, ['q', 'status', 'cursor']);
  const page = await api<Page<AdminVendorRow>>('/admin/vendors', { query: { ...query, limit: 25 } });

  const nextHref = page.nextCursor
    ? `/vendors?${new URLSearchParams({
        ...Object.fromEntries(Object.entries(query).filter((e): e is [string, string] => Boolean(e[1]))),
        cursor: page.nextCursor,
      }).toString()}`
    : null;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Vendors</h1>
      </div>

      <form className="mt-4 flex flex-wrap gap-2 text-sm" action="/vendors">
        <input
          name="q"
          placeholder="Legal name, phone, email or ID"
          defaultValue={query.q ?? ''}
          className="w-72 rounded-md border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-950"
        />
        <select
          name="status"
          defaultValue={query.status ?? ''}
          className="rounded-md border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="">All statuses</option>
          <option value="PENDING_APPROVAL">Pending approval</option>
          <option value="APPROVED">Approved</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <button type="submit" className="rounded-md bg-zinc-900 px-3 py-1 text-white dark:bg-zinc-50 dark:text-zinc-900">
          Search
        </button>
      </form>

      <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-950">
            <tr>
              <th className="px-3 py-2">Vendor</th>
              <th className="px-3 py-2">Contact</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Trade License</th>
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {page.items.map((v) => (
              <tr key={v.id} className="border-t border-zinc-100 dark:border-zinc-800">
                <td className="px-3 py-2">
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">{v.legalName}</div>
                  <div className="text-xs text-zinc-500">{v.displayNameI18n?.en || v.displayNameI18n?.bn}</div>
                  <div className="font-mono text-[11px] text-zinc-400">{v.id}</div>
                </td>
                <td className="px-3 py-2 text-xs">
                  <div>{v.contactPhone}</div>
                  <div className="text-zinc-500">{v.contactEmail}</div>
                </td>
                <td className="px-3 py-2 text-xs">
                  <span
                    className={`inline-block rounded px-2 py-0.5 font-medium ${
                      v.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : v.status === 'PENDING_APPROVAL'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                          : v.status === 'SUSPENDED'
                            ? 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400'
                            : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                    }`}
                  >
                    {v.status}
                  </span>
                  {v.statusReason ? <div className="mt-0.5 max-w-xs truncate text-[11px] text-zinc-400">{v.statusReason}</div> : null}
                </td>
                <td className="px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400">{v.tradeLicenseNo || '—'}</td>
                <td className="px-3 py-2 text-xs text-zinc-500">
                  {new Date(v.createdAt).toLocaleDateString('en-GB', { timeZone: 'Asia/Dhaka' })}
                </td>
                <td className="px-3 py-2 text-xs">
                  <Link
                    href={`/vendors/${v.id}`}
                    className="font-medium text-zinc-900 underline hover:text-zinc-600 dark:text-zinc-100"
                  >
                    View details →
                  </Link>
                </td>
              </tr>
            ))}
            {page.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-zinc-500">
                  No vendors match your search.
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
