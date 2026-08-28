import Link from 'next/link';
import { api } from '@/lib/api';
import { can, requireAdmin } from '@/lib/auth';
import { ModerationControls } from './moderation-controls';

export interface VendorDetailResponse {
  id: string;
  legalName: string;
  displayNameI18n: Record<string, string>;
  descriptionI18n: Record<string, string> | null;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'SUSPENDED' | 'REJECTED';
  statusReason: string | null;
  contactEmail: string;
  contactPhone: string;
  tradeLicenseNo: string | null;
  logoKey: string | null;
  logoUrl: string | null;
  commissionBps: number | null;
  ratingAvg: number | null;
  ratingCount: number;
  approvedAt: string | null;
  approvedBy: string | null;
  createdAt: string;
  updatedAt: string;
  branches?: Array<{
    id: string;
    nameI18n: Record<string, string>;
    phone: string;
    addressLine: string;
    area: string;
    thana: string | null;
    district: string;
    isActive: boolean;
    isOpen: boolean;
  }>;
  documents?: Array<{
    id: string;
    kind: string;
    storageKey: string;
    mimeType: string;
    sizeBytes: number;
    uploadedBy: string;
    createdAt: string;
  }>;
  staff?: Array<{
    id: string;
    role: string;
    isActive: boolean;
    user: {
      id: string;
      email: string;
      fullName: string;
      phone: string | null;
    };
  }>;
}

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireAdmin();
  const { id } = await params;
  const vendor = await api<VendorDetailResponse>(`/admin/vendors/${id}`);

  const canApprove = can(me, 'vendors.approve');
  const canFinance = can(me, 'settings.update.finance');

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Link href="/vendors" className="hover:underline">
              ← Vendors
            </Link>
            <span>/</span>
            <span className="font-mono text-xs">{vendor.id}</span>
          </div>
          <h1 className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{vendor.legalName}</h1>
        </div>

        <ModerationControls vendorId={vendor.id} status={vendor.status} commissionBps={vendor.commissionBps} canApprove={canApprove} canFinance={canFinance} />
      </div>

      {/* Main stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs text-zinc-500">Status</div>
          <div className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{vendor.status}</div>
          {vendor.statusReason && <div className="mt-0.5 text-xs text-red-500">{vendor.statusReason}</div>}
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs text-zinc-500">Commission</div>
          <div className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {vendor.commissionBps !== null ? `${(vendor.commissionBps / 100).toFixed(2)}%` : 'Default (Platform)'}
          </div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs text-zinc-500">Rating</div>
          <div className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {vendor.ratingAvg ? `⭐ ${vendor.ratingAvg.toFixed(1)} (${vendor.ratingCount})` : 'No ratings'}
          </div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs text-zinc-500">Branches</div>
          <div className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{vendor.branches?.length ?? 0} active</div>
        </div>
      </div>

      {/* Vendor Profile Info */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Profile Details</h2>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
          <div>
            <dt className="text-xs text-zinc-500">Display Name (EN)</dt>
            <dd className="font-medium text-zinc-900 dark:text-zinc-100">{vendor.displayNameI18n?.en || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Display Name (BN)</dt>
            <dd className="font-medium text-zinc-900 dark:text-zinc-100">{vendor.displayNameI18n?.bn || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Contact Email</dt>
            <dd className="font-medium text-zinc-900 dark:text-zinc-100">{vendor.contactEmail}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Contact Phone</dt>
            <dd className="font-medium text-zinc-900 dark:text-zinc-100">{vendor.contactPhone}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Trade License No</dt>
            <dd className="font-medium text-zinc-900 dark:text-zinc-100">{vendor.tradeLicenseNo || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Registration Date</dt>
            <dd className="font-medium text-zinc-900 dark:text-zinc-100">{new Date(vendor.createdAt).toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' })}</dd>
          </div>
        </dl>
      </div>

      {/* Branches section */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Branches</h2>
          <Link href={`/vendors/${vendor.id}/branches`} className="text-xs font-medium text-zinc-900 underline dark:text-zinc-100">
            Manage branches →
          </Link>
        </div>

        <div className="mt-4 space-y-3">
          {vendor.branches?.map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-md border border-zinc-100 p-3 text-sm dark:border-zinc-800">
              <div>
                <div className="font-medium text-zinc-900 dark:text-zinc-100">{b.nameI18n?.en || b.nameI18n?.bn}</div>
                <div className="text-xs text-zinc-500">
                  {b.addressLine}, {b.area}, {b.district} · {b.phone}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${
                    b.isOpen ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  {b.isOpen ? 'OPEN' : 'CLOSED'}
                </span>
              </div>
            </div>
          ))}
          {(!vendor.branches || vendor.branches.length === 0) && <div className="py-4 text-center text-xs text-zinc-500">No branches found.</div>}
        </div>
      </div>

      {/* Staff section */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Staff Members</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-950">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {vendor.staff?.map((s) => (
                <tr key={s.id} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="px-3 py-2 font-medium">{s.user.fullName || '—'}</td>
                  <td className="px-3 py-2 text-xs text-zinc-500">{s.user.email}</td>
                  <td className="px-3 py-2 text-xs font-mono">{s.role}</td>
                  <td className="px-3 py-2 text-xs">
                    <span className={s.isActive ? 'text-emerald-600' : 'text-red-600'}>{s.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
