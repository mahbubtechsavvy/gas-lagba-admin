import Link from 'next/link';
import { api, pick, type Page } from '@/lib/api';
import { can, requireAdmin } from '@/lib/auth';
import { localized, type CategoryRow } from '../types';
import { CategoryRowForm, NewCategoryForm } from './category-editor';

export const metadata = { title: 'Categories · Gas Lagba Admin' };

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const me = await requireAdmin();
  const params = await searchParams;
  const query = pick(params, ['q', 'isActive', 'cursor']);
  const page = await api<Page<CategoryRow>>('/admin/categories', { query: { ...query, limit: 50 } });
  const canEdit = can(me, 'catalogue.moderate');

  const nextHref = page.nextCursor
    ? `/catalogue/categories?${new URLSearchParams({
        ...Object.fromEntries(Object.entries(query).filter((e): e is [string, string] => Boolean(e[1]))),
        cursor: page.nextCursor,
      }).toString()}`
    : null;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Categories</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Admin-managed catalogue tree. Every category carries both Bengali and English names (BR-040, BR-280). Retire a category by
          deactivating it — categories are never deleted.
        </p>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <form className="flex flex-wrap gap-2 text-sm" action="/catalogue/categories">
          <input
            name="q"
            placeholder="Slug or category ID"
            defaultValue={query.q ?? ''}
            className="w-64 rounded-md border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-950"
          />
          <select
            name="isActive"
            defaultValue={query.isActive ?? ''}
            className="rounded-md border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-950"
          >
            <option value="">All</option>
            <option value="true">Active only</option>
            <option value="false">Inactive only</option>
          </select>
          <button type="submit" className="rounded-md bg-zinc-900 px-3 py-1 text-white dark:bg-zinc-50 dark:text-zinc-900">
            Search
          </button>
        </form>
        {canEdit ? <NewCategoryForm parents={page.items.filter((c) => c.parentId === null)} /> : null}
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-950">
            <tr>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Parent</th>
              <th className="px-3 py-2">State</th>
              <th className="px-3 py-2">Edit</th>
            </tr>
          </thead>
          <tbody>
            {page.items.map((c) => (
              <tr key={c.id} className="border-t border-zinc-100 align-top dark:border-zinc-800">
                <td className="px-3 py-2">
                  <div className="font-medium">{localized(c.nameI18n)}</div>
                  <div className="text-xs text-zinc-500">{c.nameI18n.bn}</div>
                  <div className="font-mono text-[11px] text-zinc-400">
                    {c.slug} · {c.id}
                  </div>
                </td>
                <td className="px-3 py-2 font-mono text-[11px] text-zinc-500">{c.parentId ?? '—'}</td>
                <td className="px-3 py-2 text-xs">
                  <span
                    className={`inline-block rounded px-2 py-0.5 font-medium ${
                      c.isActive
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    {c.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                  <div className="mt-0.5 text-[11px] text-zinc-400">sort {c.sortOrder}</div>
                </td>
                <td className="px-3 py-2">
                  <CategoryRowForm category={c} canEdit={canEdit} />
                </td>
              </tr>
            ))}
            {page.items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-zinc-500">
                  No categories yet.
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
