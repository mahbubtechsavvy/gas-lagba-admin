import { api } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';

export const metadata = { title: 'Delivery Riders · Gas Lagba Admin' };

interface AdminRiderRow {
  id: string;
  name: string;
  phone: string;
  isActive: boolean;
  branchId: string | null;
  createdAt: string;
}

export default async function RidersPage() {
  await requireAdmin();

  let riders: AdminRiderRow[] = [];
  try {
    riders = await api<AdminRiderRow[]>('/admin/riders');
  } catch {
    riders = [];
  }

  const active = riders.filter((r) => r.isActive);
  const inactive = riders.filter((r) => !r.isActive);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Branch Delivery Riders</h1>
        <p className="text-xs text-slate-500 mt-0.5">Platform-wide cylinder delivery personnel roster managed per branch by vendors.</p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Registered', value: riders.length, color: 'text-slate-900' },
          { label: 'Active on Duty', value: active.length, color: 'text-emerald-600' },
          { label: 'Inactive / Off-Duty', value: inactive.length, color: 'text-slate-500' },
          { label: 'Serving Branches', value: new Set(riders.map((r) => r.branchId).filter(Boolean)).size, color: 'text-[#FF6600]' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</p>
            <p className={`mt-2 text-2xl font-black font-mono ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Rider Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Rider Name</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Assigned Branch</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {riders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No riders currently registered in the database.
                  </td>
                </tr>
              ) : (
                riders.map((rider) => (
                  <tr key={rider.id} className="hover:bg-[#FFF7ED]/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{rider.name}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">{rider.phone}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{rider.branchId ?? '—'}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                          rider.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {rider.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-500">
                      {new Date(rider.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
