import Link from 'next/link';
import { requireAdmin, can } from '@/lib/auth';
import { signOut } from '@/app/sign-in/actions';

const NAV: Array<{ href: string; label: string; permission?: string }> = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/users', label: 'Users', permission: 'users.read' },
  { href: '/settings', label: 'Settings', permission: 'settings.read' },
  { href: '/audit', label: 'Audit log', permission: 'audit.read' },
  { href: '/roles', label: 'Roles', permission: 'roles.read' },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const me = await requireAdmin();
  const items = NAV.filter((n) => !n.permission || can(me, n.permission));
  return (
    <div className="flex min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <aside className="flex w-60 flex-col border-r border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6">
          <div className="text-lg font-semibold">Gas Lagba</div>
          <div className="text-xs text-zinc-500">Admin · {me.roleKey ?? 'no role'}</div>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {items.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-md px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">
              {n.label}
            </Link>
          ))}
        </nav>
        <form action={signOut} className="mt-4">
          <div className="mb-2 truncate text-xs text-zinc-500" title={me.email}>
            {me.email}
          </div>
          <button
            type="submit"
            className="w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Sign out
          </button>
        </form>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
