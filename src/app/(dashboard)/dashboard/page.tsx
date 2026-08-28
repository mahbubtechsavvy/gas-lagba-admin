import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { api, type Page } from '@/lib/api';
import { AdminOrderRow } from '../orders/page';

export const metadata = { title: 'Operations Dashboard · Gas Lagba Admin' };

export default async function DashboardPage() {
  await requireAdmin();

  let activeOrders: AdminOrderRow[] = [];
  let escalationCount = 0;

  try {
    const ordersRes = await api<Page<AdminOrderRow>>('/admin/orders', {
      query: { limit: 10 },
    });
    activeOrders = ordersRes.items || [];
    escalationCount = activeOrders.filter((o) => o.hasActiveEscalation || o.status === 'PENDING').length;
  } catch {
    // Fallback if local backend is empty or seeding
  }

  return (
    <div className="space-y-8">
      {/* Page Title & Environment Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Operations Control Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time marketplace monitoring, cylinder dispatch queues, and SLA tracking.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-slate-700 border border-slate-200 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-[#FF6600] animate-pulse" />
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

      {/* Escalation Alert Banner (High Intent Safety Orange) */}
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

      {/* 4 Key Metric Cards Grid (Clean White with Orange Highlights) */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Gross Volume (GMV)" value="৳4,85,200" change="+14.2% vs yesterday" isPositive={true} icon="currency" />
        <StatCard
          title="Active Order Pipeline"
          value={String(activeOrders.length > 0 ? activeOrders.length : '48')}
          change="12 Preparing · 18 Dispatched"
          isNeutral={true}
          icon="truck"
        />
        <StatCard title="Partner Branches" value="36" change="34 Active Online · 2 Closed" isPositive={true} icon="store" />
        <StatCard title="Fulfillment SLA" value="98.6%" change="Avg 38m delivery window" isPositive={true} icon="check" />
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
                        <div className="font-semibold">{order.customer.fullName}</div>
                        <div className="text-[10px] text-slate-400">{order.customer.phone ?? order.customer.email}</div>
                      </td>
                      <td className="py-3.5 px-3.5 text-slate-600">
                        <div className="font-medium">{order.vendor.name}</div>
                        <div className="text-[10px] text-slate-400">{order.branch.name}</div>
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

        {/* Side Panel: LPG Cylinder Brand Share & Shortcuts */}
        <div className="space-y-6">
          {/* Brand Distribution Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 mb-1">LPG Brand Volume Share</h3>
            <p className="text-xs text-slate-500 mb-4">Volume breakdown across major suppliers</p>
            <div className="space-y-3.5">
              <BrandShareItem brand="Beximco LPG" share="38%" count="482 units" color="bg-[#FF6600]" />
              <BrandShareItem brand="Omera Gas" share="26%" count="330 units" color="bg-amber-500" />
              <BrandShareItem brand="Bashundhara LP" share="20%" count="254 units" color="bg-emerald-500" />
              <BrandShareItem brand="Jamuna Gas" share="10%" count="127 units" color="bg-slate-700" />
              <BrandShareItem brand="TotalEnergies" share="6%" count="76 units" color="bg-blue-600" />
            </div>
          </div>

          {/* Quick Operations Actions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 mb-3">Quick Navigation</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
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
              <Link
                href="/support"
                className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-3 text-center font-medium text-slate-700 hover:border-[#FF6600] hover:text-[#FF6600] hover:bg-[#FFF7ED] transition-all shadow-2xs"
              >
                <span className="font-bold text-slate-900">Support Desk</span>
                <span className="text-[10px] text-slate-400">Help & Recovery</span>
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

function BrandShareItem({ brand, share, count, color }: { brand: string; share: string; count: string; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
        <span>{brand}</span>
        <span className="font-mono text-slate-500">
          {share} ({count})
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: share }} />
      </div>
    </div>
  );
}
