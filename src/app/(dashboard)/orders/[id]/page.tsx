import Link from 'next/link';
import { api } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { OrderAdminActions } from './order-actions';

export const metadata = { title: 'Order Details · Gas Lagba Admin' };

export interface AdminOrderDetail {
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
  deliveryAddress: {
    recipientName?: string;
    phone?: string;
    line1?: string;
    line2?: string;
    area?: string;
    thana?: string;
    district?: string;
    instructions?: string;
  };
  customerNote: string | null;
  subtotalPaisa: number;
  discountPaisa: number;
  deliveryFeePaisa: number;
  depositPaisa: number;
  taxPaisa: number;
  couponCode: string | null;
  cancelReason: string | null;
  cancelledBy: string | null;
  codCollectedPaisa: number | null;
  items: Array<{
    id: string;
    variantId: string;
    productNameI18n: Record<string, string>;
    variantNameI18n: Record<string, string>;
    supplyType: string;
    quantity: number;
    unitPricePaisa: number;
    unitDepositPaisa: number;
    lineTotalPaisa: number;
  }>;
  statusHistory: Array<{
    id: string;
    fromStatus: string | null;
    toStatus: string;
    actorType: string;
    actorId: string | null;
    reason: string | null;
    isOverride: boolean;
    createdAt: string;
  }>;
  escalations: Array<{
    id: string;
    level: string;
    raisedAt: string;
    resolvedAt: string | null;
    resolvedBy: string | null;
    resolutionNote: string | null;
  }>;
  cancellationRequests: Array<{
    id: string;
    requestedBy: string;
    reason: string;
    status: string;
    decidedBy: string | null;
    decidedAt: string | null;
    decisionNote: string | null;
    createdAt: string;
  }>;
}

function statusBadgeClass(status: string) {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
    case 'ACCEPTED':
    case 'PREPARING':
    case 'READY':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
    case 'OUT_FOR_DELIVERY':
      return 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300';
    case 'DELIVERED':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
    case 'CANCELLED':
    case 'REJECTED':
      return 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300';
    default:
      return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300';
  }
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const order = await api<AdminOrderDetail>(`/admin/orders/${id}`);

  const addr = order.deliveryAddress;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/orders" className="text-xs font-medium text-zinc-500 hover:underline">
            ← Back to orders
          </Link>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">{order.orderNumber}</h1>
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(order.status)}`}>{order.status}</span>
            {order.hasActiveEscalation && (
              <span className="inline-flex rounded bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                ACTIVE ESCALATION
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500">
            Placed on{' '}
            {new Date(order.placedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} ·
            Checkout ID: <span className="font-mono">{order.checkoutId}</span>
          </p>
        </div>

        <OrderAdminActions orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Customer Card */}
        <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Customer Details</h2>
          <div className="mt-3">
            <div className="font-semibold text-zinc-900 dark:text-zinc-100">{order.customer.fullName}</div>
            <div className="text-xs text-zinc-500">{order.customer.email}</div>
            <div className="mt-1 text-xs text-zinc-700 dark:text-zinc-300">{order.customer.phone || 'No phone'}</div>
            <div className="mt-2 font-mono text-[11px] text-zinc-400">ID: {order.customer.id}</div>
          </div>
        </div>

        {/* Delivery Address Card */}
        <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Delivery Address Snapshot</h2>
          <div className="mt-3 text-xs text-zinc-700 dark:text-zinc-300">
            <div className="font-medium text-zinc-900 dark:text-zinc-100">{addr.recipientName || order.customer.fullName}</div>
            <div>{addr.phone || order.customer.phone}</div>
            <div className="mt-1">{addr.line1}</div>
            {addr.line2 && <div>{addr.line2}</div>}
            <div className="text-zinc-500">{[addr.area, addr.thana, addr.district].filter(Boolean).join(', ')}</div>
            {addr.instructions && <div className="mt-2 text-zinc-500 italic">Note: {addr.instructions}</div>}
          </div>
        </div>

        {/* Fulfillment Branch Card */}
        <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Fulfillment Branch</h2>
          <div className="mt-3 text-xs text-zinc-700 dark:text-zinc-300">
            <div className="font-semibold text-zinc-900 dark:text-zinc-100">{order.vendor.name}</div>
            <div className="text-zinc-500">{order.branch.name}</div>
            <div className="mt-2 font-mono text-[11px] text-zinc-400">Branch ID: {order.branch.id}</div>
            <div className="mt-2 text-zinc-500">
              Payment: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{order.paymentMethod}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-100 px-5 py-3 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Order Items Snapshot</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-950">
            <tr>
              <th className="px-5 py-3">Product / Variant</th>
              <th className="px-5 py-3">Supply Type</th>
              <th className="px-5 py-3 text-right">Unit Price</th>
              <th className="px-5 py-3 text-right">Cylinder Deposit</th>
              <th className="px-5 py-3 text-center">Qty</th>
              <th className="px-5 py-3 text-right">Line Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="px-5 py-3">
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">{item.productNameI18n?.en || 'Product'}</div>
                  <div className="text-xs text-zinc-500">{item.variantNameI18n?.en || 'Variant'}</div>
                </td>
                <td className="px-5 py-3 text-xs">
                  <span className="inline-flex rounded bg-zinc-100 px-2 py-0.5 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {item.supplyType}
                  </span>
                </td>
                <td className="px-5 py-3 text-right text-xs">৳{(item.unitPricePaisa / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td className="px-5 py-3 text-right text-xs">
                  {item.unitDepositPaisa > 0 ? (
                    `৳${(item.unitDepositPaisa / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                </td>
                <td className="px-5 py-3 text-center text-xs font-semibold">{item.quantity}</td>
                <td className="px-5 py-3 text-right font-medium text-zinc-900 dark:text-zinc-100">
                  ৳{(item.lineTotalPaisa / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pricing Summary */}
        <div className="border-t border-zinc-100 bg-zinc-50/50 p-5 dark:border-zinc-800 dark:bg-zinc-950/50">
          <div className="ml-auto max-w-xs space-y-1.5 text-xs">
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Subtotal:</span>
              <span>৳{(order.subtotalPaisa / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            {order.depositPaisa > 0 && (
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Cylinder Deposit:</span>
                <span>৳{(order.depositPaisa / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Delivery Fee:</span>
              <span>৳{(order.deliveryFeePaisa / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            {order.discountPaisa > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount:</span>
                <span>−৳{(order.discountPaisa / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-zinc-200 pt-2 text-sm font-bold text-zinc-900 dark:border-zinc-800 dark:text-zinc-100">
              <span>Grand Total:</span>
              <span>৳{(order.totalPaisa / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline & Status History */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Status History Timeline</h2>
          <div className="mt-4 space-y-3">
            {order.statusHistory.map((h) => (
              <div key={h.id} className="relative pl-4 border-l-2 border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold ${statusBadgeClass(h.toStatus)}`}>{h.toStatus}</span>
                  <span className="text-[11px] font-medium text-zinc-500 uppercase">{h.actorType}</span>
                  {h.isOverride && (
                    <span className="rounded bg-rose-100 px-1 text-[9px] font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">OVERRIDE</span>
                  )}
                </div>
                {h.reason && <p className="mt-1 text-xs text-zinc-700 dark:text-zinc-300">{h.reason}</p>}
                <div className="mt-0.5 text-[10px] text-zinc-400">
                  {new Date(h.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* Escalations Card */}
          <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Escalations</h2>
            {order.escalations.length === 0 ? (
              <p className="mt-2 text-xs text-zinc-500">No escalations recorded for this order.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {order.escalations.map((e) => (
                  <div key={e.id} className="rounded border border-zinc-100 p-2.5 text-xs dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-rose-600 dark:text-rose-400">{e.level} Escalation</span>
                      <span className="text-[10px] text-zinc-400">{new Date(e.raisedAt).toLocaleTimeString()}</span>
                    </div>
                    {e.resolvedAt ? (
                      <div className="mt-1 text-emerald-600 text-[11px]">
                        Resolved on {new Date(e.resolvedAt).toLocaleTimeString()} ({e.resolutionNote})
                      </div>
                    ) : (
                      <div className="mt-1 text-amber-600 font-medium text-[11px]">Pending admin resolution</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cancellation Requests Card */}
          <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Customer Cancellation Requests</h2>
            {order.cancellationRequests.length === 0 ? (
              <p className="mt-2 text-xs text-zinc-500">No cancellation requests submitted.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {order.cancellationRequests.map((r) => (
                  <div key={r.id} className="rounded border border-zinc-100 p-2.5 text-xs dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">Reason: {r.reason}</span>
                      <span className="font-bold text-[10px]">{r.status}</span>
                    </div>
                    {r.decisionNote && <div className="mt-1 text-[11px] text-zinc-500">Decision note: {r.decisionNote}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
