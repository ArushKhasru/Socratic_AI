'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Settings,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export const Sidebar = () => {
  const pathname = usePathname();

  const { user } = useAuthStore();

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Learn', href: '/learn', icon: BookOpen },
    { name: 'Progress', href: '/progress', icon: TrendingUp },
    { name: 'Shared topics', href: '/shared-topics', icon: Users },
  ];

  const bottomItems = [
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <aside
      className="fixed left-0 top-0 z-40 hidden h-screen w-72 md:w-80 overflow-hidden lg:flex flex-col"
      style={{
        backgroundColor: "color-mix(in srgb, var(--background) 92%, black 8%)",
        borderRight: "1px solid color-mix(in srgb, var(--border) 78%, transparent)",
      }}
    >
      <div
        className="pointer-events-none absolute left-0 top-0 w-full h-64"
        style={{ background: "radial-gradient(circle at top left, var(--accent-soft) 0%, transparent 72%)" }}
      />

      <div className="relative flex h-full w-full flex-col px-3 md:px-4 pb-6 pt-8 md:pt-10 overflow-y-auto custom-scrollbar">
        <div className="mb-6 md:mb-8 flex items-center gap-2 md:gap-3 px-2 slide-down-enter">
          <div
            className="flex h-10 md:h-11 w-10 md:w-11 items-center justify-center rounded-full shadow-tonal flex-shrink-0"
            style={{ background: "linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 45%, white) 100%)", color: "var(--background)" }}
          >
            <GraduationCap size={20} className="md:w-5.5 md:h-5.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs md:text-sm font-black uppercase tracking-[0.22em] truncate" style={{ color: "var(--accent)" }}>
              Socratic AI
            </div>
            <div className="text-[9px] md:text-[10px] font-medium uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
              Guided learner
            </div>
          </div>
        </div>

        <nav className="space-y-0.5 md:space-y-1 flex-1 stagger-list">
          {navItems.map((item, idx) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="nav-pill flex items-center gap-2 md:gap-3 rounded-r-full px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm font-medium transition-all duration-300 mobile-tap-feedback"
                style={{
                  color: active ? "var(--foreground)" : "var(--muted)",
                  background: active ? "linear-gradient(90deg, color-mix(in srgb, var(--accent) 18%, transparent), transparent)" : "transparent",
                  borderLeft: active ? "3px solid var(--accent)" : "3px solid transparent",
                  animationDelay: `${idx * 60}ms`,
                }}
              >
                <item.icon size={16} className="md:w-4.5 md:h-4.5 flex-shrink-0" style={{ color: active ? "var(--accent)" : "currentColor" }} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-0.5 md:space-y-1 px-2 pb-3 md:pb-4">
          {bottomItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-pill flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm font-medium transition-colors hover:text-[var(--foreground)] mobile-tap-feedback"
              style={{ color: "var(--muted)" }}
            >
              <item.icon size={16} className="md:w-4.5 md:h-4.5 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
            </Link>
          ))}

          {user && (
            <Link
              href="/profile"
              className="mt-3 md:mt-4 flex w-full items-center gap-2 md:gap-3 rounded-full py-2 pl-2 md:pl-2.5 pr-3 md:pr-5 transition-all hover:bg-[var(--surface-alt)] mobile-tap-feedback"
            >
              <div className="flex h-8 md:h-9 w-8 md:w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] md:text-xs font-black text-[var(--background)]">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="truncate text-[9px] md:text-xs font-black uppercase tracking-wider" style={{ color: "var(--foreground)" }}>
                  {user.name}
                </div>
                <div className="truncate text-[8px] md:text-[9px] uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                  Profile
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
