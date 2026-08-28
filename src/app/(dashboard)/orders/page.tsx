import Link from 'next/link';
import { api, pick, type Page } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';

export const metadata = { title: 'Orders & Dispatch · Gas Lagba Admin' };

export interface AdminOrderRow {
  id: string;
  orderNumber: string;
  checkoutId: string;
  customer: {
    id: string;
    fullName: string;
    phone: string | null;
    email: string;
  };
  vendor: {
    id: string;
    name: string;
  };
  branch: {
    id: string;
    name: string;
  };
  status: string;
  paymentMethod: string;
  totalPaisa: number;
  currency: string;
  itemCount: number;
  hasActiveEscalation: boolean;
  placedAt: string;
  acknowledgedAt: string | null;
  deliveredAt: string | null;
}

function statusBadgeClass(status: string) {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'ACCEPTED':
    case 'PREPARING':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'READY':
    case 'OUT_FOR_DELIVERY':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'DELIVERED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'CANCELLED':
    case 'REJECTED':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export default async function OrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();

  const params = await searchParams;
  const query = pick(params, ['query', 'status', 'cursor']);
  let page: Page<AdminOrderRow> = { items: [], nextCursor: null };

  try {
    page = await api<Page<AdminOrderRow>>('/admin/orders', {
      query: { ...query, limit: 25 },
    });
  } catch {
    // Graceful fallback
  }

  const nextHref = page.nextCursor
    ? `/orders?${new URLSearchParams({
        ...Object.fromEntries(Object.entries(query).filter((e): e is [string, string] => Boolean(e[1]))),
        cursor: page.nextCursor,
      }).toString()}`
    : null;

  const activeStatus = query.status ?? '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Live Order Fulfillment</h1>
          <p className="text-xs text-slate-500 mt-0.5">Platform-wide order oversight, live tracking, and dispatch monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/orders/escalations"
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
          >
            <span>⚠️</span> Escalation Queue
          </Link>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { label: 'All Orders', value: '' },
          { label: 'Pending', value: 'PENDING' },
          { label: 'Preparing', value: 'PREPARING' },
          { label: 'Out for Delivery', value: 'OUT_FOR_DELIVERY' },
          { label: 'Delivered', value: 'DELIVERED' },
          { label: 'Cancelled', value: 'CANCELLED' },
        ].map((tab) => {
          const isActive = activeStatus === tab.value;
          return (
            <Link
              key={tab.value}
              href={`/orders${tab.value ? `?status=${tab.value}` : ''}`}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                isActive ? 'bg-[#003496] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Search & Action Bar */}
      <form className="flex flex-wrap items-center gap-3" action="/orders">
        <div className="relative flex-1 min-w-[240px]">
          <input
            name="query"
            placeholder="Search by order ID (GL-...), customer name, phone..."
            defaultValue={query.query ?? ''}
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#003496] focus:outline-none focus:ring-1 focus:ring-[#003496]"
          />
        </div>
        <select
          name="status"
          defaultValue={query.status ?? ''}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-[#003496] focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="ACCEPTED">ACCEPTED</option>
          <option value="PREPARING">PREPARING</option>
          <option value="READY">READY</option>
          <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="CANCELLED">CANCELLED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
        <button type="submit" className="rounded-lg bg-[#003496] px-4 py-2 text-xs font-semibold text-white hover:bg-[#002875] transition-colors shadow-xs">
          Filter
        </button>
      </form>

      {/* Orders Table Container */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Order Number</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Vendor & Branch</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Placed At</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {page.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No orders match your search criteria.
                  </td>
                </tr>
              ) : (
                page.items.map((o) => (
                  <tr key={o.id} className="hover:bg-[#E6EEF9]/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/orders/${o.id}`} className="font-mono font-bold text-slate-900 hover:text-[#003496]">
                          {o.orderNumber}
                        </Link>
                        {o.hasActiveEscalation && (
                          <span className="inline-flex rounded-md bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-700 border border-red-200">
                            ESCALATED
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {o.itemCount} {o.itemCount === 1 ? 'cylinder' : 'cylinders'} · {o.paymentMethod}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-800">
                      <div className="font-semibold">{o.customer.fullName}</div>
                      <div className="text-[11px] text-slate-400">{o.customer.phone || o.customer.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="font-semibold">{o.vendor.name}</div>
                      <div className="text-[11px] text-slate-400">{o.branch.name}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">
                      ৳{(o.totalPaisa / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${statusBadgeClass(o.status)}`}>{o.status}</span>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-500">
                      {new Date(o.placedAt).toLocaleString('en-GB', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/orders/${o.id}`}
                        className="inline-flex items-center rounded-md bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:bg-[#003496] hover:text-white transition-colors"
                      >
                        Inspect →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {nextHref && (
          <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-slate-500">Showing up to 25 records per page</span>
            <Link
              href={nextHref}
              className="inline-flex items-center rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
            >
              Next Page →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
