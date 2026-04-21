'use client';

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import api from './api';
import type {
  User,
  Company,
  CompanyVerification,
  JobPosting,
  Review,
  Subscription,
  IAPTransaction,
  WebhookEvent as WebhookEventType,
  TrustEvent,
  LowTrustCompany,
  Match,
  DashboardStats,
  UserGrowthData,
  RevenueData,
  PaginatedResponse,
  UserFilters,
  CompanyFilters,
  JobFilters,
  ReviewFilters,
} from '@/types';

// Query keys
export const queryKeys = {
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: UserFilters & { page?: number; pageSize?: number }) => [...queryKeys.users.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.users.all, 'detail', id] as const,
  },
  companies: {
    all: ['companies'] as const,
    lists: () => [...queryKeys.companies.all, 'list'] as const,
    list: (filters: CompanyFilters & { page?: number; pageSize?: number }) => [...queryKeys.companies.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.companies.all, 'detail', id] as const,
    verifications: () => [...queryKeys.companies.all, 'verifications'] as const,
  },
  jobs: {
    all: ['jobs'] as const,
    lists: () => [...queryKeys.jobs.all, 'list'] as const,
    list: (filters: JobFilters & { page?: number; pageSize?: number }) => [...queryKeys.jobs.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.jobs.all, 'detail', id] as const,
  },
  reviews: {
    all: ['reviews'] as const,
    lists: () => [...queryKeys.reviews.all, 'list'] as const,
    list: (filters: ReviewFilters & { page?: number; pageSize?: number }) => [...queryKeys.reviews.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.reviews.all, 'detail', id] as const,
  },
  subscriptions: {
    all: ['subscriptions'] as const,
    lists: () => [...queryKeys.subscriptions.all, 'list'] as const,
    list: (filters: { status?: string; tier?: string; page?: number; pageSize?: number }) => [...queryKeys.subscriptions.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.subscriptions.all, 'detail', id] as const,
  },
  iap: {
    transactions: ['iap', 'transactions'] as const,
    webhooks: ['iap', 'webhooks'] as const,
  },
  trust: {
    all: ['trust'] as const,
    events: ['trust', 'events'] as const,
    lowTrust: ['trust', 'low-trust'] as const,
  },
  matches: {
    all: ['matches'] as const,
    lists: () => [...queryKeys.matches.all, 'list'] as const,
    list: (filters: { status?: string; page?: number; pageSize?: number }) => [...queryKeys.matches.lists(), filters] as const,
  },
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
    userGrowth: ['dashboard', 'user-growth'] as const,
    revenue: ['dashboard', 'revenue'] as const,
    activity: ['dashboard', 'activity'] as const,
  },
};

// Dashboard hooks
export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: queryKeys.dashboard.stats,
    queryFn: async () => {
      const { data } = await api.get<DashboardStats>('/admin/stats');
      return data;
    },
  });
}

export function useUserGrowthData() {
  return useQuery<UserGrowthData[]>({
    queryKey: queryKeys.dashboard.userGrowth,
    queryFn: async () => {
      const { data } = await api.get<UserGrowthData[]>('/admin/user-growth');
      return data;
    },
  });
}

export function useRevenueData() {
  return useQuery<RevenueData[]>({
    queryKey: queryKeys.dashboard.revenue,
    queryFn: async () => {
      const { data } = await api.get<RevenueData[]>('/admin/revenue');
      return data;
    },
  });
}

export function useDashboardActivity() {
  return useQuery<Array<{ id: string; type: string; description: string; createdAt: string }>>({
    queryKey: queryKeys.dashboard.activity,
    queryFn: async () => {
      const { data } = await api.get<Array<{ id: string; type: string; description: string; createdAt: string }>>('/admin/activity');
      return data;
    },
  });
}

// Users hooks
export function useUsers(filters: UserFilters, page: number = 1, pageSize: number = 20) {
  return useQuery<PaginatedResponse<User>>({
    queryKey: queryKeys.users.list({ ...filters, page, pageSize }),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...Object.entries(filters).reduce((acc, [key, value]) => {
          if (value) acc[key] = value;
          return acc;
        }, {} as Record<string, string>),
      });
      const { data } = await api.get<PaginatedResponse<User>>(`/admin/users?${params}`);
      return data;
    },
  });
}

export function useUser(id: string) {
  return useQuery<User>({
    queryKey: queryKeys.users.detail(id),
    queryFn: async () => {
      const { data } = await api.get<User>(`/admin/users/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useBanUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const { data } = await api.post<{ message: string }>(`/admin/users/${userId}/ban`, { reason });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useUnbanUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.post<{ message: string }>(`/admin/users/${userId}/unban`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

// Companies hooks
export function useCompanies(filters: CompanyFilters, page: number = 1, pageSize: number = 20) {
  return useQuery<PaginatedResponse<Company>>({
    queryKey: queryKeys.companies.list({ ...filters, page, pageSize }),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...Object.entries(filters).reduce((acc, [key, value]) => {
          if (value) acc[key] = value;
          return acc;
        }, {} as Record<string, string>),
      });
      const { data } = await api.get<PaginatedResponse<Company>>(`/admin/companies?${params}`);
      return data;
    },
  });
}

export function useCompany(id: string) {
  return useQuery<Company>({
    queryKey: queryKeys.companies.detail(id),
    queryFn: async () => {
      const { data } = await api.get<Company>(`/admin/companies/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCompanyVerifications() {
  return useQuery<PaginatedResponse<CompanyVerification>>({
    queryKey: queryKeys.companies.verifications(),
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<CompanyVerification>>('/admin/companies/verifications');
      return data;
    },
  });
}

export function useApproveVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (verificationId: string) => {
      const { data } = await api.post<{ message: string }>(`/admin/verifications/${verificationId}/approve`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all });
    },
  });
}

export function useRejectVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ verificationId, reason }: { verificationId: string; reason: string }) => {
      const { data } = await api.post<{ message: string }>(`/admin/verifications/${verificationId}/reject`, { reason });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all });
    },
  });
}

export function useSuspendCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ companyId, reason }: { companyId: string; reason: string }) => {
      const { data } = await api.post<{ message: string }>(`/admin/companies/${companyId}/suspend`, { reason });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all });
    },
  });
}

export function useUnsuspendCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (companyId: string) => {
      const { data } = await api.post<{ message: string }>(`/admin/companies/${companyId}/unsuspend`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all });
    },
  });
}

// Jobs hooks
export function useJobs(filters: JobFilters, page: number = 1, pageSize: number = 20) {
  return useQuery<PaginatedResponse<JobPosting>>({
    queryKey: queryKeys.jobs.list({ ...filters, page, pageSize }),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...Object.entries(filters).reduce((acc, [key, value]) => {
          if (value) acc[key] = value;
          return acc;
        }, {} as Record<string, string>),
      });
      const { data } = await api.get<PaginatedResponse<JobPosting>>(`/admin/jobs?${params}`);
      return data;
    },
  });
}

export function useJob(id: string) {
  return useQuery<JobPosting>({
    queryKey: queryKeys.jobs.detail(id),
    queryFn: async () => {
      const { data } = await api.get<JobPosting>(`/admin/jobs/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useFlagJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ jobId, reason }: { jobId: string; reason: string }) => {
      const { data } = await api.post<{ message: string }>(`/admin/jobs/${jobId}/flag`, { reason });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
    },
  });
}

export function useCloseJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) => {
      const { data } = await api.post<{ message: string }>(`/admin/jobs/${jobId}/close`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) => {
      const { data } = await api.delete<{ message: string }>(`/admin/jobs/${jobId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
    },
  });
}

// Reviews hooks
export function useReviews(filters: ReviewFilters, page: number = 1, pageSize: number = 20) {
  return useQuery<PaginatedResponse<Review>>({
    queryKey: queryKeys.reviews.list({ ...filters, page, pageSize }),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...Object.entries(filters).reduce((acc, [key, value]) => {
          if (value) acc[key] = value;
          return acc;
        }, {} as Record<string, string>),
      });
      const { data } = await api.get<PaginatedResponse<Review>>(`/admin/reviews?${params}`);
      return data;
    },
  });
}

export function useUnflagReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reviewId: string) => {
      const { data } = await api.post<{ message: string }>(`/admin/reviews/${reviewId}/unflag`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
    },
  });
}

export function useRemoveReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ reviewId, reason }: { reviewId: string; reason: string }) => {
      const { data } = await api.post<{ message: string }>(`/admin/reviews/${reviewId}/remove`, { reason });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
    },
  });
}

// Subscriptions hooks
export function useSubscriptions(filters: { status?: string; tier?: string }, page: number = 1, pageSize: number = 20) {
  return useQuery<PaginatedResponse<Subscription>>({
    queryKey: queryKeys.subscriptions.list({ ...filters, page, pageSize }),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...Object.entries(filters).reduce((acc, [key, value]) => {
          if (value) acc[key] = value;
          return acc;
        }, {} as Record<string, string>),
      });
      const { data } = await api.get<PaginatedResponse<Subscription>>(`/admin/subscriptions?${params}`);
      return data;
    },
  });
}

export function useSubscription(id: string) {
  return useQuery<Subscription>({
    queryKey: queryKeys.subscriptions.detail(id),
    queryFn: async () => {
      const { data } = await api.get<Subscription>(`/admin/subscriptions/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ subscriptionId, reason }: { subscriptionId: string; reason: string }) => {
      const { data } = await api.post<{ message: string }>(`/admin/subscriptions/${subscriptionId}/cancel`, { reason });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.all });
    },
  });
}

// IAP hooks
export function useIAPTransactions(filters: { status?: string; type?: string }, page: number = 1, pageSize: number = 20) {
  return useQuery<PaginatedResponse<IAPTransaction>>({
    queryKey: [...queryKeys.iap.transactions, filters, page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...Object.entries(filters).reduce((acc, [key, value]) => {
          if (value) acc[key] = value;
          return acc;
        }, {} as Record<string, string>),
      });
      const { data } = await api.get<PaginatedResponse<IAPTransaction>>(`/admin/iap/transactions?${params}`);
      return data;
    },
  });
}

export function useWebhookEvents(page: number = 1, pageSize: number = 20) {
  return useQuery<PaginatedResponse<WebhookEventType>>({
    queryKey: [...queryKeys.iap.webhooks, page, pageSize],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<WebhookEventType>>(`/admin/iap/webhooks?page=${page}&pageSize=${pageSize}`);
      return data;
    },
  });
}

export function useRetryWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (webhookId: string) => {
      const { data } = await api.post<{ message: string }>(`/admin/iap/webhooks/${webhookId}/retry`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.iap.webhooks });
    },
  });
}

// Trust hooks
export function useTrustEvents(page: number = 1, pageSize: number = 20) {
  return useQuery<PaginatedResponse<TrustEvent>>({
    queryKey: [...queryKeys.trust.events, page, pageSize],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<TrustEvent>>(`/admin/trust/events?page=${page}&pageSize=${pageSize}`);
      return data;
    },
  });
}

export function useLowTrustCompanies() {
  return useQuery<LowTrustCompany[]>({
    queryKey: queryKeys.trust.lowTrust,
    queryFn: async () => {
      const { data } = await api.get<LowTrustCompany[]>('/admin/trust/low-trust');
      return data;
    },
  });
}

export function useRecalculateTrustScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (companyId: string) => {
      const { data } = await api.post<{ message: string; score: number }>(`/admin/trust/${companyId}/recalculate`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trust.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all });
    },
  });
}

// Matches hooks
export function useMatches(filters: { status?: string }, page: number = 1, pageSize: number = 20) {
  return useQuery<PaginatedResponse<Match>>({
    queryKey: queryKeys.matches.list({ ...filters, page, pageSize }),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...Object.entries(filters).reduce((acc, [key, value]) => {
          if (value) acc[key] = value;
          return acc;
        }, {} as Record<string, string>),
      });
      const { data } = await api.get<PaginatedResponse<Match>>(`/admin/matches?${params}`);
      return data;
    },
  });
}

export function useMatchStats() {
  return useQuery<{
    totalMatches: number;
    pendingMatches: number;
    acceptedMatches: number;
    rejectedMatches: number;
    averageMatchScore: number;
  }>({
    queryKey: ['matches', 'stats'],
    queryFn: async () => {
      const { data } = await api.get<{
        totalMatches: number;
        pendingMatches: number;
        acceptedMatches: number;
        rejectedMatches: number;
        averageMatchScore: number;
      }>('/admin/matches/stats');
      return data;
    },
  });
}
