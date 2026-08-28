import Link from 'next/link';
import { api, pick, type Page } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { ResolveEscalationButton } from './resolve-modal';

export const metadata = { title: 'Order Escalations · Gas Lagba Admin' };

export interface AdminEscalationRow {
  id: string;
  level: string;
  raisedAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
  resolutionNote: string | null;
  order: {
    id: string;
    orderNumber: string;
    status: string;
    totalPaisa: number;
    vendorName: string;
    branchName: string;
    placedAt: string;
  };
}

export default async function EscalationsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();

  const params = await searchParams;
  const query = pick(params, ['cursor', 'resolved']);
  const isResolvedView = query.resolved === 'true';

  let page: Page<AdminEscalationRow> = { items: [], nextCursor: null };
  try {
    page = await api<Page<AdminEscalationRow>>('/admin/orders/escalations', {
      query: { ...query, limit: 25 },
    });
  } catch {
    // Fallback
  }

  const nextHref = page.nextCursor
    ? `/orders/escalations?${new URLSearchParams({
        ...Object.fromEntries(Object.entries(query).filter((e): e is [string, string] => Boolean(e[1]))),
        cursor: page.nextCursor,
      }).toString()}`
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Order Escalation Queue</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time monitor for unacknowledged orders exceeding 5m/10m SLA thresholds</p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/orders/escalations"
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all shadow-2xs ${
              !isResolvedView ? 'bg-[#FF6600] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-[#FFF7ED] hover:text-[#FF6600]'
            }`}
          >
            Active Escalations
          </Link>
          <Link
            href="/orders/escalations?resolved=true"
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all shadow-2xs ${
              isResolvedView ? 'bg-[#FF6600] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-[#FFF7ED] hover:text-[#FF6600]'
            }`}
          >
            Resolved History
          </Link>
        </div>
      </div>

      {/* Escalations Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Level</th>
                <th className="py-3 px-4">Order Number</th>
                <th className="py-3 px-4">Vendor & Branch</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Raised At</th>
                <th className="py-3 px-4">Status & Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {page.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    {isResolvedView ? 'No resolved escalation logs.' : '🎉 No active escalations. All orders are acknowledged on time.'}
                  </td>
                </tr>
              ) : (
                page.items.map((e) => (
                  <tr key={e.id} className="hover:bg-[#FFF7ED]/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                          e.level === 'ADMIN' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-[#FFF7ED] text-[#FF6600] border-[#FFEDD5]'
                        }`}
                      >
                        {e.level}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <Link href={`/orders/${e.order.id}`} className="hover:text-[#FF6600]">
                        {e.order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="font-semibold">{e.order.vendorName}</div>
                      <div className="text-[10px] text-slate-400">{e.order.branchName}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">
                      ৳{(e.order.totalPaisa / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {new Date(e.raisedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                      {e.resolvedAt ? (
                        <div>
                          <span className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                            Resolved
                          </span>
                          {e.resolutionNote && <p className="text-[10px] text-slate-500 mt-1 italic">{e.resolutionNote}</p>}
                        </div>
                      ) : (
                        <span className="inline-flex rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                          Awaiting Resolution
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {!e.resolvedAt ? (
                        <ResolveEscalationButton escalationId={e.id} />
                      ) : (
                        <Link
                          href={`/orders/${e.order.id}`}
                          className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:bg-[#FF6600] hover:text-white transition-colors"
                        >
                          View Order
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {nextHref && (
          <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-slate-500">Showing up to 25 records</span>
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
