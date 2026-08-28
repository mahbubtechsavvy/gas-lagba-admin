import Link from 'next/link';
import { api, pick, type Page } from '@/lib/api';
import { can, requireAdmin } from '@/lib/auth';
import { localized, type CategoryRow } from '../types';
import { CategoryRowForm, NewCategoryForm } from './category-editor';

export const metadata = { title: 'LPG Categories · Gas Lagba Admin' };

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const me = await requireAdmin();
  const params = await searchParams;
  const query = pick(params, ['q', 'isActive', 'cursor']);
  let page: Page<CategoryRow> = { items: [], nextCursor: null };

  try {
    page = await api<Page<CategoryRow>>('/admin/categories', { query: { ...query, limit: 50 } });
  } catch {
    // Fallback
  }

  const canEdit = can(me, 'catalogue.moderate');

  const nextHref = page.nextCursor
    ? `/catalogue/categories?${new URLSearchParams({
        ...Object.fromEntries(Object.entries(query).filter((e): e is [string, string] => Boolean(e[1]))),
        cursor: page.nextCursor,
      }).toString()}`
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">LPG Catalogue Categories</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Admin-managed hierarchy for cylinder capacities and accessories. Bilingual English & Bengali naming (BR-040, BR-280).
        </p>
      </div>

      {/* Actions & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <form className="flex flex-wrap items-center gap-2 text-xs" action="/catalogue/categories">
          <input
            name="q"
            placeholder="Search slug or category ID..."
            defaultValue={query.q ?? ''}
            className="w-64 rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-800 placeholder-slate-400 focus:border-[#FF6600] focus:outline-none focus:ring-2 focus:ring-[#FF6600]/20 shadow-2xs"
          />
          <select
            name="isActive"
            defaultValue={query.isActive ?? ''}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700 focus:border-[#FF6600] focus:outline-none shadow-2xs"
          >
            <option value="">All Statuses</option>
            <option value="true">Active only</option>
            <option value="false">Inactive only</option>
          </select>
          <button type="submit" className="rounded-xl bg-[#FF6600] px-4 py-2 font-bold text-white shadow-2xs hover:bg-[#EA580C] transition-colors">
            Search
          </button>
        </form>
        {canEdit && <NewCategoryForm parents={page.items.filter((c) => c.parentId === null)} />}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Category Naming</th>
                <th className="py-3 px-4">Parent Tree</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Edit Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {page.items.map((c) => (
                <tr key={c.id} className="hover:bg-[#FFF7ED]/30 transition-colors align-top">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{localized(c.nameI18n)}</div>
                    <div className="text-[11px] text-slate-500">{c.nameI18n.bn}</div>
                    <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                      {c.slug} · {c.id}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{c.parentId ?? '—'}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                        c.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {c.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                    <div className="mt-1 text-[10px] text-slate-400">Sort weight: {c.sortOrder}</div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <CategoryRowForm category={c} canEdit={canEdit} />
                  </td>
                </tr>
              ))}
              {page.items.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {nextHref && (
          <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-slate-500">Showing up to 50 categories</span>
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
