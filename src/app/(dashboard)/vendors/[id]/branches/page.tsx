import Link from 'next/link';
import { api } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import type { VendorDetailResponse } from '../page';

export default async function VendorBranchesAdminPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const vendor = await api<VendorDetailResponse>(`/admin/vendors/${id}`);

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/vendors" className="hover:underline">
            Vendors
          </Link>
          <span>/</span>
          <Link href={`/vendors/${vendor.id}`} className="hover:underline">
            {vendor.legalName}
          </Link>
          <span>/</span>
          <span>Branches</span>
        </div>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {vendor.legalName} · Branches ({vendor.branches?.length ?? 0})
        </h1>
      </div>

      <div className="space-y-4">
        {vendor.branches?.map((b) => (
          <div key={b.id} className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{b.nameI18n?.en || b.nameI18n?.bn}</h3>
                <p className="mt-1 text-xs text-zinc-500">
                  ID: <span className="font-mono">{b.id}</span> · Phone: {b.phone}
                </p>
                <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                  {b.addressLine}, {b.area}, {b.thana ? `${b.thana}, ` : ''}
                  {b.district}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded px-2.5 py-1 text-xs font-semibold ${
                    b.isOpen
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}
                >
                  {b.isOpen ? 'OPEN' : 'CLOSED'}
                </span>
                <span
                  className={`rounded px-2.5 py-1 text-xs font-semibold ${
                    b.isActive
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                      : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                  }`}
                >
                  {b.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
            </div>
          </div>
        ))}
        {(!vendor.branches || vendor.branches.length === 0) && (
          <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
            No branches found for this vendor.
          </div>
        )}
      </div>
    </div>
  );
}
