import React from 'react';
import { Clock, Copy } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import toast from 'react-hot-toast';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadName: string;
  leadEmail: string;
}

export const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  isOpen, onClose, leadName, leadEmail,
}) => {
  const subject = `Meeting with ${leadName}`;
  const body = `Hi,\n\nI'd like to schedule a meeting to discuss your needs.\n\nBest regards`;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(leadEmail);
    toast.success('Email copied to clipboard');
  };

  const handleOpenClient = () => {
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    window.location.href = `mailto:${leadEmail}?subject=${encodedSubject}&body=${encodedBody}`;
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule Meeting" size="sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Send a meeting request to <span className="font-medium text-gray-800 dark:text-gray-200">{leadName}</span>.
          </p>
        </div>
        <div className="flex flex-col gap-3 bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-400 uppercase tracking-wide">To</span>
            <div className="flex items-center justify-between gap-2">
              <span className="text-gray-800 dark:text-gray-200">{leadEmail}</span>
              <button onClick={handleCopyEmail} className="text-gray-400 hover:text-blue-500 transition-colors" aria-label="Copy email">
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-400 uppercase tracking-wide">Subject</span>
            <span className="text-gray-800 dark:text-gray-200">{subject}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-400 uppercase tracking-wide">Body</span>
            <span className="text-gray-600 dark:text-gray-400 whitespace-pre-line">{body}</span>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleOpenClient}>Open Email Client</Button>
        </div>
      </div>
    </Modal>
  );
};
