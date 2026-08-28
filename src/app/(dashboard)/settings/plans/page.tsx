import Link from 'next/link';
import { api } from '@/lib/api';
import { can, requireAdmin } from '@/lib/auth';
import { PlanCard } from './plan-card';

export const metadata = { title: 'Subscription Plans · Gas Lagba Admin' };

interface PlanRow {
  id: string;
  key: string;
  nameI18n: Record<string, string>;
  descriptionI18n: Record<string, string> | null;
  durationDays: number;
  pricePaisa: number | null;
  entitlements: string[];
  isActive: boolean;
  sortOrder: number;
}

export default async function SubscriptionPlansPage() {
  const me = await requireAdmin();
  const plans = await api<PlanRow[]>('/admin/subscriptions/plans');
  const canEdit = can(me, 'settings.update');

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/settings" className="hover:underline">
            Settings
          </Link>
          <span>/</span>
          <span>Subscription Plans</span>
        </div>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Subscription Plans</h1>
        <p className="mt-1 text-sm text-zinc-500">Manage vendor subscription packages, pricing, durations, and entitlements (BR-201, D-016).</p>
      </div>

      <div className="space-y-4">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} canEdit={canEdit} />
        ))}
      </div>
    </div>
  );
}
