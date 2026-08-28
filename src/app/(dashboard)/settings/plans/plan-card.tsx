'use client';

import { useState, useTransition } from 'react';
import { updatePlan } from './actions';

interface PlanCardProps {
  plan: {
    id: string;
    key: string;
    nameI18n: Record<string, string>;
    descriptionI18n: Record<string, string> | null;
    durationDays: number;
    pricePaisa: number | null;
    entitlements: string[];
    isActive: boolean;
    sortOrder: number;
  };
  canEdit: boolean;
}

export function PlanCard({ plan, canEdit }: PlanCardProps) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {plan.nameI18n?.en} <span className="text-sm font-normal text-zinc-500">({plan.nameI18n?.bn})</span>
            </h3>
            <span
              className={`rounded px-2 py-0.5 text-xs font-semibold ${
                plan.isActive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-zinc-100 text-zinc-600'
              }`}
            >
              {plan.isActive ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>
          <div className="mt-1 font-mono text-xs text-zinc-400">Key: {plan.key}</div>
        </div>

        {canEdit && (
          <button
            onClick={() => setEditing(!editing)}
            className="rounded border border-zinc-300 px-3 py-1 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            {editing ? 'Cancel' : 'Edit plan'}
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
        <div>
          <div className="text-xs text-zinc-500">Price</div>
          <div className="mt-0.5 text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {plan.pricePaisa !== null ? `৳${(plan.pricePaisa / 100).toFixed(2)}` : 'Not set (Free / Custom)'}
          </div>
        </div>
        <div>
          <div className="text-xs text-zinc-500">Duration</div>
          <div className="mt-0.5 text-base font-semibold text-zinc-900 dark:text-zinc-100">{plan.durationDays} days</div>
        </div>
        <div>
          <div className="text-xs text-zinc-500">Entitlements</div>
          <div className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">{plan.entitlements.length} features enabled</div>
        </div>
      </div>

      {editing && (
        <form
          action={(formData) => {
            startTransition(async () => {
              await updatePlan(plan.key, formData);
              setEditing(false);
            });
          }}
          className="mt-4 space-y-3 border-t border-zinc-100 pt-4 dark:border-zinc-800"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Name (EN)</label>
              <input
                name="nameEn"
                defaultValue={plan.nameI18n?.en ?? ''}
                className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Name (BN)</label>
              <input
                name="nameBn"
                defaultValue={plan.nameI18n?.bn ?? ''}
                className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Price (in Paisa, e.g. 200000 = ৳2,000)</label>
              <input
                type="number"
                name="pricePaisa"
                defaultValue={plan.pricePaisa ?? ''}
                placeholder="Leave blank for unset"
                className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Duration (Days)</label>
              <input
                type="number"
                name="durationDays"
                defaultValue={plan.durationDays}
                className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id={`active-${plan.key}`} name="isActive" defaultChecked={plan.isActive} />
            <label htmlFor={`active-${plan.key}`} className="text-xs text-zinc-700 dark:text-zinc-300">
              Active for vendor selection
            </label>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900"
            >
              {isPending ? 'Saving...' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded border border-zinc-300 px-3 py-1.5 text-xs text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
