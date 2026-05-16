import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import type { Lead, LeadFilters, LeadsResponse } from '../types';
import toast from 'react-hot-toast';

export const useLeads = (filters: LeadFilters) => {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.status) params.set('status', filters.status);
  if (filters.source) params.set('source', filters.source);
  if (filters.search) params.set('search', filters.search);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.since) params.set('since', filters.since);

  return useQuery<LeadsResponse>({
    queryKey: ['leads', filters],
    queryFn: async () => {
      const { data } = await api.get(`/leads?${params.toString()}`);
      return { data: data.data, pagination: data.pagination };
    },
  });
};

export const useLead = (id: string) =>
  useQuery<Lead>({
    queryKey: ['lead', id],
    queryFn: async () => {
      const { data } = await api.get(`/leads/${id}`);
      return data.data;
    },
    enabled: !!id,
  });

export const useCreateLead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Lead, '_id' | 'createdBy' | 'createdAt' | 'updatedAt'>) =>
      api.post('/leads', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead created successfully');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message || 'Failed to create lead');
    },
  });
};

export const useUpdateLead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<Lead> & { id: string }) =>
      api.put(`/leads/${id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead updated successfully');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message || 'Failed to update lead');
    },
  });
};

export const useDeleteLead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/leads/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead deleted');
    },
    onError: () => toast.error('Failed to delete lead'),
  });
};

export interface DashboardStats {
  total: number;
  newThisWeek: number;
  statusCounts: { New: number; Contacted: number; Qualified: number; Lost: number };
  sourceCounts: { Website: number; Instagram: number; Referral: number };
}

// Single aggregation call — returns pre-computed stats instantly
export const useDashboardStats = (since: string) =>
  useQuery<DashboardStats>({
    queryKey: ['dashboard-stats', since],
    queryFn: async () => {
      const { data } = await api.get(`/leads/stats?since=${encodeURIComponent(since)}`);
      return data.data;
    },
    staleTime: 30_000,
  });
