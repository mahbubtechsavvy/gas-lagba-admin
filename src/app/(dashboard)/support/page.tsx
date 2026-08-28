import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';

export const metadata = { title: 'Support Desk · Gas Lagba Admin' };

interface SupportTicket {
  id: string;
  ticketNumber: string;
  category: 'ACCOUNT_RECOVERY' | 'CYLINDER_QUALITY' | 'DELIVERY_DELAY' | 'PAYMENT_DISPUTE' | 'VENDOR_COMPLAINT';
  subject: string;
  requesterName: string;
  requesterPhone: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
}

const MOCK_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-001',
    ticketNumber: 'TKT-20260828-0012',
    category: 'ACCOUNT_RECOVERY',
    subject: 'Lost phone access - request manual OTP reset for customer account',
    requesterName: 'Tariqul Islam',
    requesterPhone: '+8801711223344',
    priority: 'URGENT',
    status: 'OPEN',
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    id: 'tkt-002',
    ticketNumber: 'TKT-20260828-0011',
    category: 'DELIVERY_DELAY',
    subject: 'Order GL-20260828-000142 delayed beyond 45 mins in Dhanmondi',
    requesterName: 'Shakil Ahmed',
    requesterPhone: '+8801819998877',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'tkt-003',
    ticketNumber: 'TKT-20260828-0010',
    category: 'PAYMENT_DISPUTE',
    subject: 'bKash double charge on checkout session #chk_8912',
    requesterName: 'Farhana Yasmin',
    requesterPhone: '+8801912345678',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
];

function categoryBadge(category: SupportTicket['category']) {
  switch (category) {
    case 'ACCOUNT_RECOVERY':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'PAYMENT_DISPUTE':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'DELIVERY_DELAY':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

function priorityBadge(priority: SupportTicket['priority']) {
  switch (priority) {
    case 'URGENT':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'HIGH':
      return 'bg-[#FFF7ED] text-[#FF6600] border-[#FFEDD5]';
    case 'MEDIUM':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

export default async function SupportDeskPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Support Desk & Account Recovery</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Resolve customer inquiries, order delivery disputes, and adjudicate account recovery requests (BR-006)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-xl bg-[#FFF7ED] px-3 py-1.5 text-xs font-bold text-[#FF6600] border border-[#FFEDD5]">
            3 Active Tickets
          </span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unassigned Tickets</span>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono">1</div>
          <span className="text-xs font-semibold text-[#FF6600]">1 Account Recovery pending review</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average First Response</span>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono">4.2 min</div>
          <span className="text-xs font-semibold text-emerald-600">Within 15-min SLA window</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resolved Today</span>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono">14</div>
          <span className="text-xs font-semibold text-slate-500">100% customer satisfaction rating</span>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Active Support Queue</h3>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Filter by:</span>
            <select className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
              <option value="">All Categories</option>
              <option value="ACCOUNT_RECOVERY">Account Recovery</option>
              <option value="DELIVERY_DELAY">Delivery Delay</option>
              <option value="PAYMENT_DISPUTE">Payment Dispute</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Subject & Details</th>
                <th className="py-3 px-4">Requester</th>
                <th className="py-3 px-4 text-center">Priority</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {MOCK_TICKETS.map((t) => (
                <tr key={t.id} className="hover:bg-[#FFF7ED]/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{t.ticketNumber}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${categoryBadge(t.category)}`}>
                      {t.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-800 max-w-sm">
                    <div className="font-semibold text-slate-900">{t.subject}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Received {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    <div className="font-semibold">{t.requesterName}</div>
                    <div className="font-mono text-[10px] text-slate-400">{t.requesterPhone}</div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold border ${priorityBadge(t.priority)}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="inline-flex items-center rounded-lg bg-[#FF6600] px-3 py-1 text-[11px] font-bold text-white shadow-2xs hover:bg-[#EA580C] transition-colors cursor-pointer">
                      Resolve →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
