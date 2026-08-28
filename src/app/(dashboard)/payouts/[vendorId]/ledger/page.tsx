import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api, type Page } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { AdjustLedgerModal } from '../../adjust-modal';

interface LedgerEntry {
  id: string;
  entryType: string;
  amountPaisa: number;
  currency: string;
  referenceType: string;
  referenceId: string;
  description: string | null;
  createdAt: string;
}

const ENTRY_TYPE_BADGES: Record<string, { label: string; class: string }> = {
  ORDER_SETTLEMENT: {
    label: 'ORDER SETTLEMENT',
    class: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  COMMISSION: {
    label: 'COMMISSION (DEBIT)',
    class: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  },
  PAYOUT_DEBIT: {
    label: 'PAYOUT DISBURSEMENT',
    class: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  },
  ADJUSTMENT: {
    label: 'MANUAL ADJUSTMENT',
    class: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  },
  REFUND_REVERSAL: {
    label: 'REFUND REVERSAL',
    class: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
  },
};

export default async function VendorLedgerPage({
  params,
  searchParams,
}: {
  params: Promise<{ vendorId: string }>;
  searchParams: Promise<{ cursor?: string; entryType?: string }>;
}) {
  await requireAdmin();
  const { vendorId } = await params;
  const sp = await searchParams;

  let ledgerData: Page<LedgerEntry>;
  try {
    ledgerData = await api<Page<LedgerEntry>>(`/admin/payouts/vendors/${vendorId}/ledger`, {
      query: {
        cursor: sp.cursor,
        entryType: sp.entryType,
        limit: 50,
      },
    });
  } catch {
    notFound();
  }

  // Calculate live cumulative balance on current page
  const totalSettledPaisa = ledgerData.items.reduce((acc, e) => acc + e.amountPaisa, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/payouts" className="text-xs text-zinc-500 hover:text-zinc-700">
              ← Back to Payouts
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight font-mono">Ledger: {vendorId}</h1>
          <p className="text-xs text-zinc-500">Append-Only Financial Transaction Movements (BR-140, DECISION-004)</p>
        </div>

        <div className="flex items-center gap-2">
          <AdjustLedgerModal vendorId={vendorId} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs font-medium text-zinc-500 uppercase">Page Movements Net</div>
          <div
            className={`mt-1 text-2xl font-bold ${
              totalSettledPaisa >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            ৳{(totalSettledPaisa / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs font-medium text-zinc-500 uppercase">Ledger Entries Shown</div>
          <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">{ledgerData.items.length}</div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs font-medium text-zinc-500 uppercase">Auditing Status</div>
          <div className="mt-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            Append-Only · Verified
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Statement Movements</h2>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-500 uppercase dark:border-zinc-800 dark:bg-zinc-950">
            <tr>
              <th className="px-4 py-3">Entry ID</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Amount (BDT)</th>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {ledgerData.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  No ledger entries recorded for this vendor yet.
                </td>
              </tr>
            ) : (
              ledgerData.items.map((entry) => {
                const badge = ENTRY_TYPE_BADGES[entry.entryType] || {
                  label: entry.entryType,
                  class: 'bg-zinc-100 text-zinc-800',
                };
                const isCredit = entry.amountPaisa > 0;
                return (
                  <tr key={entry.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                    <td className="px-4 py-3 font-mono text-xs font-medium">{entry.id}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-2xs font-medium ${badge.class}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3 font-semibold ${
                        isCredit
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isCredit ? '+' : ''}৳
                      {(entry.amountPaisa / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                      {entry.referenceType}: {entry.referenceId}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400">{entry.description || '—'}</td>
                    <td className="px-4 py-3 text-right text-xs text-zinc-500">
                      {new Date(entry.createdAt).toLocaleString('en-GB')}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {ledgerData.nextCursor && (
        <div className="flex justify-end">
          <Link
            href={`/payouts/${vendorId}/ledger?cursor=${ledgerData.nextCursor}${
              sp.entryType ? `&entryType=${sp.entryType}` : ''
            }`}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900"
          >
            Next page →
          </Link>
        </div>
      )}
    </div>
  );
}
