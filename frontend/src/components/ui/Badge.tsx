import React from 'react';
import type { LeadStatus, LeadSource } from '../../types';

const statusStyles: Record<LeadStatus, string> = {
  New: 'border border-blue-300 text-blue-600 dark:border-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
  Contacted: 'border border-yellow-300 text-yellow-600 dark:border-yellow-500 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
  Qualified: 'border border-green-300 text-green-600 dark:border-green-500 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
  Lost: 'border border-red-300 text-red-500 dark:border-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
};

const sourceStyles: Record<LeadSource, string> = {
  Website: 'border border-purple-300 text-purple-600 dark:border-purple-500 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
  Instagram: 'border border-pink-300 text-pink-600 dark:border-pink-500 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20',
  Referral: 'border border-orange-300 text-orange-600 dark:border-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20',
};

interface BadgeProps {
  type: 'status' | 'source';
  value: LeadStatus | LeadSource;
}

export const Badge: React.FC<BadgeProps> = ({ type, value }) => {
  const style = type === 'status'
    ? statusStyles[value as LeadStatus]
    : sourceStyles[value as LeadSource];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide ${style}`}>
      {value}
    </span>
  );
};
