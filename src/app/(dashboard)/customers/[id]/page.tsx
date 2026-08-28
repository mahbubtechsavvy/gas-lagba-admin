import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';

export const metadata = { title: 'Customer Details · Gas Lagba Admin' };

interface AddressItem {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2: string | null;
  area: string;
  thana: string | null;
  district: string;
  postcode: string | null;
  latitude: number | null;
  longitude: number | null;
  instructions: string | null;
  isDefault: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CustomerDetail {
  id: string;
  userId: string;
  marketingOptIn: boolean;
  firstOrderAt: string | null;
  defaultAddressId: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    locale: string;
    status: string;
    lastSeenAt: string | null;
    createdAt: string;
  };
  defaultAddress: AddressItem | null;
  addresses: AddressItem[];
  stats: {
    orderCount: number;
  };
}

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();

  const { id } = await params;
  let customer: CustomerDetail;
  try {
    customer = await api<CustomerDetail>(`/admin/customers/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      notFound();
    }
    throw e;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/customers" className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
          ← Back to Customers
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{customer.user.fullName || '(No name set)'}</h1>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                customer.user.status === 'ACTIVE'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
              }`}
            >
              {customer.user.status}
            </span>
          </div>
          <div className="font-mono text-xs text-zinc-400">{customer.id}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Customer Profile Card */}
        <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Account Information</h2>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
            <div>
              <dt className="text-zinc-500">Email Address</dt>
              <dd className="mt-0.5 font-medium text-zinc-900 dark:text-zinc-100">{customer.user.email}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Phone</dt>
              <dd className="mt-0.5 font-medium text-zinc-900 dark:text-zinc-100">{customer.user.phone || '—'}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">User Identity ID</dt>
              <dd className="mt-0.5 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">{customer.userId}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Preferred Locale</dt>
              <dd className="mt-0.5 uppercase font-medium text-zinc-900 dark:text-zinc-100">{customer.user.locale}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Marketing Opt-In</dt>
              <dd className="mt-0.5 font-medium">
                {customer.marketingOptIn ? <span className="text-emerald-600">Subscribed</span> : <span className="text-zinc-400">Not subscribed</span>}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">First Order Date</dt>
              <dd className="mt-0.5 text-zinc-700 dark:text-zinc-300">
                {customer.firstOrderAt ? new Date(customer.firstOrderAt).toLocaleDateString('en-GB') : 'No orders yet'}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Registered On</dt>
              <dd className="mt-0.5 text-zinc-700 dark:text-zinc-300">{new Date(customer.createdAt).toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' })}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Last Seen</dt>
              <dd className="mt-0.5 text-zinc-700 dark:text-zinc-300">
                {customer.user.lastSeenAt ? new Date(customer.user.lastSeenAt).toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' }) : '—'}
              </dd>
            </div>
          </dl>
        </div>

        {/* Default Delivery Address Card */}
        <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Primary Delivery Address</h2>
          {customer.defaultAddress ? (
            <div className="mt-4 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center rounded bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                  {customer.defaultAddress.label}
                </span>
                <span className="font-mono text-[11px] text-zinc-400">{customer.defaultAddress.id}</span>
              </div>
              <div className="font-medium text-zinc-900 dark:text-zinc-100">
                {customer.defaultAddress.recipientName} ({customer.defaultAddress.phone})
              </div>
              <div className="text-zinc-600 dark:text-zinc-400">
                {customer.defaultAddress.line1}
                {customer.defaultAddress.line2 ? `, ${customer.defaultAddress.line2}` : ''}
              </div>
              <div className="text-zinc-600 dark:text-zinc-400">
                {customer.defaultAddress.area}
                {customer.defaultAddress.thana ? `, ${customer.defaultAddress.thana}` : ''}
                {`, ${customer.defaultAddress.district}`}
                {customer.defaultAddress.postcode ? ` - ${customer.defaultAddress.postcode}` : ''}
              </div>
              {customer.defaultAddress.latitude && customer.defaultAddress.longitude ? (
                <div className="font-mono text-[11px] text-zinc-500">
                  Coordinates: {customer.defaultAddress.latitude.toFixed(6)}, {customer.defaultAddress.longitude.toFixed(6)}
                </div>
              ) : null}
              {customer.defaultAddress.instructions ? (
                <div className="rounded bg-amber-50 p-2 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                  <span className="font-semibold">Note:</span> {customer.defaultAddress.instructions}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-8 text-center text-xs text-zinc-400">No default delivery address set</div>
          )}
        </div>
      </div>

      {/* Address Book Table */}
      <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Saved Address Book ({customer.addresses.length})</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
              <tr>
                <th className="pb-2">Label / Status</th>
                <th className="pb-2">Recipient</th>
                <th className="pb-2">Address</th>
                <th className="pb-2">Area & District</th>
                <th className="pb-2">Coordinates</th>
                <th className="pb-2">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {customer.addresses.map((a) => (
                <tr key={a.id} className={a.deletedAt ? 'opacity-50' : ''}>
                  <td className="py-2.5">
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">{a.label}</div>
                    <div className="flex gap-1 mt-0.5">
                      {a.isDefault ? (
                        <span className="inline-block rounded bg-blue-50 px-1.5 py-0.2 text-[10px] font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          Default
                        </span>
                      ) : null}
                      {a.deletedAt ? (
                        <span className="inline-block rounded bg-zinc-100 px-1.5 py-0.2 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                          Deleted
                        </span>
                      ) : (
                        <span className="inline-block rounded bg-emerald-50 px-1.5 py-0.2 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          Active
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5">
                    <div className="text-zinc-900 dark:text-zinc-100">{a.recipientName}</div>
                    <div className="text-zinc-500">{a.phone}</div>
                  </td>
                  <td className="py-2.5 text-zinc-600 dark:text-zinc-400">
                    <div>{a.line1}</div>
                    {a.line2 ? <div className="text-[11px] text-zinc-500">{a.line2}</div> : null}
                  </td>
                  <td className="py-2.5 text-zinc-600 dark:text-zinc-400">
                    <div>
                      {a.area}
                      {a.thana ? `, ${a.thana}` : ''}
                    </div>
                    <div className="text-zinc-500">{a.district}</div>
                  </td>
                  <td className="py-2.5 font-mono text-[11px] text-zinc-500">
                    {a.latitude && a.longitude ? `${a.latitude.toFixed(4)}, ${a.longitude.toFixed(4)}` : '—'}
                  </td>
                  <td className="py-2.5 text-zinc-500">
                    {new Date(a.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
              {customer.addresses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-zinc-400">
                    No addresses on file.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
