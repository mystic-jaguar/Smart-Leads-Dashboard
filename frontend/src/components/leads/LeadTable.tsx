import React from 'react';
import { Edit2, Trash2, Eye } from 'lucide-react';
import type { Lead } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/authStore';

interface LeadTableProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onView: (lead: Lead) => void;
}

export const LeadTable: React.FC<LeadTableProps> = ({ leads, onEdit, onDelete, onView }) => {
  const { user } = useAuthStore();

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800/50">
          <tr>
            {['Name', 'Email', 'Status', 'Source', 'Created', 'Actions'].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {leads.map((lead) => {
            const creator = typeof lead.createdBy === 'object' ? lead.createdBy : null;
            const canEdit =
              user?.role === 'admin' ||
              (creator && creator._id === user?.id);

            return (
              <tr
                key={lead._id}
                className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{lead.name}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{lead.email}</td>
                <td className="px-4 py-3">
                  <Badge type="status" value={lead.status} />
                </td>
                <td className="px-4 py-3">
                  <Badge type="source" value={lead.source} />
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onView(lead)} aria-label="View lead">
                      <Eye className="w-4 h-4" />
                    </Button>
                    {canEdit && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => onEdit(lead)} aria-label="Edit lead">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onDelete(lead)} aria-label="Delete lead"
                          className="text-red-500 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
