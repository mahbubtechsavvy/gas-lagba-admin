'use client';

import { useState, useTransition } from 'react';
import { createPlatformRider } from './actions';

export function CreatePlatformRiderModal() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nidNo, setNidNo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Please provide rider name and mobile phone number.');
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await createPlatformRider({
          name: name.trim(),
          phone: phone.trim(),
          nidNo: nidNo.trim() || undefined,
        });
        setOpen(false);
        setName('');
        setPhone('');
        setNidNo('');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to create platform rider');
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-[#FF6600] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#e65c00] transition-colors"
      >
        <span>+ Register Gas Lagba Platform Rider</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add Gas Lagba Central Rider</h3>
                <p className="text-xs text-slate-500 mt-0.5">Register an on-demand platform rider for overflow & outsourced deliveries.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700">Rider Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Md. Tariqul Islam"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-[#FF6600] focus:outline-none focus:ring-1 focus:ring-[#FF6600]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Mobile Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 01712345678"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-[#FF6600] focus:outline-none focus:ring-1 focus:ring-[#FF6600]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">National ID (NID) Card Number</label>
                <input
                  type="text"
                  value={nidNo}
                  onChange={(e) => setNidNo(e.target.value)}
                  placeholder="e.g. 19922692019000123"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-[#FF6600] focus:outline-none focus:ring-1 focus:ring-[#FF6600]"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl bg-[#FF6600] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#e65c00] disabled:opacity-50"
                >
                  {isPending ? 'Registering...' : 'Register Platform Rider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
