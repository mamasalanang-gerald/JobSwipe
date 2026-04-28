import api, { buildParams } from '@/lib/api';
import type { Match, PaginatedResponse } from '@/types';

interface MatchFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
}

interface MatchStats {
  totalMatches: number;
  pendingMatches: number;
  acceptedMatches: number;
  rejectedMatches: number;
  averageMatchScore: number;
  acceptanceRate: number;
  averageResponseTime: number;
  conversionMetrics: {
    swipeToMatch: number;
    matchToApplication: number;
    applicationToHire: number;
  };
}

interface Application {
  id: string;
  matchId: string;
  userId: string;
  jobId: string;
  companyId: string;
  status: string;
  appliedAt: string;
  respondedAt?: string;
}

interface ApplicationStats {
  totalApplications: number;
  conversionRate: number;
  averageTimeToApply: number;
  statusDistribution: Record<string, number>;
}

export const matchService = {
  list: async (
    filters: MatchFilters,
    page: number = 1,
    pageSize: number = 20,
    signal?: AbortSignal
  ): Promise<PaginatedResponse<Match>> => {
    const params = buildParams({ ...filters, page, pageSize });
    const { data } = await api.get<{ success: boolean; data: PaginatedResponse<Match> }>(
      `/admin/matches?${params}`,
      { signal }
    );
    return data.data;
  },

  stats: async (signal?: AbortSignal): Promise<MatchStats> => {
    const { data } = await api.get<{ success: boolean; data: MatchStats }>(
      '/admin/matches/stats',
      { signal }
    );
    return data.data;
  },

  applications: async (
    filters: { status?: string; companyId?: string },
    page: number = 1,
    pageSize: number = 20,
    signal?: AbortSignal
  ): Promise<PaginatedResponse<Application>> => {
    const params = buildParams({ ...filters, page, pageSize });
    const { data } = await api.get<{ success: boolean; data: PaginatedResponse<Application> }>(
      `/admin/applications?${params}`,
      { signal }
    );
    return data.data;
  },

  applicationStats: async (signal?: AbortSignal): Promise<ApplicationStats> => {
    const { data } = await api.get<{ success: boolean; data: ApplicationStats }>(
      '/admin/applications/stats',
      { signal }
    );
    return data.data;
  },
};
