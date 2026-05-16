import React, { useState, useCallback } from 'react';
import { Download, Plus, TrendingUp, Settings2, Zap } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { LeadFiltersBar } from '../components/leads/LeadFilters';
import { LeadTable } from '../components/leads/LeadTable';
import { Pagination } from '../components/leads/Pagination';
import { LeadForm } from '../components/leads/LeadForm';
import { LeadDetailPage } from '../components/leads/LeadDetailPage';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { useLeads, useCreateLead, useUpdateLead, useDeleteLead } from '../hooks/useLeads';
import { useDebounce } from '../hooks/useDebounce';
import type { Lead, LeadFilters } from '../types';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const DEFAULT_FILTERS: LeadFilters = { page: 1, limit: 10, sort: 'latest', status: '', source: '', search: '' };

const LeadsPage: React.FC = () => {
  const [filters, setFilters] = useState<LeadFilters>(DEFAULT_FILTERS);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);
  const activeFilters = { ...filters, search: debouncedSearch };

  const [createOpen, setCreateOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [viewLead, setViewLead] = useState<Lead | null>(null);
  const [deleteLead, setDeleteLead] = useState<Lead | null>(null);

  const { data, isLoading, isError } = useLeads(activeFilters);
  const createMutation = useCreateLead();
  const updateMutation = useUpdateLead();
  const deleteMutation = useDeleteLead();

  const handleFilterChange = useCallback((key: keyof LeadFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  }, []);

  const handleReset = () => { setFilters(DEFAULT_FILTERS); setSearchInput(''); };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (activeFilters.status) params.set('status', activeFilters.status);
      if (activeFilters.source) params.set('source', activeFilters.source);
      if (activeFilters.search) params.set('search', activeFilters.search);
      if (activeFilters.sort) params.set('sort', activeFilters.sort);
      const res = await api.get(`/leads/export?${params.toString()}`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = 'leads.csv'; a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV exported');
    } catch { toast.error('Export failed'); }
  };

  // Computed stats from current data
  const total = data?.pagination.total ?? 0;
  const qualifiedCount = data?.data.filter((l) => l.status === 'Qualified').length ?? 0;
  const conversionRate = total > 0 ? ((qualifiedCount / total) * 100).toFixed(1) : '0.0';

  if (viewLead) {
    return (
      <Layout>
        <LeadDetailPage
          lead={viewLead}
          onBack={() => setViewLead(null)}
          onEdit={(lead) => { setViewLead(null); setEditLead(lead); }}
          onDelete={(lead) => { setViewLead(null); setDeleteLead(lead); }}
        />
      </Layout>
    );
  }

  return (
    <Layout
      searchPlaceholder="Search across records..."
      searchValue={searchInput}
      onSearch={setSearchInput}
    >
      <div className="flex flex-col gap-5">
        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Leads Management</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage and track your customer acquisition pipeline.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              CSV Export
            </button>
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Lead
            </button>
          </div>
        </div>

        {/* Filters */}
        <LeadFiltersBar
          filters={filters}
          searchInput={searchInput}
          onSearchChange={setSearchInput}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
        />

        {/* Table card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {isLoading ? (
            <div className="py-24 flex justify-center"><Spinner size="lg" /></div>
          ) : isError ? (
            <div className="py-24 text-center text-red-500 text-sm">Failed to load leads. Please try again.</div>
          ) : !data?.data.length ? (
            <div className="py-24 text-center">
              <p className="text-gray-400 dark:text-gray-500 font-medium">No leads found</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Try adjusting your filters or add a new lead</p>
            </div>
          ) : (
            <>
              <LeadTable
                leads={data.data}
                onEdit={setEditLead}
                onDelete={setDeleteLead}
                onView={setViewLead}
              />
              <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                <Pagination
                  pagination={data.pagination}
                  onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
                />
              </div>
            </>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wide">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{conversionRate}%</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shrink-0">
              <Settings2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-green-600 uppercase tracking-wide">Qualified Leads</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data?.data.filter(l => l.status === 'Qualified').length ?? 0}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-blue-500 uppercase tracking-wide">Avg. Response Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">1.2h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add New Lead">
        <LeadForm
          onSubmit={(d) => createMutation.mutate(d, { onSuccess: () => setCreateOpen(false) })}
          loading={createMutation.isPending}
          onCancel={() => setCreateOpen(false)}
        />
      </Modal>

      <Modal isOpen={!!editLead} onClose={() => setEditLead(null)} title="Edit Lead">
        {editLead && (
          <LeadForm
            defaultValues={editLead}
            onSubmit={(d) => updateMutation.mutate({ id: editLead._id, ...d }, { onSuccess: () => setEditLead(null) })}
            loading={updateMutation.isPending}
            onCancel={() => setEditLead(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteLead}
        onClose={() => setDeleteLead(null)}
        onConfirm={() => deleteMutation.mutate(deleteLead!._id, { onSuccess: () => setDeleteLead(null) })}
        title="Delete Lead"
        message={`Are you sure you want to delete "${deleteLead?.name}"? This action cannot be undone.`}
        loading={deleteMutation.isPending}
      />
    </Layout>
  );
};

export default LeadsPage;
