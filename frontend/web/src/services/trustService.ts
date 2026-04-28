import api, { buildParams } from '@/lib/api';
import type { TrustEvent, LowTrustCompany, PaginatedResponse } from '@/types';

export const trustService = {
  events: async (
    page: number = 1,
    pageSize: number = 20,
    signal?: AbortSignal
  ): Promise<PaginatedResponse<TrustEvent>> => {
    const params = buildParams({ page, pageSize });
    const { data } = await api.get<{ success: boolean; data: PaginatedResponse<TrustEvent> }>(
      `/admin/trust/events?${params}`,
      { signal }
    );
    return data.data;
  },

  lowTrustCompanies: async (signal?: AbortSignal): Promise<LowTrustCompany[]> => {
    const { data } = await api.get<{ success: boolean; data: LowTrustCompany[] }>(
      '/admin/trust/low-trust-companies',
      { signal }
    );
    return data.data || [];
  },

  companyHistory: async (companyId: string, signal?: AbortSignal): Promise<TrustEvent[]> => {
    const { data } = await api.get<{ success: boolean; data: TrustEvent[] }>(
      `/admin/trust/companies/${companyId}/history`,
      { signal }
    );
    return data.data || [];
  },

  recalculateTrustScore: async (companyId: string): Promise<{ message: string; score: number }> => {
    const { data } = await api.post<{ success: boolean; message: string; data: { score: number } }>(
      `/admin/trust/companies/${companyId}/recalculate`
    );
    return { message: data.message, score: data.data.score };
  },

  adjustTrustScore: async (
    companyId: string,
    score: number,
    reason: string
  ): Promise<{ message: string }> => {
    const { data } = await api.post<{ success: boolean; message: string }>(
      `/admin/trust/companies/${companyId}/adjust`,
      { score, reason }
    );
    return { message: data.message };
  },
};
