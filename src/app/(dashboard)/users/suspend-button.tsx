'use client';

import { useActionState, useState } from 'react';
import { setSuspended, type SuspendState } from './actions';

export function SuspendButton({ userId, suspended }: { userId: string; suspended: boolean }) {
  const [open, setOpen] = useState(false);
  const [state, act, pending] = useActionState(setSuspended, {} as SuspendState);
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        {suspended ? 'Reinstate' : 'Suspend'}
      </button>
    );
  }
  return (
    <form action={act} className="flex flex-col gap-1">
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="suspend" value={String(!suspended)} />
      <input
        name="reason"
        placeholder="Reason (audited)"
        required
        minLength={5}
        className="w-48 rounded-md border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-950"
      />
      <div className="flex gap-1">
        <button type="submit" disabled={pending} className="rounded-md bg-red-600 px-2 py-1 text-xs text-white disabled:opacity-60">
          Confirm {suspended ? 'reinstate' : 'suspend'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-md border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700">
          Cancel
        </button>
      </div>
      {state.error ? <span className="text-xs text-red-600">{state.error}</span> : null}
    </form>
  );
}
