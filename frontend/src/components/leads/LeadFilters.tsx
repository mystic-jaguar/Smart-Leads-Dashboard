import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import type { LeadFilters as Filters } from '../../types';

interface LeadFiltersProps {
  filters: Filters;
  searchInput: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (key: keyof Filters, value: string) => void;
  onReset: () => void;
}

const statusOptions = [
  { value: 'New', label: 'New' },
  { value: 'Contacted', label: 'Contacted' },
  { value: 'Qualified', label: 'Qualified' },
  { value: 'Lost', label: 'Lost' },
];

const sourceOptions = [
  { value: 'Website', label: 'Website' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'Referral', label: 'Referral' },
];

const sortOptions = [
  { value: 'latest', label: 'Latest First' },
  { value: 'oldest', label: 'Oldest First' },
];

export const LeadFiltersBar: React.FC<LeadFiltersProps> = ({
  filters, searchInput, onSearchChange, onFilterChange, onReset,
}) => {
  const hasActiveFilters = filters.status || filters.source || filters.search || filters.sort !== 'latest';

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="flex-1 min-w-[200px]">
        <Input
          placeholder="Search by name or email..."
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />
      </div>
      <Select
        value={filters.status || ''}
        onChange={(e) => onFilterChange('status', e.target.value)}
        options={statusOptions}
        placeholder="All Statuses"
        className="min-w-[140px]"
      />
      <Select
        value={filters.source || ''}
        onChange={(e) => onFilterChange('source', e.target.value)}
        options={sourceOptions}
        placeholder="All Sources"
        className="min-w-[140px]"
      />
      <Select
        value={filters.sort || 'latest'}
        onChange={(e) => onFilterChange('sort', e.target.value)}
        options={sortOptions}
        className="min-w-[140px]"
      />
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onReset} icon={<X className="w-4 h-4" />}>
          Clear
        </Button>
      )}
    </div>
  );
};
