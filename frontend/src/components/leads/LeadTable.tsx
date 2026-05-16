import React, { useState, useRef, useEffect } from 'react';
import { Globe, Users, MoreVertical, Eye, Edit2, Trash2 } from 'lucide-react';
import type { Lead } from '../../types';
import { Badge } from '../ui/Badge';
import { useAuthStore } from '../../store/authStore';

interface LeadTableProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onView: (lead: Lead) => void;
}

const sourceIcon = (source: string) => {
  if (source === 'Website') return <Globe className="w-3.5 h-3.5 text-gray-400" />;
  if (source === 'Instagram') return <span className="text-pink-400 text-xs font-bold">IG</span>;
  return <Users className="w-3.5 h-3.5 text-orange-400" />;
};

const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

const avatarColors = [
  'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500',
  'bg-pink-500', 'bg-teal-500', 'bg-red-500', 'bg-indigo-500',
];

const getColor = (name: string) =>
  avatarColors[name.charCodeAt(0) % avatarColors.length];

const RowMenu: React.FC<{ lead: Lead; canEdit: boolean; onView: () => void; onEdit: () => void; onDelete: () => void }> = ({
  lead, canEdit, onView, onEdit, onDelete,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        aria-label={`Actions for ${lead.name}`}
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-20 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 text-sm">
          <button onClick={() => { onView(); setOpen(false); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Eye className="w-3.5 h-3.5" /> View Details
          </button>
          {canEdit && (
            <>
              <button onClick={() => { onEdit(); setOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Edit2 className="w-3.5 h-3.5" /> Edit Lead
              </button>
              <button onClick={() => { onDelete(); setOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export const LeadTable: React.FC<LeadTableProps> = ({ leads, onEdit, onDelete, onView }) => {
  const { user } = useAuthStore();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            {['NAME', 'EMAIL', 'STATUS', 'SOURCE', 'CREATED AT', ''].map((h, i) => (
              <th key={i} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const creator = typeof lead.createdBy === 'object' ? lead.createdBy : null;
            const canEdit = user?.role === 'admin' || (creator && creator._id === user?.id);

            return (
              <tr
                key={lead._id}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors cursor-pointer"
                onClick={() => onView(lead)}
              >
                {/* Name with avatar */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${getColor(lead.name)} flex items-center justify-center text-white text-xs font-semibold shrink-0`}>
                      {getInitials(lead.name)}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{lead.name}</span>
                  </div>
                </td>

                {/* Email */}
                <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400">{lead.email}</td>

                {/* Status */}
                <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                  <Badge type="status" value={lead.status} />
                </td>

                {/* Source */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                    {sourceIcon(lead.source)}
                    {lead.source}
                  </div>
                </td>

                {/* Date */}
                <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400">
                  {new Date(lead.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: '2-digit', day: '2-digit',
                  })}{' '}
                  {new Date(lead.createdAt).toLocaleTimeString('en-US', {
                    hour: '2-digit', minute: '2-digit', hour12: false,
                  })}
                </td>

                {/* Actions */}
                <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                  <RowMenu
                    lead={lead}
                    canEdit={!!canEdit}
                    onView={() => onView(lead)}
                    onEdit={() => onEdit(lead)}
                    onDelete={() => onDelete(lead)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
