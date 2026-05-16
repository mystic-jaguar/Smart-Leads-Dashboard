import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface LayoutProps {
  children: React.ReactNode;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  searchValue?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, searchPlaceholder, onSearch, searchValue }) => (
  <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
    <Sidebar />
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <TopBar searchPlaceholder={searchPlaceholder} onSearch={onSearch} searchValue={searchValue} />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  </div>
);
