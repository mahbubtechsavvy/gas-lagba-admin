import { api } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { RiderActions } from './rider-actions';
import { CreatePlatformRiderModal } from './create-platform-rider-modal';

export const metadata = { title: 'Delivery Riders & Approvals · Gas Lagba Admin' };

interface AdminRiderRow {
  id: string;
  name: string;
  phone: string;
  photoKey?: string | null;
  photoUrl?: string | null;
  nidNo: string | null;
  nidPhotoKey: string | null;
  nidPhotoUrl: string | null;
  status: string;
  rejectionReason: string | null;
  branchId: string | null;
  branchName: string | null;
  isActive: boolean;
  approvedAt: string | null;
  createdAt: string;
}

export default async function RidersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const tab = (params.tab as string) || 'approvals';

  let riders: AdminRiderRow[] = [];
  try {
    riders = await api<AdminRiderRow[]>('/admin/riders');
  } catch {
    riders = [];
  }

  const pending = riders.filter((r) => r.status === 'PENDING_APPROVAL');
  const active = riders.filter((r) => r.status === 'ACTIVE' || (r.isActive && r.status !== 'REJECTED' && r.status !== 'PENDING_APPROVAL'));
  const rejected = riders.filter((r) => r.status === 'REJECTED');
  const platformRiders = riders.filter((r) => !r.branchId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Delivery Riders & Verification</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage in-house vendor riders and Gas Lagba central platform delivery personnel.</p>
        </div>
        <div className="flex items-center gap-3">
          <CreatePlatformRiderModal />
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {[
          { label: 'Pending Approval', value: pending.length, color: 'text-amber-600 bg-amber-50/60 border-amber-200' },
          { label: 'Active on Duty', value: active.length, color: 'text-emerald-600 bg-white border-slate-200' },
          { label: '🚀 Platform Central', value: platformRiders.length, color: 'text-purple-600 bg-purple-50/40 border-purple-200' },
          { label: 'Rejected Applications', value: rejected.length, color: 'text-red-600 bg-white border-slate-200' },
          { label: 'Total Registered', value: riders.length, color: 'text-slate-900 bg-white border-slate-200' },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-2xl border p-5 shadow-xs ${stat.color}`}>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-black font-mono">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold">
        <a
          href="/riders?tab=approvals"
          className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-2 ${
            tab === 'approvals'
              ? 'border-[#FF6600] text-[#FF6600]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Pending Approvals</span>
          {pending.length > 0 && (
            <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-black text-white">
              {pending.length}
            </span>
          )}
        </a>
        <a
          href="/riders?tab=all"
          className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-2 ${
            tab === 'all'
              ? 'border-[#FF6600] text-[#FF6600]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>All Riders Roster ({riders.length})</span>
        </a>
      </div>

      {/* TAB 1: PENDING APPROVALS */}
      {tab === 'approvals' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Riders Awaiting Identity & NID Verification</h2>
            <span className="text-[11px] font-medium text-slate-500">{pending.length} applications pending</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Rider Info</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">NID Card Details</th>
                  <th className="py-3 px-4">Submission Date</th>
                  <th className="py-3 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {pending.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      🎉 No pending rider applications. All riders are verified!
                    </td>
                  </tr>
                ) : (
                  pending.map((rider) => (
                    <tr key={rider.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 shrink-0 rounded-full overflow-hidden border border-slate-200 bg-amber-50 flex items-center justify-center text-xs font-bold text-amber-700">
                            {rider.photoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={rider.photoUrl} alt={rider.name} className="h-full w-full object-cover" />
                            ) : (
                              <span>{rider.name.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{rider.name}</div>
                            <div className="font-mono text-[10px] text-slate-400 mt-0.5">{rider.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{rider.phone}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{rider.branchName ?? 'Main Branch'}</div>
                        <div className="font-mono text-[10px] text-slate-400">{rider.branchId ?? '—'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-800">
                          {rider.nidNo ? `NID: ${rider.nidNo}` : <span className="text-amber-600 italic">No NID No</span>}
                        </div>
                        {rider.nidPhotoKey ? (
                          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-blue-600 font-medium">
                            <span>📄 Photo Uploaded</span>
                          </div>
                        ) : (
                          <div className="mt-1 text-[11px] text-red-500 italic">No photo uploaded</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-slate-500">
                        {new Date(rider.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex justify-end">
                          <RiderActions
                            riderId={rider.id}
                            riderName={rider.name}
                            status={rider.status}
                            nidNo={rider.nidNo}
                            nidPhotoUrl={rider.nidPhotoUrl || rider.nidPhotoKey}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ALL RIDERS ROSTER */}
      {tab === 'all' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Rider Details</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">NID Card</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Approved At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {riders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No riders currently registered in the system.
                    </td>
                  </tr>
                ) : (
                  riders.map((rider) => (
                    <tr key={rider.id} className="hover:bg-[#FFF7ED]/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 shrink-0 rounded-full overflow-hidden border border-slate-200 bg-orange-50 flex items-center justify-center text-xs font-bold text-orange-600">
                            {rider.photoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={rider.photoUrl} alt={rider.name} className="h-full w-full object-cover" />
                            ) : (
                              <span>{rider.name.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{rider.name}</div>
                            <div className="font-mono text-[10px] text-slate-400 mt-0.5">{rider.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{rider.phone}</td>
                      <td className="py-3.5 px-4">
                        {rider.branchId ? (
                          <>
                            <div className="font-medium text-slate-800">{rider.branchName ?? 'Vendor Branch'}</div>
                            <div className="font-mono text-[10px] text-slate-400">{rider.branchId}</div>
                          </>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-1 text-[10px] font-bold text-purple-700 border border-purple-200">
                            🚀 Gas Lagba Central Rider
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-slate-700">{rider.nidNo ?? '—'}</div>
                        {rider.nidPhotoKey && (
                          <div className="text-[10px] text-emerald-600 font-medium">✓ Document on file</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                            rider.status === 'ACTIVE' || (rider.isActive && rider.status !== 'REJECTED' && rider.status !== 'PENDING_APPROVAL')
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : rider.status === 'PENDING_APPROVAL'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {rider.status === 'PENDING_APPROVAL'
                            ? 'Pending Approval'
                            : rider.status === 'ACTIVE' || rider.isActive
                            ? 'Active'
                            : 'Rejected'}
                        </span>
                        {rider.rejectionReason && (
                          <div className="text-[10px] text-red-500 mt-1 max-w-[140px] truncate" title={rider.rejectionReason}>
                            {rider.rejectionReason}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-slate-500">
                        {rider.approvedAt
                          ? new Date(rider.approvedAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex justify-end">
                          <RiderActions
                            riderId={rider.id}
                            riderName={rider.name}
                            status={rider.status}
                            nidNo={rider.nidNo}
                            nidPhotoUrl={rider.nidPhotoUrl || rider.nidPhotoKey}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
