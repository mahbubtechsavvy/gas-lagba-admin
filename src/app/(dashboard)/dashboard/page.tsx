import { requireAdmin } from '@/lib/auth';

export const metadata = { title: 'Dashboard · Gas Lagba Admin' };

export default async function DashboardPage() {
  const me = await requireAdmin();
  return (
    <div>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Signed in as {me.email} ({me.isSuperAdmin ? 'Super Admin' : (me.roleKey ?? 'no role')}).
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Card title="Operational modules" body="Vendors, catalogue moderation, orders and the escalation queue arrive in Phases 5–9." />
        <Card title="Money" body="Payments, refunds, payouts and the ledger view arrive in Phase 10." />
        <Card title="Engagement" body="Campaigns, support desk and push delivery dashboards arrive in Phases 12–15." />
      </div>
      <section className="mt-8">
        <h2 className="text-sm font-medium text-zinc-500">Your permissions</h2>
        <ul className="mt-2 flex flex-wrap gap-2">
          {(me.isSuperAdmin ? ['* (super admin)'] : me.permissions).map((p) => (
            <li key={p} className="rounded-full border border-zinc-200 px-2 py-0.5 font-mono text-xs dark:border-zinc-700">
              {p}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="font-medium">{title}</div>
      <p className="mt-1 text-sm text-zinc-500">{body}</p>
    </div>
  );
}
