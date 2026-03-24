'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import { useThemeStore } from '@/store/useThemeStore';

export const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const hydrate = useThemeStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Define paths where Sidebar should NOT be shown
  const authPaths = ['/login', '/signup', '/signin'];
  const showSidebar = !authPaths.some(path => pathname?.startsWith(path));

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      {showSidebar && <Sidebar />}
      <main className={showSidebar ? "flex-1 transition-all duration-300 sm:ml-64" : "flex-1"}>
        <div className={showSidebar ? "p-4 sm:p-8" : ""}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default LayoutWrapper;
