import Link from 'next/link';
import { api } from '@/lib/api';
import { can, requireAdmin } from '@/lib/auth';
import { APPROVAL_BADGE, formatPaisa, localized, type ProductRow } from '../../types';
import { ProductModerationControls } from './moderation-controls';

export const metadata = { title: 'Product review · Gas Lagba Admin' };

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireAdmin();
  const { id } = await params;
  const product = await api<ProductRow>(`/admin/products/${id}`);
  const canModerate = can(me, 'catalogue.moderate');

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/catalogue/products" className="hover:underline">
            Products
          </Link>
          <span>/</span>
          <span className="font-mono text-xs">{product.id}</span>
        </div>
        <h1 className="mt-1 text-2xl font-semibold">{localized(product.nameI18n)}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
          <span className={`rounded px-2 py-0.5 text-xs font-medium ${APPROVAL_BADGE[product.approvalStatus]}`}>
            {product.approvalStatus}
          </span>
          <span className="text-xs">state {product.status}</span>
          <span className="text-xs">unit {product.unit}</span>
          <Link href={`/vendors/${product.vendorId}`} className="text-xs underline">
            {product.vendorName ?? product.vendorId}
          </Link>
        </div>
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold">Moderation</h2>
        <p className="mt-1 mb-3 text-xs text-zinc-500">
          Approving publishes the product to customers. Name, description, brand, category and image edits send it back here
          automatically; price edits do not (BR-041 / OD-15).
        </p>
        <ProductModerationControls productId={product.id} approvalStatus={product.approvalStatus} canModerate={canModerate} />
        {product.approvalNote ? <div className="mt-3 text-xs text-zinc-500">Last note: {product.approvalNote}</div> : null}
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold">Catalogue text</h2>
        <dl className="mt-2 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-zinc-500">Name (English)</dt>
            <dd>{product.nameI18n.en ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Name (Bengali)</dt>
            <dd>{product.nameI18n.bn ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Description (English)</dt>
            <dd>{product.descriptionI18n?.en ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Description (Bengali)</dt>
            <dd>{product.descriptionI18n?.bn ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Brand</dt>
            <dd>{product.brand ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Category</dt>
            <dd className="font-mono text-xs">{product.categoryId}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="px-4 pt-4 text-sm font-semibold">Variants</h2>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-950">
              <tr>
                <th className="px-3 py-2">Variant</th>
                <th className="px-3 py-2">Supply</th>
                <th className="px-3 py-2">Size</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Effective</th>
                <th className="px-3 py-2">Deposit</th>
                <th className="px-3 py-2">Active</th>
              </tr>
            </thead>
            <tbody>
              {product.variants.map((v) => (
                <tr key={v.id} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="px-3 py-2">
                    <div>{localized(v.nameI18n)}</div>
                    <div className="font-mono text-[11px] text-zinc-400">{v.sku ?? v.id}</div>
                  </td>
                  <td className="px-3 py-2 text-xs">{v.supplyType}</td>
                  <td className="px-3 py-2 text-xs">{v.cylinderSizeKg !== null ? `${v.cylinderSizeKg} kg` : '—'}</td>
                  <td className="px-3 py-2 text-xs">
                    {formatPaisa(v.pricePaisa)}
                    {v.discountPricePaisa !== null ? (
                      <span className="ml-1 text-zinc-400 line-through">{formatPaisa(v.discountPricePaisa)}</span>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 text-xs font-medium">{formatPaisa(v.effectivePricePaisa)}</td>
                  <td className="px-3 py-2 text-xs">{v.depositPaisa > 0 ? formatPaisa(v.depositPaisa) : '—'}</td>
                  <td className="px-3 py-2 text-xs">{v.isActive ? 'yes' : 'no'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold">Images</h2>
        {product.images.length === 0 ? (
          <p className="mt-2 text-xs text-zinc-500">No images uploaded yet.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-xs">
            {product.images.map((img) => (
              <li key={img.id} className="flex flex-wrap items-center gap-2">
                <a href={img.url} target="_blank" rel="noreferrer" className="underline">
                  {img.storageKey}
                </a>
                <span className="text-zinc-400">{localized(img.altI18n)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="text-xs text-zinc-500">
        Created {new Date(product.createdAt).toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' })} · updated{' '}
        {new Date(product.updatedAt).toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' })}
        {product.approvedAt
          ? ` · approved ${new Date(product.approvedAt).toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' })} by ${product.approvedBy ?? 'unknown'}`
          : null}
      </div>
    </div>
  );
}
