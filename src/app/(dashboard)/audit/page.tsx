import Link from 'next/link';
import { api, pick, type Page } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';

export const metadata = { title: 'Audit log · Gas Lagba Admin' };

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
  const page = await api<Page<AuditRow>>('/admin/audit', { query: { ...query, limit: 50 } });
  const nextHref = page.nextCursor ? `/audit?${new URLSearchParams({ ...compact(query), cursor: page.nextCursor }).toString()}` : null;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Audit log</h1>
      <form className="mt-4 flex flex-wrap gap-2 text-sm" action="/audit">
        {(['entityType', 'entityId', 'action', 'actorId'] as const).map((k) => (
          <input
            key={k}
            name={k}
            placeholder={k}
            defaultValue={query[k] ?? ''}
            className="rounded-md border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-950"
          />
        ))}
        <button type="submit" className="rounded-md bg-zinc-900 px-3 py-1 text-white dark:bg-zinc-50 dark:text-zinc-900">
          Filter
        </button>
      </form>
      <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-950">
            <tr>
              <th className="px-3 py-2">When (Dhaka)</th>
              <th className="px-3 py-2">Actor</th>
              <th className="px-3 py-2">Action</th>
              <th className="px-3 py-2">Entity</th>
              <th className="px-3 py-2">Changes</th>
            </tr>
          </thead>
          <tbody>
            {page.items.map((r) => (
              <tr key={r.id} className="border-t border-zinc-100 align-top dark:border-zinc-800">
                <td className="whitespace-nowrap px-3 py-2 text-xs">{new Date(r.createdAt).toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' })}</td>
                <td className="px-3 py-2 font-mono text-xs">
                  {r.actorType}
                  {r.actorId ? ` · ${r.actorId}` : ''}
                </td>
                <td className="px-3 py-2 font-mono text-xs">{r.action}</td>
                <td className="px-3 py-2 font-mono text-xs">
                  {r.entityType} · {r.entityId}
                </td>
                <td className="px-3 py-2">
                  <pre className="max-w-md overflow-x-auto whitespace-pre-wrap text-xs text-zinc-600 dark:text-zinc-400">
                    {JSON.stringify({ changes: r.changes, metadata: r.metadata }, null, 1)}
                  </pre>
                </td>
              </tr>
            ))}
            {page.items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-zinc-500">
                  No audit entries match.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {nextHref ? (
        <Link href={nextHref} className="mt-4 inline-block text-sm underline">
          Older entries →
        </Link>
      ) : null}
    </div>
  );
}

function compact(q: Record<string, string | undefined>): Record<string, string> {
  return Object.fromEntries(Object.entries(q).filter((e): e is [string, string] => Boolean(e[1])));
}
