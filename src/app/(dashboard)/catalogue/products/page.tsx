import Link from 'next/link';
import { api, pick, type Page } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { APPROVAL_BADGE, formatPaisa, localized, type ProductRow } from '../types';

export const metadata = { title: 'Products · Gas Lagba Admin' };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const query = pick(params, ['q', 'approvalStatus', 'status', 'vendorId', 'cursor']);
  const page = await api<Page<ProductRow>>('/admin/products', { query: { ...query, limit: 25 } });

  const nextHref = page.nextCursor
    ? `/catalogue/products?${new URLSearchParams({
        ...Object.fromEntries(Object.entries(query).filter((e): e is [string, string] => Boolean(e[1]))),
        cursor: page.nextCursor,
      }).toString()}`
    : null;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Products</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Moderation queue and full catalogue. A product reaches customers only once it is approved here and its vendor is approved
          (BR-041, BR-042).
        </p>
      </div>

      <form className="flex flex-wrap gap-2 text-sm" action="/catalogue/products">
        <input
          name="q"
          placeholder="Name, brand or product ID"
          defaultValue={query.q ?? ''}
          className="w-64 rounded-md border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-950"
        />
        <input
          name="vendorId"
          placeholder="Vendor ID"
          defaultValue={query.vendorId ?? ''}
          className="w-52 rounded-md border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-950"
        />
        <select
          name="approvalStatus"
          defaultValue={query.approvalStatus ?? ''}
          className="rounded-md border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="">All approval states</option>
          <option value="PENDING">Pending moderation</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <select
          name="status"
          defaultValue={query.status ?? ''}
          className="rounded-md border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="">All states</option>
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <button type="submit" className="rounded-md bg-zinc-900 px-3 py-1 text-white dark:bg-zinc-50 dark:text-zinc-900">
          Search
        </button>
        <Link href="/catalogue/products?approvalStatus=PENDING" className="self-center text-xs underline">
          Show moderation queue
        </Link>
      </form>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-950">
            <tr>
              <th className="px-3 py-2">Product</th>
              <th className="px-3 py-2">Vendor</th>
              <th className="px-3 py-2">Variants</th>
              <th className="px-3 py-2">Approval</th>
              <th className="px-3 py-2">State</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {page.items.map((p) => (
              <tr key={p.id} className="border-t border-zinc-100 align-top dark:border-zinc-800">
                <td className="px-3 py-2">
                  <div className="font-medium">{localized(p.nameI18n)}</div>
                  <div className="text-xs text-zinc-500">{p.nameI18n.bn}</div>
                  <div className="font-mono text-[11px] text-zinc-400">{p.id}</div>
                </td>
                <td className="px-3 py-2 text-xs">
                  <div>{p.vendorName ?? '—'}</div>
                  <div className="font-mono text-[11px] text-zinc-400">{p.vendorId}</div>
                </td>
                <td className="px-3 py-2 text-xs">
                  {p.variants.slice(0, 3).map((v) => (
                    <div key={v.id}>
                      {localized(v.nameI18n)} · {formatPaisa(v.effectivePricePaisa)}
                    </div>
                  ))}
                  {p.variants.length > 3 ? <div className="text-zinc-400">+{p.variants.length - 3} more</div> : null}
                </td>
                <td className="px-3 py-2 text-xs">
                  <span className={`inline-block rounded px-2 py-0.5 font-medium ${APPROVAL_BADGE[p.approvalStatus]}`}>
                    {p.approvalStatus}
                  </span>
                  {p.approvalNote ? <div className="mt-0.5 max-w-xs truncate text-[11px] text-zinc-400">{p.approvalNote}</div> : null}
                </td>
                <td className="px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400">{p.status}</td>
                <td className="px-3 py-2 text-xs">
                  <Link href={`/catalogue/products/${p.id}`} className="font-medium underline">
                    Review →
                  </Link>
                </td>
              </tr>
            ))}
            {page.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-zinc-500">
                  No products match this filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {nextHref ? (
        <Link href={nextHref} className="inline-block text-sm underline">
          Next page →
        </Link>
      ) : null}
    </div>
  );
}
