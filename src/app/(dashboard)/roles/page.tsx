import { api } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';

export const metadata = { title: 'Roles · Gas Lagba Admin' };

interface RoleView {
  key: string;
  name: string;
  description: string | null;
  permissions: string[];
}

export default async function RolesPage() {
  await requireAdmin();
  const roles = await api<RoleView[]>('/admin/roles');
  return (
    <div>
      <h1 className="text-2xl font-semibold">Roles</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Permission keys are enforced by the API on every request; this view is read-only (role editing arrives in Phase 15).
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {roles.map((r) => (
          <div key={r.key} className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="font-medium">
              {r.name} <span className="font-mono text-xs text-zinc-500">{r.key}</span>
            </div>
            {r.description ? <p className="mt-1 text-sm text-zinc-500">{r.description}</p> : null}
            <ul className="mt-3 flex flex-wrap gap-1">
              {r.permissions.map((p) => (
                <li key={p} className="rounded-full border border-zinc-200 px-2 py-0.5 font-mono text-[11px] dark:border-zinc-700">
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
