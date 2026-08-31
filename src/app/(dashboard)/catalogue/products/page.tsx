import Link from 'next/link';
import { api, pick, type Page } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { formatPaisa, localized, type CategoryRow, type ProductRow } from '../types';
import { CreateProductModal } from './create-product-modal';

export const metadata = { title: 'LPG Cylinders & Catalogue · Gas Lagba Admin' };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const params = await searchParams;
  const query = pick(params, ['q', 'approvalStatus', 'status', 'vendorId', 'cursor']);
  let page: Page<ProductRow> = { items: [], nextCursor: null };
  let categories: { id: string; name: string }[] = [];
  let vendors: { id: string; name: string }[] = [];

  try {
    const [prodRes, catRes, vendRes] = await Promise.allSettled([
      api<Page<ProductRow>>('/admin/products', { query: { ...query, limit: 25 } }),
      api<Page<CategoryRow> | CategoryRow[]>('/admin/categories'),
      api<Page<{ publicId: string; legalName: string; contactPhone?: string }>>('/admin/vendors', { query: { limit: 100 } }),
    ]);

    if (prodRes.status === 'fulfilled') page = prodRes.value;
    if (catRes.status === 'fulfilled') {
      const val = catRes.value as unknown;
      const raw = val as { items?: CategoryRow[] } | CategoryRow[];
      const list = Array.isArray(raw) ? raw : (raw?.items ?? []);
      categories = list.map((c) => ({
        id: c.id || 'cat_lpg_cylinders',
        name: localized(c.nameI18n) || 'LPG Cylinders',
      }));
    }
    if (categories.length === 0) {
      categories = [
        { id: 'cat_lpg_cylinders', name: 'LPG Cylinders' },
        { id: 'cat_regulators', name: 'Regulators & Safety' },
        { id: 'cat_accessories', name: 'Pipes & Accessories' },
        { id: 'cat_stoves', name: 'Gas Stoves & Burners' },
      ];
    }
    if (vendRes.status === 'fulfilled') {
      const vVal = vendRes.value as unknown;
      const vRaw = vVal as { items?: Array<{ publicId: string; legalName: string; contactPhone?: string; id?: string }> } | Array<{ publicId: string; legalName: string; contactPhone?: string; id?: string }>;
      const vList = Array.isArray(vRaw) ? vRaw : (vRaw?.items ?? []);
      vendors = vList.map((v) => ({
        id: v.publicId || v.id || '',
        name: v.legalName ? `${v.legalName}${v.contactPhone ? ` (${v.contactPhone})` : ''}` : (v.publicId || ''),
      })).filter((v) => Boolean(v.id));
    }
  } catch {
    // Fallback
  }

  const nextHref = page.nextCursor
    ? `/catalogue/products?${new URLSearchParams({
        ...Object.fromEntries(Object.entries(query).filter((e): e is [string, string] => Boolean(e[1]))),
        cursor: page.nextCursor,
      }).toString()}`
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">LPG Cylinder Products & Moderation</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin product verification queue and national cylinder catalogue. Only verified products with approved vendors go live (BR-041).
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <CreateProductModal categories={categories} vendors={vendors} />
          <Link
            href="/catalogue/products?approvalStatus=PENDING"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#FFF7ED] px-3.5 py-2 text-xs font-bold text-[#FF6600] border border-[#FFEDD5] hover:bg-[#FFEDD5] transition-colors shadow-2xs"
          >
            <span>⏳</span> Pending Moderation Queue
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <form className="flex flex-wrap items-center gap-2.5 text-xs" action="/catalogue/products">
        <input
          name="q"
          placeholder="Search name, brand, or product ID..."
          defaultValue={query.q ?? ''}
          className="w-64 rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-800 placeholder-slate-400 focus:border-[#FF6600] focus:outline-none focus:ring-2 focus:ring-[#FF6600]/20 shadow-2xs"
        />
        <input
          name="vendorId"
          placeholder="Filter by Vendor ID"
          defaultValue={query.vendorId ?? ''}
          className="w-44 rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-800 placeholder-slate-400 focus:border-[#FF6600] focus:outline-none shadow-2xs"
        />
        <select
          name="approvalStatus"
          defaultValue={query.approvalStatus ?? ''}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700 focus:border-[#FF6600] focus:outline-none shadow-2xs"
        >
          <option value="">All Approval States</option>
          <option value="PENDING">Pending Moderation</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <select
          name="status"
          defaultValue={query.status ?? ''}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700 focus:border-[#FF6600] focus:outline-none shadow-2xs"
        >
          <option value="">All Listing States</option>
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
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
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Distributor Vendor</th>
                <th className="py-3 px-4">Cylinder Variants</th>
                <th className="py-3 px-4 text-center">Approval Status</th>
                <th className="py-3 px-4 text-center">Catalog State</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {page.items.map((p) => (
                <tr key={p.id} className="hover:bg-[#FFF7ED]/30 transition-colors align-top">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{localized(p.nameI18n)}</div>
                    <div className="text-[11px] text-slate-500">{p.nameI18n.bn}</div>
                    <div className="font-mono text-[10px] text-slate-400 mt-0.5">{p.id}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    <div className="font-semibold">{p.vendorName ?? 'Platform Master'}</div>
                    <div className="font-mono text-[10px] text-slate-400">{p.vendorId}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      {p.variants.map((v) => (
                        <div key={v.id} className="text-[11px]">
                          <span className="font-semibold text-slate-800">{localized(v.nameI18n)}: </span>
                          <span className="font-mono text-slate-900 font-bold">{formatPaisa(v.pricePaisa)}</span>
                          {v.depositPaisa ? <span className="text-slate-500 text-[10px]"> (+{formatPaisa(v.depositPaisa)} deposit)</span> : null}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                        p.approvalStatus === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : p.approvalStatus === 'PENDING'
                            ? 'bg-[#FFF7ED] text-[#FF6600] border-[#FFEDD5]'
                            : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {p.approvalStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                        p.status === 'ACTIVE' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/catalogue/products/${p.id}`}
                      className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:bg-[#FF6600] hover:text-white transition-colors"
                    >
                      Moderate →
                    </Link>
                  </td>
                </tr>
              ))}
              {page.items.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No products found matching query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {nextHref && (
          <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-slate-500">Showing up to 25 products</span>
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
