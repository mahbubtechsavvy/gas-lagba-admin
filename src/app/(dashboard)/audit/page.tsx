import Link from 'next/link';
import { api, pick, type Page } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';

export const metadata = { title: 'Audit Trail · Gas Lagba Admin' };

interface AuditRow {
  id: string;
  actorType: string;
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  changes: unknown;
  metadata: unknown;
  requestId: string | null;
  createdAt: string;
}

export default async function AuditPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const params = await searchParams;
  const query = pick(params, ['entityType', 'entityId', 'action', 'actorId', 'cursor']);
  let page: Page<AuditRow> = { items: [], nextCursor: null };

  try {
    page = await api<Page<AuditRow>>('/admin/audit', { query: { ...query, limit: 50 } });
  } catch {
    // Fallback
  }

  const nextHref = page.nextCursor ? `/audit?${new URLSearchParams({ ...compact(query), cursor: page.nextCursor }).toString()}` : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Immutable Audit Trail</h1>
        <p className="text-xs text-slate-500 mt-0.5">Comprehensive audit log of all administrative actions, ledger adjustments, and security state changes.</p>
      </div>

      <form className="flex flex-wrap items-center gap-2 text-xs" action="/audit">
        <input
          name="entityType"
          placeholder="Entity Type (e.g. Order, Payout)"
          defaultValue={query.entityType ?? ''}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-800 placeholder-slate-400 focus:border-[#FF6600] focus:outline-none shadow-2xs"
        />
        <input
          name="entityId"
          placeholder="Entity ID"
          defaultValue={query.entityId ?? ''}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-800 placeholder-slate-400 focus:border-[#FF6600] focus:outline-none shadow-2xs"
        />
        <input
          name="action"
          placeholder="Action (e.g. APPROVE, UPDATE)"
          defaultValue={query.action ?? ''}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-800 placeholder-slate-400 focus:border-[#FF6600] focus:outline-none shadow-2xs"
        />
        <button type="submit" className="rounded-xl bg-[#FF6600] px-4 py-2 font-bold text-white shadow-2xs hover:bg-[#EA580C] transition-colors cursor-pointer">
          Filter Trail
        </button>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">When (Asia/Dhaka)</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">State Diff & Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {page.items.map((r) => (
                <tr key={r.id} className="hover:bg-[#FFF7ED]/30 transition-colors align-top">
                  <td className="whitespace-nowrap py-3.5 px-4 text-xs font-mono text-slate-600">
                    {new Date(r.createdAt).toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' })}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-800">
                    <span className="font-bold text-[#FF6600]">{r.actorType}</span>
                    {r.actorId ? <div className="text-[10px] text-slate-400 mt-0.5">{r.actorId}</div> : ''}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 font-bold font-mono text-[10px] text-slate-700">
                      {r.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-700">
                    <div className="font-bold">{r.entityType}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{r.entityId}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <pre className="max-w-md overflow-x-auto rounded-lg bg-slate-50 p-2 font-mono text-[10px] text-slate-600 border border-slate-200">
                      {JSON.stringify({ changes: r.changes, metadata: r.metadata }, null, 2)}
                    </pre>
                  </td>
                </tr>
              ))}
              {page.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No audit records match query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {nextHref && (
          <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-slate-500">Showing up to 50 audit log events</span>
            <Link
              href={nextHref}
              className="inline-flex items-center rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-[#FFF7ED] hover:text-[#FF6600] shadow-2xs"
            >
              Older Entries →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function compact(q: Record<string, string | undefined>): Record<string, string> {
  return Object.fromEntries(Object.entries(q).filter((e): e is [string, string] => Boolean(e[1])));
}
