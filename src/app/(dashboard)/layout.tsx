import Link from 'next/link';
import { requireAdmin, can } from '@/lib/auth';
import { signOut } from '@/app/sign-in/actions';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  permission?: string;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Operations',
    items: [
      { href: '/dashboard', label: 'Overview & Ops', icon: 'dashboard' },
      { href: '/orders', label: 'Live Orders', icon: 'orders', permission: 'orders.read' },
      { href: '/orders/escalations', label: 'Escalations', icon: 'warning', permission: 'orders.escalate', badge: 'Alert' },
      { href: '/riders', label: 'Delivery Riders', icon: 'riders', permission: 'orders.read' },
    ],
  },
  {
    title: 'Partners & Inventory',
    items: [
      { href: '/vendors', label: 'Vendor Network', icon: 'vendors', permission: 'vendors.read' },
      { href: '/catalogue/categories', label: 'Categories', icon: 'categories', permission: 'catalogue.moderate' },
      { href: '/catalogue/products', label: 'LPG Cylinders', icon: 'products', permission: 'catalogue.moderate' },
      { href: '/subscriptions', label: 'Partner Plans', icon: 'subscriptions', permission: 'subscriptions.verify' },
    ],
  },
  {
    title: 'Financials',
    items: [
      { href: '/payments', label: 'Gateway & COD', icon: 'payments', permission: 'payments.read' },
      { href: '/payouts', label: 'Payout Ledger', icon: 'payouts', permission: 'payouts.manage' },
    ],
  },
  {
    title: 'Customers & Growth',
    items: [
      { href: '/customers', label: 'Customer Registry', icon: 'customers', permission: 'customers.read' },
      { href: '/campaigns', label: 'Push Campaigns', icon: 'campaigns', permission: 'campaigns.manage' },
      { href: '/notifications', label: 'Delivery & DLQ', icon: 'notifications', permission: 'audit.read' },
      { href: '/support', label: 'Support Desk', icon: 'support' },
    ],
  },
  {
    title: 'System & Security',
    items: [
      { href: '/users', label: 'Admin Accounts', icon: 'users', permission: 'users.read' },
      { href: '/roles', label: 'RBAC Matrix', icon: 'roles', permission: 'roles.read' },
      { href: '/settings', label: 'Platform Config', icon: 'settings', permission: 'settings.read' },
      { href: '/audit', label: 'Audit Trail', icon: 'audit', permission: 'audit.read' },
    ],
  },
];

function NavIcon({ name }: { name: string }) {
  switch (name) {
    case 'dashboard':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      );
    case 'orders':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      );
    case 'warning':
      return (
        <svg className="w-4 h-4 text-[#FF6600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      );
    case 'riders':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case 'vendors':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      );
    case 'categories':
    case 'products':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      );
    case 'subscriptions':
    case 'payments':
    case 'payouts':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case 'customers':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      );
    case 'campaigns':
    case 'notifications':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      );
    case 'support':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      );
    default:
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
  }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const me = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900">
      {/* 256px Fixed Sidebar (Clean Crisp White & Orange) */}
      <aside className="fixed left-0 top-0 bottom-0 flex w-64 flex-col border-r border-slate-200 bg-white text-slate-700 z-50 shadow-xs">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF6600] shadow-sm text-white font-black text-lg ring-4 ring-[#FF6600]/15">
            GL
          </div>
          <div>
            <div className="font-bold text-slate-900 tracking-tight flex items-center gap-1.5 text-base">
              Gas Lagba
              <span className="inline-flex items-center rounded-md bg-[#FFF7ED] px-1.5 py-0.5 text-[10px] font-bold text-[#FF6600] border border-[#FFEDD5]">
                ADMIN
              </span>
            </div>
            <div className="text-xs text-slate-400 font-medium truncate">{me.roleKey ?? 'Platform Admin'}</div>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-200">
          {NAV_SECTIONS.map((section) => {
            const filteredItems = section.items.filter((item) => !item.permission || can(me, item.permission));
            if (filteredItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1">
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">{section.title}</div>
                <div className="space-y-0.5 pt-0.5">
                  {filteredItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition-all hover:bg-[#FFF7ED] hover:text-[#FF6600]"
                    >
                      <div className="flex items-center gap-2.5">
                        <NavIcon name={item.icon} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && <span className="rounded-full bg-[#FF6600] px-2 py-0.2 text-[9px] font-bold text-white shadow-xs">{item.badge}</span>}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User Profile & Sign Out Footer */}
        <div className="border-t border-slate-100 bg-[#FAFAFA] p-4">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF7ED] text-xs font-bold text-[#FF6600] border border-[#FFEDD5]">
              {me.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">{me.email}</p>
              <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active Admin Session
              </p>
            </div>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-[#FFF7ED] hover:border-[#FFEDD5] hover:text-[#FF6600] transition-colors shadow-2xs"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Canvas Area */}
      <div className="flex flex-1 flex-col pl-64 min-w-0">
        {/* Top Floating App Bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-md px-8 shadow-2xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-bold text-slate-900">Gas Lagba Console</span>
              <span>/</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF7ED] px-2.5 py-0.5 text-xs font-bold text-[#FF6600] border border-[#FFEDD5]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF6600]"></span>
                Bangladesh National Operations
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search orders, vendors, customers..."
                className="w-64 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#FF6600] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6600]/20"
              />
            </div>

            <Link
              href="/orders/escalations"
              className="relative p-2 text-slate-500 hover:text-[#FF6600] hover:bg-[#FFF7ED] rounded-lg transition-colors"
              title="Escalations Queue"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </Link>
          </div>
        </header>

        {/* Page Content Canvas */}
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
