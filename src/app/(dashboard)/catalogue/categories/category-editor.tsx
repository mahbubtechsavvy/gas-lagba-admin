'use client';

import { useState, useTransition } from 'react';
import type { CategoryRow } from '../types';
import { createCategory, updateCategory } from './actions';

const INPUT = 'w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900';

export function NewCategoryForm({ parents }: { parents: CategoryRow[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
      >
        New category
      </button>
    );
  }

  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          await createCategory(formData);
          setOpen(false);
        })
      }
      className="w-full space-y-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="text-sm font-semibold">New category</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs text-zinc-500">
          Slug
          <input name="slug" required placeholder="lpg-cylinders" pattern="[a-z0-9]+(-[a-z0-9]+)*" className={INPUT} />
        </label>
        <label className="text-xs text-zinc-500">
          Parent (optional)
          <select name="parentId" className={INPUT} defaultValue="">
            <option value="">— none (root) —</option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nameI18n.en || p.slug}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-zinc-500">
          Name (English)
          <input name="nameEn" required placeholder="LPG cylinders" className={INPUT} />
        </label>
        <label className="text-xs text-zinc-500">
          Name (Bengali)
          <input name="nameBn" required placeholder="এলপিজি সিলিন্ডার" className={INPUT} />
        </label>
        <label className="text-xs text-zinc-500">
          Description (English, optional)
          <input name="descriptionEn" className={INPUT} />
        </label>
        <label className="text-xs text-zinc-500">
          Description (Bengali, optional)
          <input name="descriptionBn" className={INPUT} />
        </label>
        <label className="text-xs text-zinc-500">
          Sort order
          <input name="sortOrder" type="number" min="0" defaultValue={0} className={INPUT} />
        </label>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {isPending ? 'Creating…' : 'Create category'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded border border-zinc-300 px-3 py-1 text-xs dark:border-zinc-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export function CategoryRowForm({ category, canEdit }: { category: CategoryRow; canEdit: boolean }) {
  const [isPending, startTransition] = useTransition();

  if (!canEdit) {
    return <span className="text-xs text-zinc-400">Read only</span>;
  }

  return (
    <form action={(formData) => startTransition(() => updateCategory(category.id, formData))} className="flex flex-wrap items-end gap-2">
      <label className="text-[11px] text-zinc-500">
        EN
        <input name="nameEn" defaultValue={category.nameI18n.en ?? ''} className="w-40 rounded border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900" />
      </label>
      <label className="text-[11px] text-zinc-500">
        BN
        <input name="nameBn" defaultValue={category.nameI18n.bn ?? ''} className="w-40 rounded border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900" />
      </label>
      <label className="text-[11px] text-zinc-500">
        Sort
        <input name="sortOrder" type="number" min="0" defaultValue={category.sortOrder} className="w-16 rounded border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900" />
      </label>
      <label className="flex items-center gap-1 text-[11px] text-zinc-500">
        <input type="checkbox" name="isActive" defaultChecked={category.isActive} />
        Active
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        {isPending ? 'Saving…' : 'Save'}
      </button>
    </form>
  );
}
