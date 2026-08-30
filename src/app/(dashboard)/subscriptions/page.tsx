import Link from 'next/link';
import { api, pick, type Page } from '@/lib/api';
import { requireAdmin, can } from '@/lib/auth';
import { PaymentActions } from './payment-actions';
import { PlanCard } from '../settings/plans/plan-card';
import { SettingRow } from '../settings/setting-row';
import type { SettingView } from '../settings/page';

export const metadata = { title: 'Subscription Payments & Plans · Gas Lagba Admin' };

export interface AdminPaymentRow {
  id: string;
  method: string;
  transactionRef: string;
  amountPaisa: number;
  proofKey: string | null;
  status: 'SUBMITTED' | 'VERIFIED' | 'REJECTED';
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  createdAt: string;
  subscriptionPublicId?: string;
  vendorLegalName?: string;
}

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

export default async function SubscriptionsQueuePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const me = await requireAdmin();
  const params = await searchParams;
  const tab = (params.tab as string) || 'payments';
  const query = pick(params, ['status', 'cursor']);

  let page: Page<AdminPaymentRow> = { items: [], nextCursor: null };
  let plans: PlanRow[] = [];
  let paymentSettings: SettingView[] = [];

  try {
    const [pageRes, plansRes, settingsRes] = await Promise.all([
      api<Page<AdminPaymentRow>>('/admin/subscriptions/payments', {
        query: { ...query, limit: 25 },
      }).catch(() => ({ items: [], nextCursor: null })),
      api<PlanRow[]>('/admin/subscriptions/plans').catch(() => []),
      api<SettingView[]>('/admin/settings').catch(() => []),
    ]);

    page = pageRes;
    plans = plansRes;
    paymentSettings = settingsRes.filter((s) => s.key.startsWith('payment.'));
  } catch {
    // Fallback
  }

  const canEdit = can(me, 'settings.update') || can(me, 'settings.update.finance');
  const pendingCount = page.items.filter((p) => p.status === 'SUBMITTED').length;

  const nextHref = page.nextCursor
    ? `/subscriptions?${new URLSearchParams({
        ...Object.fromEntries(Object.entries(query).filter((e): e is [string, string] => Boolean(e[1]))),
        cursor: page.nextCursor,
      }).toString()}`
    : null;

  return (
    <div className="space-y-6">
      {/* Header & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Partner Subscriptions & Billing</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Adjudicate manual vendor subscription payments (bKash/Nagad TrxID), configure pricing, and manage company receiving numbers.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold">
        <Link
          href="/subscriptions?tab=payments"
          className={`pb-3 px-3 border-b-2 transition-colors flex items-center gap-2 ${
            tab === 'payments'
              ? 'border-[#FF6600] text-[#FF6600]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Verification Queue</span>
          {pendingCount > 0 && (
            <span className="rounded-full bg-[#FF6600] text-white px-2 py-0.5 text-[10px] font-bold">
              {pendingCount}
            </span>
          )}
        </Link>
        <Link
          href="/subscriptions?tab=plans"
          className={`pb-3 px-3 border-b-2 transition-colors flex items-center gap-2 ${
            tab === 'plans'
              ? 'border-[#FF6600] text-[#FF6600]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Subscription Plans & Pricing ({plans.length})</span>
        </Link>
        <Link
          href="/subscriptions?tab=channels"
          className={`pb-3 px-3 border-b-2 transition-colors flex items-center gap-2 ${
            tab === 'channels'
              ? 'border-[#FF6600] text-[#FF6600]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Payment Receiving Numbers ({paymentSettings.length})</span>
        </Link>
      </div>

      {/* Tab 1: Payment Verification Queue */}
      {tab === 'payments' && (
        <div className="space-y-4">
          <form className="flex flex-wrap items-center gap-2.5 text-xs" action="/subscriptions">
            <input type="hidden" name="tab" value="payments" />
            <select
              name="status"
              defaultValue={query.status ?? ''}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 font-medium text-slate-700 focus:border-[#FF6600] focus:outline-none shadow-2xs"
            >
              <option value="">All Payment Statuses</option>
              <option value="SUBMITTED">Pending Review (Submitted)</option>
              <option value="VERIFIED">Verified & Active</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <button
              type="submit"
              className="rounded-xl bg-[#FF6600] px-4 py-2 font-bold text-white shadow-2xs hover:bg-[#EA580C] transition-colors cursor-pointer"
            >
              Filter
            </button>
          </form>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Vendor / Plan</th>
                    <th className="py-3 px-4">Payment Method & TrxID</th>
                    <th className="py-3 px-4 text-right">Fee Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Submitted</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {page.items.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FFF7ED]/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{p.vendorLegalName || '—'}</div>
                        <div className="font-mono text-[10px] text-slate-400 mt-0.5">Sub ID: {p.subscriptionPublicId || '—'}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="font-bold text-slate-900">{p.method}</div>
                        <div className="font-mono text-[11px] text-[#FF6600] font-semibold mt-0.5">Ref: {p.transactionRef}</div>
                        {p.proofKey && <div className="text-[10px] text-slate-400 mt-0.5">Proof File: {p.proofKey}</div>}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">৳{(p.amountPaisa / 100).toFixed(2)}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                            p.status === 'VERIFIED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : p.status === 'SUBMITTED'
                                ? 'bg-[#FFF7ED] text-[#FF6600] border-[#FFEDD5]'
                                : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-slate-500">
                        {new Date(p.createdAt).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <PaymentActions paymentId={p.id} status={p.status} />
                      </td>
                    </tr>
                  ))}
                  {page.items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No pending subscription payments in queue.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {nextHref && (
              <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 flex items-center justify-between">
                <span className="text-xs text-slate-500">Showing up to 25 payment requests</span>
                <Link
                  href={nextHref}
                  className="inline-flex items-center rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-[#FFF7ED] hover:text-[#FF6600] shadow-2xs"
                >
                  Next Page →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Subscription Plans & Pricing */}
      {tab === 'plans' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Edit plan pricing, duration, and feature packages. Updates reflect live in the Vendor App!
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} canEdit={canEdit} />
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Payment Receiving Numbers */}
      {tab === 'channels' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 mb-1">Company Receiving Payment Numbers</h3>
            <p className="text-xs text-slate-500 mb-6">
              Edit the bKash, Nagad, Rocket numbers or Bank Account below. When you click <strong>Save</strong>, the updated numbers immediately sync to the Vendor Mobile App in real-time!
            </p>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Channel / Description</th>
                    <th className="px-4 py-3">Configured Receiving Number</th>
                    <th className="px-4 py-3 text-right">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paymentSettings.map((s) => (
                    <SettingRow key={s.key} setting={s} editable={canEdit} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
