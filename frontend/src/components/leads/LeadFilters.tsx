import React from 'react';
import { Search, X } from 'lucide-react';
import type { LeadFilters as Filters } from '../../types';

interface LeadFiltersProps {
  filters: Filters;
  searchInput: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (key: keyof Filters, value: string) => void;
  onReset: () => void;
}

const selectCls = 'text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition';

export const LeadFiltersBar: React.FC<LeadFiltersProps> = ({
  filters, searchInput, onSearchChange, onFilterChange, onReset,
}) => {
  const hasActiveFilters = filters.status || filters.source || filters.search || filters.sort !== 'latest';

  return (
    <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[180px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Filter by name or email..."
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">STATUS</span>
        <select
          value={filters.status || ''}
          onChange={(e) => onFilterChange('status', e.target.value)}
          className={selectCls}
        >
          <option value="">All Statuses</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Lost">Lost</option>
        </select>
      </div>

      {/* Source */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">SOURCE</span>
        <select
          value={filters.source || ''}
          onChange={(e) => onFilterChange('source', e.target.value)}
          className={selectCls}
        >
          <option value="">All Sources</option>
          <option value="Website">Website</option>
          <option value="Instagram">Instagram</option>
          <option value="Referral">Referral</option>
        </select>
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">SORT BY</span>
        <select
          value={filters.sort || 'latest'}
          onChange={(e) => onFilterChange('sort', e.target.value)}
          className={selectCls}
        >
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      {/* Clear */}
      {hasActiveFilters && (
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium transition-colors ml-auto"
        >
          <X className="w-3.5 h-3.5" />
          Clear Filters
        </button>
      )}
    </div>
  );
};
