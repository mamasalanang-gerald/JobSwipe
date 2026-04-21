'use client';

import { useDashboardStats, useUserGrowthData, useRevenueData, useDashboardActivity } from '@/lib/hooks';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SkeletonCard } from '@/components/shared/Skeleton';
import { Users, Building2, Briefcase, DollarSign, TrendingUp, CreditCard, AlertTriangle, Shield } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

const statCards = [
  { title: 'Total Users', key: 'totalUsers', icon: Users, format: formatNumber },
  { title: 'Active Companies', key: 'activeCompanies', icon: Building2, format: formatNumber },
  { title: 'Active Listings', key: 'activeJobs', icon: Briefcase, format: formatNumber },
  { title: 'Monthly Revenue', key: 'monthlyRevenue', icon: DollarSign, format: (v: number) => formatCurrency(v) },
  { title: 'Active Subscriptions', key: 'activeSubscriptions', icon: CreditCard, format: formatNumber },
  { title: 'Pending Verifications', key: 'pendingVerifications', icon: Shield, format: formatNumber },
  { title: 'Flagged Content', key: 'flaggedContent', icon: AlertTriangle, format: formatNumber },
  { title: 'Low Trust Companies', key: 'lowTrustCompanies', icon: TrendingUp, format: formatNumber },
];

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: userGrowth } = useUserGrowthData();
  const { data: revenue } = useRevenueData();
  const { data: activity } = useDashboardActivity();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-400">Platform overview and key metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading
          ? statCards.map((stat) => <SkeletonCard key={stat.title} />)
          : statCards.map((stat) => {
              const Icon = stat.icon;
              const value = stats?.[stat.key as keyof typeof stats] ?? 0;
              return (
                <div key={stat.title} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                  <div className="flex items-center justify-between">
                    <div className="rounded-lg bg-zinc-800 p-2">
                      <Icon className="h-5 w-5 text-zinc-400" />
                    </div>
                    <StatusBadge status="success" variant="success" />
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-zinc-400">{stat.title}</p>
                    <p className="mt-1 text-2xl font-bold text-zinc-100">
                      {stat.format ? stat.format(value as number) : value}
                    </p>
                  </div>
                </div>
              );
            })}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Growth Chart */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="text-lg font-semibold text-zinc-100">User Growth</h3>
          <p className="text-sm text-zinc-400">New users and companies over time</p>
          <div className="mt-4 h-64 flex items-center justify-center text-zinc-500">
            {userGrowth ? (
              <div className="w-full text-sm">
                <p className="text-zinc-400">Chart placeholder - Recharts component would render here</p>
                <p className="mt-2 text-zinc-500">Data: {userGrowth.length} data points available</p>
              </div>
            ) : (
              <p>Loading chart data...</p>
            )}
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="text-lg font-semibold text-zinc-100">Revenue Breakdown</h3>
          <p className="text-sm text-zinc-400">Subscription and IAP revenue</p>
          <div className="mt-4 h-64 flex items-center justify-center text-zinc-500">
            {revenue ? (
              <div className="w-full text-sm">
                <p className="text-zinc-400">Chart placeholder - Recharts component would render here</p>
                <p className="mt-2 text-zinc-500">Data: {revenue.length} data points available</p>
              </div>
            ) : (
              <p>Loading chart data...</p>
            )}
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="text-lg font-semibold text-zinc-100">Recent Activity</h3>
        <p className="text-sm text-zinc-400">Latest actions across the platform</p>
        <div className="mt-4 space-y-3">
          {activity ? (
            activity.slice(0, 10).map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b border-zinc-800 pb-3 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-sm text-zinc-300">{item.description}</p>
                    <p className="text-xs text-zinc-500">{item.type}</p>
                  </div>
                </div>
                <span className="text-xs text-zinc-500">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-zinc-500">Loading activity...</p>
          )}
        </div>
      </div>
    </div>
  );
}
