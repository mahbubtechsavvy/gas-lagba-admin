'use client';

import { useActionState } from 'react';
import { updateSetting, type UpdateSettingState } from './actions';
import type { SettingView } from './page';

export function SettingRow({ setting, editable }: { setting: SettingView; editable: boolean }) {
  const [state, act, pending] = useActionState(updateSetting, {} as UpdateSettingState);
  return (
    <tr className="border-t border-zinc-100 align-top dark:border-zinc-800">
      <td className="px-4 py-3">
        <div className="font-mono text-xs">{setting.key}</div>
        <div className="mt-1 max-w-md text-xs text-zinc-500">{setting.description}</div>
      </td>
      <td className="px-4 py-3">
        {editable ? (
          <form action={act} className="flex items-center gap-2">
            <input type="hidden" name="key" value={setting.key} />
            <input
              name="value"
              defaultValue={String(setting.value)}
              inputMode="numeric"
              className="w-32 rounded-md border border-zinc-300 px-2 py-1 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-950"
            />
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-zinc-900 px-2 py-1 text-xs text-white disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900"
            >
              Save
            </button>
            {state.error ? <span className="text-xs text-red-600">{state.error}</span> : null}
            {state.saved && !state.error ? <span className="text-xs text-emerald-600">Saved</span> : null}
          </form>
        ) : (
          <span className="font-mono text-xs">{String(setting.value)}</span>
        )}
      </td>
      <td className="px-4 py-3 font-mono text-xs text-zinc-500">{String(setting.default)}</td>
      <td className="px-4 py-3 text-xs text-zinc-500">
        {setting.updatedAt ? `${new Date(setting.updatedAt).toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' })} · ${setting.updatedBy ?? ''}` : 'default'}
      </td>
    </tr>
  );
}
