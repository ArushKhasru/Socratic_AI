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
      className="panel-surface fixed top-0 left-0 z-40 h-screen w-64 overflow-hidden"
      style={{ borderRight: '1px solid var(--border)' }}
    >
      <div className="absolute inset-x-0 top-0 h-32 opacity-70" style={{ background: 'radial-gradient(circle at top, var(--accent-soft) 0%, transparent 72%)' }} />
      <div className="relative flex h-full flex-col px-3 py-6">
        <div className="mb-8 flex items-center px-2">
          <div
            className="accent-halo flex h-11 w-11 items-center justify-center rounded-2xl shadow-tonal"
            style={{ backgroundColor: 'var(--surface-alt)', color: 'var(--accent)' }}
          >
            <GraduationCap size={24} />
          </div>
          <div className="ml-3">
            <div className="text-xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
              Socratic AI
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ color: 'var(--muted)' }}>
              Guided Learning
            </div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col space-y-2">
          {navItems.map((item, index) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'interactive-card reveal-up flex items-center rounded-2xl px-4 py-3 text-sm font-medium',
                  index === 0 && 'stagger-1',
                  index === 1 && 'stagger-2',
                  index === 2 && 'stagger-3'
                )}
                style={{
                  background: active ? 'linear-gradient(135deg, var(--accent-soft), transparent)' : 'transparent',
                  color: active ? 'var(--foreground)' : 'var(--muted)',
                  border: `1px solid ${active ? 'color-mix(in srgb, var(--accent) 42%, var(--border))' : 'transparent'}`,
                }}
              >
                <item.icon className={cn('mr-3 h-5 w-5 transition-transform duration-200', active && 'scale-110')} />
                <span className="flex-1">{item.name}</span>
                {active && <div className="h-2 w-2 rounded-full soft-pulse" style={{ backgroundColor: 'var(--accent)' }} />}
              </Link>
            );
          })}

          <div className="pt-4">
            <p
              className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.24em]"
              style={{ color: 'var(--muted)', opacity: 0.7 }}
            >
              Learn
            </p>
            <div className="space-y-2">
              <Link
                href="/learn"
                className="interactive-card flex items-center rounded-2xl px-4 py-3 text-sm font-medium"
                style={{
                  background: isLearnActive && pathname === '/learn' ? 'linear-gradient(135deg, var(--accent-soft), transparent)' : 'transparent',
                  color: isLearnActive && pathname === '/learn' ? 'var(--foreground)' : 'var(--muted)',
                  border: `1px solid ${isLearnActive && pathname === '/learn' ? 'color-mix(in srgb, var(--accent) 42%, var(--border))' : 'transparent'}`,
                }}
              >
                <BookOpen className="mr-3 h-5 w-5" />
                Overview
              </Link>

              <div className="ml-4 mt-2 space-y-1 rounded-2xl pl-4" style={{ borderLeft: '1px solid color-mix(in srgb, var(--accent) 22%, var(--border))' }}>
                {subjects.map((subject) => {
                  const href = `/learn/${subject.slug}`;
                  const active = isActive(href);
                  return (
                    <Link
                      key={subject.slug}
                      href={href}
                      className="interactive-card flex items-center rounded-xl px-3 py-2 text-xs font-medium"
                      style={{
                        color: active ? 'var(--foreground)' : 'var(--muted)',
                        backgroundColor: active ? 'var(--accent-soft)' : 'transparent',
                      }}
                    >
                      <ChevronRight className={cn('mr-1 h-3 w-3 transition-transform duration-200', active ? 'translate-x-0' : '-translate-x-1 opacity-0')} />
                      {subject.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4">
            <p
              className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.24em]"
              style={{ color: 'var(--muted)', opacity: 0.7 }}
            >
              System
            </p>
            <Link
              href="/settings"
              className="interactive-card flex items-center rounded-2xl px-4 py-3 text-sm font-medium"
              style={{
                background: isActive('/settings') ? 'linear-gradient(135deg, var(--accent-soft), transparent)' : 'transparent',
                color: isActive('/settings') ? 'var(--foreground)' : 'var(--muted)',
                border: `1px solid ${isActive('/settings') ? 'color-mix(in srgb, var(--accent) 42%, var(--border))' : 'transparent'}`,
              }}
            >
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </Link>
          </div>
        </nav>

        <div className="panel-muted mt-auto rounded-2xl p-4 accent-halo">
          <div className="flex items-center space-x-3">
            <div className="h-2.5 w-2.5 rounded-full soft-pulse" style={{ backgroundColor: 'var(--accent)' }} />
            <div>
              <div className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>
                Socratic Engine Online
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>
                Stable and responsive
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
