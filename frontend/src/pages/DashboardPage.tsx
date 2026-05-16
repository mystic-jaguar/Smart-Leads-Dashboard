import React, { useState } from 'react';
import { TrendingUp, Zap, Users, Clock, Download, MoreVertical, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { useLeads } from '../hooks/useLeads';
import { Spinner } from '../components/ui/Spinner';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import type { LeadStatus, LeadSource } from '../types';

const DATE_RANGES = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Year'] as const;
type DateRange = typeof DATE_RANGES[number];

const statusColors: Record<LeadStatus, string> = {
  New: 'bg-blue-500',
  Contacted: 'bg-yellow-400',
  Qualified: 'bg-green-500',
  Lost: 'bg-red-400',
};

const sourceColors: Record<LeadSource, string> = {
  Website: 'bg-blue-600',
  Instagram: 'bg-purple-500',
  Referral: 'bg-teal-500',
};

const recentActivity = [
  { name: 'Sarah Jenkins', action: 'was added as a new lead', time: '2m ago' },
  { name: 'Robert Wong', action: 'status changed to Qualified', time: '15m ago' },
  { name: 'Maria Lopez', action: 'was contacted via email', time: '1h ago' },
  { name: 'David Park', action: 'was added as a new lead', time: '2h ago' },
];

const campaigns = [
  { name: 'Q4 Outreach', source: 'Website', leads: 342, rate: '28.4%' },
  { name: 'Social Push', source: 'Instagram', leads: 218, rate: '19.2%' },
  { name: 'Partner Refs', source: 'Referral', leads: 156, rate: '34.1%' },
];

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange>('Last 30 Days');
  const [rangeOpen, setRangeOpen] = useState(false);
  const { data, isLoading } = useLeads({ page: 1, limit: 50, sort: 'latest' });

  const leads = data?.data ?? [];
  const total = data?.pagination.total ?? 0;

  const statusCounts = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1;
    return acc;
  }, {});

  const sourceCounts = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.source] = (acc[l.source] || 0) + 1;
    return acc;
  }, {});

  const qualified = statusCounts['Qualified'] || 0;
  const convRate = total > 0 ? ((qualified / total) * 100).toFixed(1) : '0.0';
  const newThisWeek = leads.filter((l) => {
    const d = new Date(l.createdAt);
    const now = new Date();
    return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
  }).length;

  const statCards = [
    { label: 'Total Leads', value: total.toLocaleString(), change: '+12.5%', positive: true, icon: TrendingUp, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Conversion Rate', value: `${convRate}%`, change: '+3.1%', positive: true, icon: Zap, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
    { label: 'New This Week', value: newThisWeek.toString(), change: '-2.4%', positive: false, icon: Users, color: 'text-blue-400 bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Response Time', value: '4.2h', change: 'Avg 12h', positive: true, icon: Clock, color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' },
  ];

  const handleExport = async () => {
    try {
      const res = await api.get('/leads/export', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = 'leads-export.csv'; a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV exported');
    } catch { toast.error('Export failed'); }
  };

  const maxStatusCount = Math.max(...Object.values(statusCounts), 1);
  const totalSource = Object.values(sourceCounts).reduce((a, b) => a + b, 0) || 1;

  return (
    <Layout searchPlaceholder="Quick search...">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics Overview</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Real-time performance metrics for your lead pipeline.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setRangeOpen((o) => !o)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Clock className="w-4 h-4" />
                {dateRange}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {rangeOpen && (
                <div className="absolute right-0 top-10 z-20 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 text-sm">
                  {DATE_RANGES.map((r) => (
                    <button
                      key={r}
                      onClick={() => { setDateRange(r); setRangeOpen(false); }}
                      className={`w-full text-left px-4 py-2 transition-colors ${r === dateRange ? 'text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>

        {/* Stat cards */}
        {isLoading ? (
          <div className="py-12 flex justify-center"><Spinner size="lg" /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map(({ label, value, change, positive, icon: Icon, color }) => (
                <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${positive ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400'}`}>
                      {change}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Status Distribution bar chart */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Lead Status Distribution</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Breakdown of current leads across the funnel</p>
                  </div>
                  <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><MoreVertical className="w-4 h-4" /></button>
                </div>
                <div className="flex items-end gap-6 h-40 px-4">
                  {(['New', 'Contacted', 'Qualified', 'Lost'] as LeadStatus[]).map((s) => {
                    const count = statusCounts[s] || 0;
                    const heightPct = (count / maxStatusCount) * 100;
                    return (
                      <div key={s} className="flex-1 flex flex-col items-center gap-2">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{count}</span>
                        <div className="w-full flex items-end" style={{ height: '100px' }}>
                          <div
                            className={`w-full rounded-t-lg ${statusColors[s]} transition-all duration-500`}
                            style={{ height: `${Math.max(heightPct, 4)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{s}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Leads by Source donut-style */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">Leads by Source</h2>
                <p className="text-xs text-gray-400 mb-4">Where your leads are coming from</p>

                {/* Visual ring */}
                <div className="flex justify-center mb-4">
                  <div className="relative w-28 h-28">
                    <svg viewBox="0 0 36 36" className="w-28 h-28 -rotate-90">
                      {(() => {
                        const sources = ['Website', 'Instagram', 'Referral'] as LeadSource[];
                        const colors = ['#2563eb', '#8b5cf6', '#14b8a6'];
                        let offset = 0;
                        return sources.map((src, i) => {
                          const pct = ((sourceCounts[src] || 0) / totalSource) * 100;
                          const el = (
                            <circle
                              key={src}
                              cx="18" cy="18" r="15.9"
                              fill="none"
                              stroke={colors[i]}
                              strokeWidth="3.5"
                              strokeDasharray={`${pct} ${100 - pct}`}
                              strokeDashoffset={-offset}
                            />
                          );
                          offset += pct;
                          return el;
                        });
                      })()}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{total > 999 ? `${(total / 1000).toFixed(1)}k` : total}</p>
                      <p className="text-[10px] text-gray-400">Total</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {(['Website', 'Instagram', 'Referral'] as LeadSource[]).map((src) => {
                    const pct = totalSource > 0 ? Math.round(((sourceCounts[src] || 0) / totalSource) * 100) : 0;
                    return (
                      <div key={src} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${sourceColors[src]}`} />
                          <span className="text-gray-600 dark:text-gray-400">{src}</span>
                        </div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Recent Activity */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h2>
                  <button onClick={() => navigate('/leads')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">View All</button>
                </div>
                <div className="flex flex-col gap-3">
                  {recentActivity.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-medium">{item.name}</span> {item.action}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Campaign Performance */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Campaign Performance</h2>
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
                    ))}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <th className="text-left text-xs font-semibold text-gray-400 pb-2">Campaign Name</th>
                        <th className="text-left text-xs font-semibold text-gray-400 pb-2">Source</th>
                        <th className="text-right text-xs font-semibold text-gray-400 pb-2">Leads</th>
                        <th className="text-right text-xs font-semibold text-gray-400 pb-2">Conv. Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                      {campaigns.map((c) => (
                        <tr key={c.name}>
                          <td className="py-2.5 font-medium text-gray-800 dark:text-gray-200">{c.name}</td>
                          <td className="py-2.5 text-gray-500 dark:text-gray-400">{c.source}</td>
                          <td className="py-2.5 text-right text-gray-700 dark:text-gray-300">{c.leads}</td>
                          <td className="py-2.5 text-right font-medium text-green-600">{c.rate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default DashboardPage;
