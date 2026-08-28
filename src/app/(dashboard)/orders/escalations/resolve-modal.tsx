'use client';

import { useState, useTransition } from 'react';
import { resolveEscalationAction } from '../actions';

export function ResolveEscalationButton({ escalationId }: { escalationId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) {
      setError('Resolution note is required');
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('resolutionNote', note);
        await resolveEscalationAction(escalationId, formData);
        setIsOpen(false);
        setNote('');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Resolution failed');
      }
    });
  };

  return (
    <>
      <button
        onClick={() => {
          setError(null);
          setIsOpen(true);
        }}
        className="rounded border border-emerald-600 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
      >
        Resolve
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Resolve Escalation</h3>
            <p className="mt-1 text-xs text-zinc-500">Provide an operational resolution note for the audit log.</p>

            <form onSubmit={handleResolve} className="mt-4">
              {error && <div className="mb-3 rounded bg-rose-50 p-2 text-xs text-rose-600 dark:bg-rose-950 dark:text-rose-300">{error}</div>}

              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">Resolution Note *</label>
              <textarea
                required
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Called vendor branch manager; order is now accepted and being prepared"
                rows={3}
                className="mt-1 w-full rounded-md border border-zinc-300 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setIsOpen(false)}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-md bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isPending ? 'Resolving...' : 'Confirm Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
