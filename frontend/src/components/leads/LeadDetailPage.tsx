import React, { useState } from 'react';
import { ChevronRight, FileText, Share2, Clock, UserCircle2 } from 'lucide-react';
import type { Lead } from '../../types';
import { Badge } from '../ui/Badge';
import { useUpdateLead, useDeleteLead } from '../../hooks/useLeads';
import { TransferLeadModal } from '../ui/TransferLeadModal';
import { ScheduleMeetingModal } from '../ui/ScheduleMeetingModal';
import toast from 'react-hot-toast';

interface LeadDetailPageProps {
  lead: Lead;
  onBack: () => void;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

const avatarColors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500'];
const getColor = (name: string) => avatarColors[name.charCodeAt(0) % avatarColors.length];

const timeline = [
  { icon: '🟡', title: 'Discovery Call Completed', desc: 'Discussed initial requirements and budget constraints.', date: 'Oct 24, 2:30 PM' },
  { icon: '🔵', title: 'Technical Proposal Sent', desc: 'Detailed PDF sent via email tracking link.', date: 'Oct 22, 11:15 AM' },
  { icon: '🔵', title: 'Lead Created', desc: 'Imported from LinkedIn Sales Navigator integration.', date: 'Oct 20, 09:00 AM' },
];

export const LeadDetailPage: React.FC<LeadDetailPageProps> = ({ lead, onBack }) => {
  const updateMutation = useUpdateLead();
  const deleteMutation = useDeleteLead();

  const [status, setStatus] = useState(lead.status);
  const [source, setSource] = useState(lead.source);
  const [email, setEmail] = useState(lead.email);
  const [notes, setNotes] = useState('Expressed interest in the Q3 scalability package. Concerned about integration time with legacy systems. Follow up requested by Tuesday morning.');
  const [timelineItems, setTimelineItems] = useState(timeline);
  const [noteInput, setNoteInput] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [meetingOpen, setMeetingOpen] = useState(false);

  const creator = typeof lead.createdBy === 'object' ? lead.createdBy : null;

  const handleSave = () => {
    updateMutation.mutate(
      { id: lead._id, name: lead.name, email, status, source },
      { onSuccess: () => toast.success('Lead updated') }
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(lead._id, {
      onSuccess: () => { toast.success('Lead deleted'); onBack(); },
    });
  };

  const handleAddNote = () => {
    if (!noteInput.trim()) return;
    const now = new Date();
    const formatted = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' +
      now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    setTimelineItems((prev) => [{ icon: '🟢', title: 'Activity Note', desc: noteInput.trim(), date: formatted }, ...prev]);
    setNoteInput('');
    setAddingNote(false);
    toast.success('Note added');
  };

  const handleScheduleMeeting = () => {
    setMeetingOpen(true);
  };

  const handleGenerateContract = () => {
    const content = [
      `CONTRACT DRAFT`,
      `==============`,
      `Lead: ${lead.name}`,
      `Email: ${lead.email}`,
      `Status: ${status}`,
      `Source: ${source}`,
      `Date: ${new Date().toLocaleDateString()}`,
      ``,
      `This document serves as a preliminary contract draft for the above lead.`,
      `Please review and finalize with your legal team before sending.`,
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contract-${lead.name.replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Contract draft downloaded');
  };

  const handleTransferLead = () => {
    setTransferOpen(true);
  };

  const handleTransferConfirm = (recipientEmail: string) => {
    toast.success(`Lead transfer request sent to ${recipientEmail}`);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <button onClick={onBack} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Leads</button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 dark:text-gray-100 font-medium">{lead.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-full ${getColor(lead.name)} flex items-center justify-center text-white text-lg font-bold shrink-0`}>
            {getInitials(lead.name)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{lead.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {creator?.name ? `Added by ${creator.name}` : 'Lead'} · {new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
          >
            Delete Lead
          </button>
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Lead Info + Timeline */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Lead Information */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Lead Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Lead Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as typeof status)}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Lead Source</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as typeof source)}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="Website">Website</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Referral">Referral</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Status</label>
                <div className="flex items-center h-10">
                  <Badge type="status" value={status} />
                </div>
              </div>
              <div className="col-span-2 flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                />
              </div>
            </div>
          </div>

          {/* Interaction Timeline */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Interaction Timeline</h2>
            <div className="flex flex-col gap-4">
              {timelineItems.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-lg shrink-0 mt-0.5">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.title}</p>
                      <p className="text-xs text-gray-400 shrink-0">{item.date}</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            {addingNote ? (
              <div className="mt-4 flex flex-col gap-2">
                <textarea
                  autoFocus
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Write your activity note..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddNote}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    Add Note
                  </button>
                  <button
                    onClick={() => { setAddingNote(false); setNoteInput(''); }}
                    className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingNote(true)}
                className="mt-4 w-full border border-dashed border-gray-300 dark:border-gray-600 rounded-lg py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
              >
                + Add Activity Note
              </button>
            )}
          </div>
        </div>

        {/* Right: Sales Performance + Quick Actions */}
        <div className="flex flex-col gap-5">
          {/* Sales Performance */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-3">Sales Performance</p>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-sm text-gray-600 dark:text-gray-400">Likelihood of Closing</p>
              <p className="text-sm font-semibold text-green-600">78%</p>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mb-4">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Deal Value</p>
                <p className="text-base font-bold text-gray-900 dark:text-gray-100 mt-0.5">$24.5k</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Days Active</p>
                <p className="text-base font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                  {Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / 86400000)}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-3">Quick Actions</p>
            <div className="flex flex-col gap-2">
              {[
                { icon: Clock, label: 'Schedule Meeting', action: handleScheduleMeeting },
                { icon: FileText, label: 'Generate Contract', action: handleGenerateContract },
                { icon: Share2, label: 'Transfer Lead', action: handleTransferLead },
              ].map(({ icon: Icon, label, action }) => (
                <button key={label} onClick={action} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 transition-colors text-left">
                  <Icon className="w-4 h-4 text-gray-400 shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Company Insights */}
          <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-3 right-3 text-gray-600">
              <UserCircle2 className="w-8 h-8 opacity-30" />
            </div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Company Insights</p>
            <p className="text-sm text-gray-300 leading-relaxed">
              Lead recently engaged with your pricing page. High intent signal detected based on activity patterns.
            </p>
            <button
              onClick={() => toast('Full report feature coming soon.', { icon: '📊' })}
              className="mt-3 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              VIEW FULL REPORT →
            </button>
          </div>
        </div>
      </div>

      <TransferLeadModal
        isOpen={transferOpen}
        onClose={() => setTransferOpen(false)}
        onConfirm={handleTransferConfirm}
      />
      <ScheduleMeetingModal
        isOpen={meetingOpen}
        onClose={() => setMeetingOpen(false)}
        leadName={lead.name}
        leadEmail={lead.email}
      />
    </div>
  );
};
