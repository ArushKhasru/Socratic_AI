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
  const authPaths = ['/signin', '/signup'];
  const chatPaths = ['/learn/'];
  const landingPaths = ['/'];
  const showSidebar = !authPaths.some(path => pathname?.startsWith(path)) &&
    !chatPaths.some(path => pathname?.startsWith(path)) &&
    !landingPaths.includes(pathname || '');

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      {showSidebar && <Sidebar />}
      <main className={showSidebar ? "min-w-0 flex-1 transition-all duration-300 md:ml-72 lg:ml-80" : "min-w-0 flex-1"}>
        <div className="h-full w-full min-w-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default LayoutWrapper;
