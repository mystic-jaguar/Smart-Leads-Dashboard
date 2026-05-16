import React from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import type { Lead } from '../../types';

interface LeadDetailModalProps {
  lead: Lead | null;
  onClose: () => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ lead, onClose }) => {
  if (!lead) return null;
  const creator = typeof lead.createdBy === 'object' ? lead.createdBy : null;

  return (
    <Modal isOpen={!!lead} onClose={onClose} title="Lead Details">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Name</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{lead.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{lead.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
            <Badge type="status" value={lead.status} />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Source</p>
            <Badge type="source" value={lead.source} />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Created By</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{creator?.name || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Created At</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {new Date(lead.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
