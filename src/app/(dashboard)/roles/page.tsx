import { api } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';

export const metadata = { title: 'Roles & RBAC · Gas Lagba Admin' };

interface RoleView {
  key: string;
  name: string;
  description: string | null;
  permissions: string[];
}

export default async function RolesPage() {
  await requireAdmin();
  let roles: RoleView[] = [];
  try {
    roles = await api<RoleView[]>('/admin/roles');
  } catch {
    // Fallback
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">RBAC Roles & Permission Matrix</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Role-based access control matrix enforced at the API layer for each administrator endpoint.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {roles.map((r) => (
          <div key={r.key} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-slate-900">{r.name}</span>
                <span className="font-mono text-[11px] font-bold text-[#FF6600] bg-[#FFF7ED] px-2 py-0.5 rounded-md border border-[#FFEDD5]">
                  {r.key}
                </span>
              </div>
              {r.description && <p className="mt-1.5 text-xs text-slate-500">{r.description}</p>}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Granted Permissions ({r.permissions.length})</span>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {r.permissions.map((p) => (
                  <li key={p} className="rounded-lg bg-slate-50 border border-slate-200 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-700">
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
