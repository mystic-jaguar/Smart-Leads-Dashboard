import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
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

// Fetches all leads for dashboard analytics by paginating in the background.
// Returns partial data immediately (first page) and keeps accumulating.
export const useDashboardLeads = (since: string) => {
  const PAGE_SIZE = 50;

  const query = useInfiniteQuery<LeadsResponse>({
    queryKey: ['dashboard-leads', since],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({
        page: String(pageParam),
        limit: String(PAGE_SIZE),
        sort: 'latest',
        since,
      });
      const { data } = await api.get(`/leads?${params.toString()}`);
      return { data: data.data, pagination: data.pagination };
    },
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage ? lastPage.pagination.page + 1 : undefined,
    staleTime: 30_000,
  });

  // Auto-fetch all remaining pages sequentially in the background
  useEffect(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [query.hasNextPage, query.isFetchingNextPage, query.data]);

  // Flatten all fetched pages into a single leads array
  const leads: Lead[] = query.data?.pages.flatMap((p) => p.data) ?? [];
  const total = query.data?.pages[0]?.pagination.total ?? 0;
  const isLoadingFirst = query.isLoading;
  const isFetchingMore = query.isFetchingNextPage || query.hasNextPage;

  return { leads, total, isLoadingFirst, isFetchingMore };
};
