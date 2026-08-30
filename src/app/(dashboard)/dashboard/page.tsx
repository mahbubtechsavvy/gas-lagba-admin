import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { api, type Page } from '@/lib/api';
import { AdminOrderRow } from '../orders/page';
import { AdminPaymentRow } from '../subscriptions/page';

export const metadata = { title: 'Operations Dashboard · Gas Lagba Admin' };

interface AdminVendorSummary {
  id: string;
  legalName: string;
  status: string;
  branches?: Array<{ id: string; isOpen: boolean }>;
}

export default async function DashboardPage() {
  await requireAdmin();

  let activeOrders: AdminOrderRow[] = [];
  let escalationCount = 0;
  let pendingPayments: AdminPaymentRow[] = [];
  let vendors: AdminVendorSummary[] = [];

  try {
    const [ordersRes, paymentsRes, vendorsRes] = await Promise.all([
      api<Page<AdminOrderRow>>('/admin/orders', { query: { limit: 50 } }).catch(() => ({ items: [], nextCursor: null })),
      api<Page<AdminPaymentRow>>('/admin/subscriptions/payments', { query: { status: 'SUBMITTED', limit: 20 } }).catch(() => ({ items: [], nextCursor: null })),
      api<Page<AdminVendorSummary>>('/admin/vendors', { query: { limit: 50 } }).catch(() => ({ items: [], nextCursor: null })),
    ]);

    activeOrders = ordersRes.items || [];
    pendingPayments = paymentsRes.items || [];
    vendors = vendorsRes.items || [];
    escalationCount = activeOrders.filter((o) => o.hasActiveEscalation || o.status === 'PENDING').length;
  } catch {
    // Fallback
  }

  // Calculate real metrics from actual database rows
  const deliveredOrders = activeOrders.filter((o) => o.status === 'DELIVERED');
  const totalGmvPaisa = activeOrders.reduce((sum, o) => sum + (o.status !== 'CANCELLED' && o.status !== 'REJECTED' ? o.totalPaisa : 0), 0);
  const activeBranchesCount = vendors.reduce((sum, v) => sum + (v.branches?.filter((b) => b.isOpen)?.length || (v.status === 'APPROVED' ? 1 : 0)), 0);
  const totalBranchesCount = vendors.reduce((sum, v) => sum + (v.branches?.length || 1), 0);

  const pendingOrdersCount = activeOrders.filter((o) => o.status === 'PENDING' || o.status === 'ACCEPTED' || o.status === 'PREPARING').length;
  const inTransitCount = activeOrders.filter((o) => o.status === 'READY' || o.status === 'OUT_FOR_DELIVERY').length;

  return (
    <div className="space-y-8">
      {/* Page Title & Environment Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Operations Control Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time marketplace monitoring, partner subscription verification, and order dispatch queues.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-slate-700 border border-slate-200 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Marketplace Stream
          </span>
          <Link
            href="/orders"
            className="inline-flex items-center justify-center rounded-xl bg-[#FF6600] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#EA580C] transition-colors"
          >
            Open Dispatch Board →
          </Link>
        </div>
      </div>

      {/* Pending Subscription Payments Alert Banner */}
      {pendingPayments.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-slate-900 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FF6600] text-white shadow-xs">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                {pendingPayments.length} Partner Subscription Payment(s) Awaiting Review
              </h4>
              <p className="text-xs text-slate-600">
                Vendors have submitted manual bKash/Nagad TrxID payments for verification.
              </p>
            </div>
          </div>
          <Link
            href="/subscriptions"
            className="inline-flex items-center justify-center rounded-xl bg-[#FF6600] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#EA580C] transition-colors shrink-0"
          >
            Verify Payments ({pendingPayments.length}) →
          </Link>
        </div>
      )}

      {/* Escalation Alert Banner */}
      {escalationCount > 0 && (
        <div className="rounded-2xl border border-[#FFEDD5] bg-[#FFF7ED] p-4 text-slate-900 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FF6600] text-white shadow-xs">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">{escalationCount} Order(s) Require Dispatch Attention</h4>
              <p className="text-xs text-slate-600">Unacknowledged or pending orders exceeding standard SLA response windows.</p>
            </div>
          </div>
          <Link
            href="/orders/escalations"
            className="inline-flex items-center justify-center rounded-xl bg-[#FF6600] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#EA580C] transition-colors shrink-0"
          >
            Review Escalations Queue
          </Link>
        </div>
      )}

      {/* 4 Key Metric Cards Grid (Real Production Metrics) */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Gross Volume (GMV)"
          value={`৳${(totalGmvPaisa / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          change={`${deliveredOrders.length} Completed orders`}
          isPositive={true}
          icon="currency"
        />
        <StatCard
          title="Active Order Pipeline"
          value={String(activeOrders.length)}
          change={`${pendingOrdersCount} Preparing · ${inTransitCount} In Transit`}
          isNeutral={true}
          icon="truck"
        />
        <StatCard
          title="Partner Network"
          value={String(vendors.length)}
          change={`${activeBranchesCount} Active Online · ${totalBranchesCount} Branches`}
          isPositive={true}
          icon="store"
        />
        <StatCard
          title="Pending Subscriptions"
          value={String(pendingPayments.length)}
          change={pendingPayments.length > 0 ? 'Requires TrxID verification' : 'All subscriptions verified'}
          isPositive={pendingPayments.length === 0}
          icon="check"
        />
      </div>

      {/* Live Order Dispatch Pipeline Table & Branch Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Real-time Order Dispatch Board (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900">Live Order Dispatch Queue</h3>
              <p className="text-xs text-slate-500">Latest cylinder deliveries placed across all active city thanas</p>
            </div>
            <Link href="/orders" className="text-xs font-bold text-[#FF6600] hover:underline">
              View All ({activeOrders.length}) →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3.5">Order ID</th>
                  <th className="py-3 px-3.5">Customer</th>
                  <th className="py-3 px-3.5">Branch / Vendor</th>
                  <th className="py-3 px-3.5 text-right">Amount</th>
                  <th className="py-3 px-3.5 text-center">Status</th>
                  <th className="py-3 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {activeOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      No active orders in the queue right now.
                    </td>
                  </tr>
                ) : (
                  activeOrders.slice(0, 6).map((order) => (
                    <tr key={order.id} className="hover:bg-[#FFF7ED]/40 transition-colors">
                      <td className="py-3.5 px-3.5 font-bold text-slate-900">
                        <Link href={`/orders/${order.id}`} className="hover:text-[#FF6600] font-mono">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3.5 px-3.5 text-slate-700">
                        <div className="font-semibold">{order.customer?.fullName || 'Customer'}</div>
                        <div className="text-[10px] text-slate-400">{order.customer?.phone ?? order.customer?.email}</div>
                      </td>
                      <td className="py-3.5 px-3.5 text-slate-600">
                        <div className="font-medium">{order.vendor?.name || 'Vendor'}</div>
                        <div className="text-[10px] text-slate-400">{order.branch?.name}</div>
                      </td>
                      <td className="py-3.5 px-3.5 text-right font-bold text-slate-900 font-mono">
                        ৳{(order.totalPaisa / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-3.5 text-center">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-3.5 px-3.5 text-right">
                        <Link
                          href={`/orders/${order.id}`}
                          className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:bg-[#FF6600] hover:text-white transition-colors"
                        >
                          Inspect
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Panel: Partner & Subscriptions Shortcuts */}
        <div className="space-y-6">
          {/* Partner Subscription Verification Status */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900">Partner Subscriptions</h3>
              <Link href="/subscriptions" className="text-xs font-bold text-[#FF6600] hover:underline">
                View Queue →
              </Link>
            </div>
            <p className="text-xs text-slate-500 mb-4">Verification and active partner billing status</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-700">Pending Review</span>
                <span className="text-xs font-bold text-[#FF6600] font-mono">{pendingPayments.length} payments</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-700">Registered Vendors</span>
                <span className="text-xs font-bold text-slate-900 font-mono">{vendors.length} partners</span>
              </div>
            </div>
          </div>

          {/* Quick Operations Actions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 mb-3">Quick Navigation</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/subscriptions"
                className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-3 text-center font-medium text-slate-700 hover:border-[#FF6600] hover:text-[#FF6600] hover:bg-[#FFF7ED] transition-all shadow-2xs"
              >
                <span className="font-bold text-slate-900">Subscriptions</span>
                <span className="text-[10px] text-slate-400">Verify TrxID</span>
              </Link>
              <Link
                href="/vendors"
                className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-3 text-center font-medium text-slate-700 hover:border-[#FF6600] hover:text-[#FF6600] hover:bg-[#FFF7ED] transition-all shadow-2xs"
              >
                <span className="font-bold text-slate-900">Vendors</span>
                <span className="text-[10px] text-slate-400">Manage Network</span>
              </Link>
              <Link
                href="/payouts"
                className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-3 text-center font-medium text-slate-700 hover:border-[#FF6600] hover:text-[#FF6600] hover:bg-[#FFF7ED] transition-all shadow-2xs"
              >
                <span className="font-bold text-slate-900">Payouts</span>
                <span className="text-[10px] text-slate-400">Settle Ledger</span>
              </Link>
              <Link
                href="/campaigns"
                className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-3 text-center font-medium text-slate-700 hover:border-[#FF6600] hover:text-[#FF6600] hover:bg-[#FFF7ED] transition-all shadow-2xs"
              >
                <span className="font-bold text-slate-900">Push Blast</span>
                <span className="text-[10px] text-slate-400">Send Campaign</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  isPositive,
  isNeutral,
  icon,
}: {
  title: string;
  value: string;
  change: string;
  isPositive?: boolean;
  isNeutral?: boolean;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF7ED] text-[#FF6600] border border-[#FFEDD5]">
          {icon === 'currency' && <span className="font-bold">৳</span>}
          {icon === 'truck' && <span>🚚</span>}
          {icon === 'store' && <span>🏪</span>}
          {icon === 'check' && <span>⚡</span>}
        </div>
      </div>
      <div className="mt-4">
        <div className="text-2xl font-black tracking-tight text-slate-900 font-mono">{value}</div>
        <div className={`mt-1 text-xs font-semibold ${isPositive ? 'text-emerald-600' : isNeutral ? 'text-slate-500' : 'text-[#FF6600]'}`}>{change}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'PENDING':
      return <span className="inline-flex rounded-full bg-[#FFF7ED] px-2.5 py-0.5 text-[10px] font-bold text-[#FF6600] border border-[#FFEDD5]">Pending</span>;
    case 'ACCEPTED':
    case 'PREPARING':
      return <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">Preparing</span>;
    case 'READY':
    case 'OUT_FOR_DELIVERY':
      return (
        <span className="inline-flex rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200">In Transit</span>
      );
    case 'DELIVERED':
      return (
        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">Delivered</span>
      );
    case 'CANCELLED':
    case 'REJECTED':
      return <span className="inline-flex rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-bold text-red-700 border border-red-200">Cancelled</span>;
    default:
      return <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">{status}</span>;
  }
}

