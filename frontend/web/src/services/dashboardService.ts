import api from '@/lib/api';
import type { DashboardStats, UserGrowthData, RevenueData } from '@/types';

interface ActivityEvent {
  id: string;
  type: string;
  description: string;
  createdAt: string;
}

/**
 * The Axios interceptor in api.ts already handles:
 *   1. Unwrapping { success, data, message } envelope
 *   2. camelCasing all keys
 *   3. Normalising Laravel paginators
 *
 * So `data` from `api.get<T>()` is ALREADY the inner payload — do NOT do `data.data`.
 */
export const dashboardService = {
  stats: async (signal?: AbortSignal): Promise<DashboardStats> => {
    const { data } = await api.get<DashboardStats>('/admin/dashboard/stats', { signal });
    return data;
  },

  userGrowth: async (days: number = 30, signal?: AbortSignal): Promise<UserGrowthData[]> => {
    const { data } = await api.get<UserGrowthData[]>(
      `/admin/dashboard/user-growth?days=${days}`,
      { signal }
    );
    return data;
  },

  revenue: async (months: number = 12, signal?: AbortSignal): Promise<RevenueData[]> => {
    const { data } = await api.get<RevenueData[]>(
      `/admin/dashboard/revenue?months=${months}`,
      { signal }
    );
    return data;
  },

  activity: async (limit: number = 50, signal?: AbortSignal): Promise<ActivityEvent[]> => {
    const { data } = await api.get<ActivityEvent[]>(
      `/admin/dashboard/activity?limit=${limit}`,
      { signal }
    );
    return data;
  },
};
