import Link from 'next/link';
import { api, type Page } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';

export const metadata = { title: 'Campaigns · Gas Lagba Admin' };

interface AdminCampaignRow {
  id: string;
  titleI18n: { en: string; bn: string };
  bodyI18n: { en: string; bn: string };
  category: string;
  status: string;
  channels: string[];
  audienceSpec: Record<string, unknown>;
  scheduledAt: string | null;
  confirmedAt: string | null;
  completedAt: string | null;
  recipientCount: number;
  deliveredCount: number;
  readCount: number;
  createdBy: string;
  createdAt: string;
}

function statusBadgeClass(status: string) {
  switch (status) {
    case 'DRAFT':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'SCHEDULED':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'SENDING':
      return 'bg-[#FFF7ED] text-[#FF6600] border-[#FFEDD5]';
    case 'SENT':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'CANCELLED':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-slate-100 text-slate-500 border-slate-200';
  }
}

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; cursor?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;

  let page: Page<AdminCampaignRow> = { items: [], nextCursor: null };
  try {
    page = await api<Page<AdminCampaignRow>>('/admin/campaigns', {
      query: { status: params.status, cursor: params.cursor, limit: 20 },
    });
  } catch {
    page = { items: [], nextCursor: null };
  }

  const campaigns = page.items;
  const draftCount = campaigns.filter((c) => c.status === 'DRAFT').length;
  const sentCount = campaigns.filter((c) => c.status === 'SENT').length;
  const totalRecipients = campaigns.reduce((acc, c) => acc + c.recipientCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Campaigns & Push Broadcasts</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Targeted announcements, seasonal refill discounts, and FCM push notifications to customers & vendors.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Campaigns', value: campaigns.length, color: 'text-slate-900' },
          { label: 'Drafts in Review', value: draftCount, color: 'text-slate-600' },
          { label: 'Broadcasts Sent', value: sentCount, color: 'text-emerald-600' },
          { label: 'Total Reached', value: totalRecipients.toLocaleString(), color: 'text-[#FF6600]' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</p>
            <p className={`mt-2 text-2xl font-black font-mono ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Campaign Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Campaign Title (EN / BN)</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Channels</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Recipients</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No broadcast campaigns found.
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FFF7ED]/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{c.titleI18n.en || c.titleI18n.bn}</div>
                      <div className="text-[11px] text-slate-500">{c.titleI18n.bn}</div>
                      <div className="font-mono text-[10px] text-slate-400 mt-0.5">{c.id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 font-semibold text-[10px] text-slate-700">
                        {c.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex gap-1 flex-wrap">
                        {c.channels.map((ch) => (
                          <span
                            key={ch}
                            className="inline-flex items-center rounded-md bg-[#FFF7ED] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#FF6600] border border-[#FFEDD5]"
                          >
                            {ch}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${statusBadgeClass(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {c.recipientCount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-500">
                      {new Date(c.createdAt).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/campaigns/${c.id}`}
                        className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:bg-[#FF6600] hover:text-white transition-colors"
                      >
                        Inspect →
                      </Link>
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
