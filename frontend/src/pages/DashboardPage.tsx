import React, { useState, useCallback } from 'react';
import { Plus, Download } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { LeadFiltersBar } from '../components/leads/LeadFilters';
import { LeadTable } from '../components/leads/LeadTable';
import { Pagination } from '../components/leads/Pagination';
import { LeadForm } from '../components/leads/LeadForm';
import { LeadDetailModal } from '../components/leads/LeadDetailModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { useLeads, useCreateLead, useUpdateLead, useDeleteLead } from '../hooks/useLeads';
import { useDebounce } from '../hooks/useDebounce';
import type { Lead, LeadFilters } from '../types';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const DEFAULT_FILTERS: LeadFilters = { page: 1, limit: 10, sort: 'latest', status: '', source: '', search: '' };

const DashboardPage: React.FC = () => {
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

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchInput('');
  };

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
      a.href = url;
      a.download = 'leads.csv';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV exported');
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Leads</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {data?.pagination.total ?? 0} total leads
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleExport} icon={<Download className="w-4 h-4" />}>
              Export CSV
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)} icon={<Plus className="w-4 h-4" />}>
              Add Lead
            </Button>
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

        {/* Table */}
        {isLoading ? (
          <div className="py-20"><Spinner size="lg" /></div>
        ) : isError ? (
          <div className="py-20 text-center text-red-500">Failed to load leads. Please try again.</div>
        ) : !data?.data.length ? (
          <div className="py-20 text-center">
            <p className="text-gray-400 dark:text-gray-500 text-lg">No leads found</p>
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
            <Pagination
              pagination={data.pagination}
              onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
            />
          </>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add New Lead">
        <LeadForm
          onSubmit={(data) => createMutation.mutate(data, { onSuccess: () => setCreateOpen(false) })}
          loading={createMutation.isPending}
          onCancel={() => setCreateOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editLead} onClose={() => setEditLead(null)} title="Edit Lead">
        {editLead && (
          <LeadForm
            defaultValues={editLead}
            onSubmit={(data) =>
              updateMutation.mutate({ id: editLead._id, ...data }, { onSuccess: () => setEditLead(null) })
            }
            loading={updateMutation.isPending}
            onCancel={() => setEditLead(null)}
          />
        )}
      </Modal>

      {/* View Modal */}
      <LeadDetailModal lead={viewLead} onClose={() => setViewLead(null)} />

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteLead}
        onClose={() => setDeleteLead(null)}
        onConfirm={() =>
          deleteMutation.mutate(deleteLead!._id, { onSuccess: () => setDeleteLead(null) })
        }
        title="Delete Lead"
        message={`Are you sure you want to delete "${deleteLead?.name}"? This action cannot be undone.`}
        loading={deleteMutation.isPending}
      />
    </Layout>
  );
};

export default DashboardPage;
