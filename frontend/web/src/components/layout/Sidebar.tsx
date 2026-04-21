'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  MessageSquare,
  CreditCard,
  ShoppingCart,
  Shield,
  UserCheck,
  Settings,
  CheckCircle,
  Webhook,
  Activity,
  AlertTriangle,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/users', icon: Users },
  {
    name: 'Companies',
    href: '/companies',
    icon: Building2,
    children: [
      { name: 'All Companies', href: '/companies' },
      { name: 'Verifications', href: '/companies/verifications' },
    ],
  },
  { name: 'Jobs', href: '/jobs', icon: Briefcase },
  { name: 'Reviews', href: '/reviews', icon: MessageSquare },
  { name: 'Subscriptions', href: '/subscriptions', icon: CreditCard },
  {
    name: 'IAP',
    href: '/iap/transactions',
    icon: ShoppingCart,
    children: [
      { name: 'Transactions', href: '/iap/transactions' },
      { name: 'Webhooks', href: '/iap/webhooks' },
    ],
  },
  {
    name: 'Trust System',
    href: '/trust/events',
    icon: Shield,
    children: [
      { name: 'Events', href: '/trust/events' },
      { name: 'Low Trust Companies', href: '/trust/low-trust' },
    ],
  },
  { name: 'Matches', href: '/matches', icon: UserCheck },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r border-zinc-800 bg-zinc-950">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-zinc-800 px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-zinc-100">JobSwipe</span>
          <span className="ml-auto text-xs text-zinc-500">Admin</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
          {navigation.map((item) => (
            <div key={item.name}>
              {item.children ? (
                <div className="space-y-1">
                  <div
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition-colors'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </div>
                  <div className="ml-4 space-y-1 pl-4">
                    {item.children.map((child) => {
                      const isActive = pathname === child.href;
                      return (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={cn(
                            'block rounded-lg px-3 py-2 text-sm transition-colors',
                            isActive
                              ? 'bg-blue-600/10 text-blue-400'
                              : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                          )}
                        >
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-blue-600/10 text-blue-400'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-zinc-800 p-4">
          <div className="flex items-center gap-3 rounded-lg bg-zinc-900 p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700">
              <AlertTriangle className="h-4 w-4 text-zinc-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-zinc-300">System Status</p>
              <p className="text-xs text-emerald-400">All systems operational</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
