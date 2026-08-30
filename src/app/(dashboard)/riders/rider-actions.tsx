'use client';

import { useState, useTransition } from 'react';
import { approveRider, rejectRider } from './actions';

interface RiderActionsProps {
  riderId: string;
  riderName: string;
  status: string;
  nidNo?: string | null;
  nidPhotoUrl?: string | null;
}

export function RiderActions({ riderId, riderName, status, nidNo, nidPhotoUrl }: RiderActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* NID Photo Viewer Modal Trigger */}
      {nidPhotoUrl ? (
        <button
          type="button"
          onClick={() => setPhotoOpen(true)}
          className="rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
        >
          📷 View NID
        </button>
      ) : null}

      {/* If Pending Approval, show Approve and Reject buttons */}
      {status === 'PENDING_APPROVAL' && (
        <>
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              if (confirm(`Are you sure you want to approve rider ${riderName}?`)) {
                startTransition(async () => {
                  await approveRider(riderId);
                });
              }
            }}
            className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Approving...' : '✓ Approve'}
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() => setRejectOpen(true)}
            className="rounded-lg bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-2xs hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            ✕ Reject
          </button>
        </>
      )}

      {/* Reject Modal */}
      {rejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Reject Rider: {riderName}</h3>
            <p className="mt-1 text-xs text-slate-500">Provide a reason for rejecting this rider application so the vendor can rectify.</p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. NID card photo is blurred or does not match entered name."
              className="mt-3 w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectOpen(false)}
                className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending || !rejectReason.trim()}
                onClick={() => {
                  startTransition(async () => {
                    await rejectRider(riderId, rejectReason.trim());
                    setRejectOpen(false);
                  });
                }}
                className="rounded-xl bg-red-600 px-4 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-red-700 disabled:opacity-50"
              >
                {isPending ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NID Photo Viewer Modal */}
      {photoOpen && nidPhotoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">NID Document: {riderName}</h3>
                {nidNo && <p className="text-xs font-mono font-bold text-slate-600">NID No: {nidNo}</p>}
              </div>
              <button
                type="button"
                onClick={() => setPhotoOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center min-h-[220px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={nidPhotoUrl.startsWith('data:') || nidPhotoUrl.startsWith('http') ? nidPhotoUrl : `/api/v1/storage/${nidPhotoUrl}`}
                alt={`NID Card for ${riderName}`}
                className="max-h-[350px] w-auto object-contain rounded-lg shadow-xs"
              />
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setPhotoOpen(false)}
                className="rounded-xl bg-slate-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
