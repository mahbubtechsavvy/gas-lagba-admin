import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';

export const metadata = { title: 'Inspect Campaign · Gas Lagba Admin' };

interface CampaignDetail {
  id: string;
  titleI18n: { en: string; bn: string };
  bodyI18n: { en: string; bn: string };
  imageKey: string | null;
  deepLink: string | null;
  audienceSpec: Record<string, unknown>;
  channels: string[];
  category: string;
  status: string;
  scheduledAt: string | null;
  confirmedBy: string | null;
  confirmedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  recipientCount: number;
  deliveredCount: number;
  readCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  let campaign: CampaignDetail;
  try {
    campaign = await api<CampaignDetail>(`/api/v1/admin/campaigns/${id}`);
  } catch {
    notFound();
  }

  const readRatePercent = campaign.recipientCount > 0 ? Math.round((campaign.readCount / campaign.recipientCount) * 100) : 0;

  const deliveryRatePercent = campaign.recipientCount > 0 ? Math.round((campaign.deliveredCount / campaign.recipientCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/campaigns" className="text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
              ← All Campaigns
            </Link>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">{campaign.titleI18n.en}</h1>
          <p className="text-sm font-mono text-zinc-500">{campaign.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">{campaign.status}</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Recipients</p>
          <p className="mt-1 text-2xl font-semibold">{campaign.recipientCount.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Delivered</p>
          <p className="mt-1 text-2xl font-semibold">
            {campaign.deliveredCount.toLocaleString()} <span className="text-xs font-normal text-zinc-500">({deliveryRatePercent}%)</span>
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">In-App Reads</p>
          <p className="mt-1 text-2xl font-semibold">
            {campaign.readCount.toLocaleString()} <span className="text-xs font-normal text-zinc-500">({readRatePercent}%)</span>
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Category</p>
          <p className="mt-1 text-2xl font-semibold">{campaign.category}</p>
        </div>
      </div>

      {/* Content Preview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-base font-semibold">Message Content (English)</h2>
          <div className="mt-4 space-y-3">
            <div>
              <p className="text-xs font-medium text-zinc-500">Title</p>
              <p className="mt-0.5 text-sm font-medium">{campaign.titleI18n.en}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500">Body</p>
              <p className="mt-0.5 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">{campaign.bodyI18n.en}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-base font-semibold">Message Content (Bengali)</h2>
          <div className="mt-4 space-y-3">
            <div>
              <p className="text-xs font-medium text-zinc-500">Title (বাংলা)</p>
              <p className="mt-0.5 text-sm font-medium">{campaign.titleI18n.bn}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500">Body (বাংলা)</p>
              <p className="mt-0.5 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">{campaign.bodyI18n.bn}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration & Targeting */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-base font-semibold">Audience Specification & Targeting</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-zinc-500">Channels</p>
            <div className="mt-1 flex gap-1">
              {campaign.channels.map((ch) => (
                <span key={ch} className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-medium dark:bg-zinc-800">
                  {ch}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-500">Audience Spec</p>
            <pre className="mt-1 overflow-x-auto rounded bg-zinc-50 p-2 text-xs font-mono dark:bg-zinc-950">
              {JSON.stringify(campaign.audienceSpec, null, 2)}
            </pre>
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-500">Deep Link</p>
            <p className="mt-1 text-xs font-mono text-zinc-600 dark:text-zinc-400">{campaign.deepLink || 'None'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
