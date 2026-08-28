import { api } from '@/lib/api';
import { can, requireAdmin } from '@/lib/auth';
import { SettingRow } from './setting-row';

export const metadata = { title: 'Settings · Gas Lagba Admin' };

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
  const settings = await api<SettingView[]>('/admin/settings');
  const canEdit = can(me, 'settings.update') || can(me, 'settings.update.finance');
  return (
    <div>
      <h1 className="text-2xl font-semibold">Platform settings</h1>
      <p className="mt-1 text-sm text-zinc-500">Money is in paisa (৳1.00 = 100), rates in basis points (1% = 100). Every change is audited.</p>
      <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-950">
            <tr>
              <th className="px-4 py-2">Key</th>
              <th className="px-4 py-2">Value</th>
              <th className="px-4 py-2">Default</th>
              <th className="px-4 py-2">Updated</th>
            </tr>
          </thead>
          <tbody>
            {settings.map((s) => (
              <SettingRow key={s.key} setting={s} editable={canEdit} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
