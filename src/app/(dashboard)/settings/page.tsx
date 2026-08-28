import { api } from '@/lib/api';
import { can, requireAdmin } from '@/lib/auth';
import { SettingRow } from './setting-row';

export const metadata = { title: 'Platform Settings · Gas Lagba Admin' };

export interface SettingView {
  key: string;
  value: unknown;
  default: unknown;
  description: string;
  updatedBy: string | null;
  updatedAt: string | null;
}

export default async function SettingsPage() {
  const me = await requireAdmin();
  let settings: SettingView[] = [];
  try {
    settings = await api<SettingView[]>('/admin/settings');
  } catch {
    // Fallback
  }
  const canEdit = can(me, 'settings.update') || can(me, 'settings.update.finance');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Platform Operational Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Dynamic runtime controls. Money fields stored strictly in integer Paisa (1 BDT = 100 Paisa), percentages in basis points (1% = 100 bps).
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Configuration Parameter</th>
                <th className="py-3 px-4">Active Value</th>
                <th className="py-3 px-4">System Default</th>
                <th className="py-3 px-4">Last Modified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {settings.map((s) => (
                <SettingRow key={s.key} setting={s} editable={canEdit} />
              ))}
              {settings.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    No runtime settings configured.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
