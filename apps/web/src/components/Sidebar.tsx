'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  User,
  ChevronRight,
  GraduationCap,
  Settings
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const subjects = [
  { name: 'Mathematics', slug: 'mathematics' },
  { name: 'Physics', slug: 'physics' },
  { name: 'Philosophy', slug: 'philosophy' },
  { name: 'History', slug: 'history' },
];

export const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Progress', href: '/progress', icon: BarChart3 },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const isActive = (path: string) => pathname === path;
  const isLearnActive = pathname?.startsWith('/learn');

  return (
    <aside
      className="fixed left-0 top-0 z-40 h-screen w-64 transition-transform sm:translate-x-0"
      style={{
        backgroundColor: 'var(--surface)',
        borderRight: '1px solid var(--border)',
      }}
    >
      <div className="flex h-full flex-col px-3 py-6">
        {/* Brand */}
        <div className="mb-8 flex items-center px-2">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--background)' }}
          >
            <GraduationCap size={24} />
          </div>
          <span className="ml-3 text-xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
            Socratic AI
          </span>
        </div>

        <nav className="flex flex-1 flex-col space-y-2">
          {/* Main Navigation */}
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                )}
                style={{
                  backgroundColor: active ? 'var(--accent)' : 'transparent',
                  color: active ? 'var(--background)' : 'var(--muted)',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--foreground)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--muted)';
                  }
                }}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}

          {/* Learn Section */}
          <div className="pt-4">
            <p
              className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--muted)', opacity: 0.6 }}
            >
              Learn
            </p>
            <div className="space-y-1">
              <Link
                href="/learn"
                className="group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: isLearnActive && pathname === '/learn' ? 'var(--accent)' : 'transparent',
                  color: isLearnActive && pathname === '/learn' ? 'var(--background)' : 'var(--muted)',
                }}
              >
                <BookOpen className="mr-3 h-5 w-5" />
                Overview
              </Link>

              <div className="ml-4 mt-2 space-y-1 pl-4" style={{ borderLeft: '1px solid var(--border)' }}>
                {subjects.map((subject) => {
                  const href = `/learn/${subject.slug}`;
                  const active = isActive(href);
                  return (
                    <Link
                      key={subject.slug}
                      href={href}
                      className="flex items-center rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
                      style={{
                        color: active ? 'var(--accent)' : 'var(--muted)',
                        fontWeight: active ? '600' : '500',
                      }}
                    >
                      {active && <ChevronRight className="mr-1 h-3 w-3" />}
                      {subject.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="pt-4">
            <p
              className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--muted)', opacity: 0.6 }}
            >
              System
            </p>
            <Link
              href="/settings"
              className="group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              style={{
                backgroundColor: isActive('/settings') ? 'var(--accent)' : 'transparent',
                color: isActive('/settings') ? 'var(--background)' : 'var(--muted)',
              }}
            >
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </Link>
          </div>
        </nav>

        {/* Footer */}
        <div className="mt-auto rounded-xl p-4" style={{ backgroundColor: 'var(--background)' }}>
          <div className="flex items-center space-x-3">
            <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Socratic Engine Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
