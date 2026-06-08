'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BookOpen, 
  Sparkles,
  History,
  Layers
} from 'lucide-react';

export const BottomNav = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: Sparkles },
    { name: 'Library', href: '/learn', icon: BookOpen },
    { name: 'Vault', href: '/shared-topics', icon: Layers },
    { name: 'Tempo', href: '/progress', icon: History },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-max lg:hidden">
      <nav 
        className="glass flex items-center gap-1 sm:gap-2 rounded-[2rem] px-2 py-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 reveal-up"
        style={{ background: 'color-mix(in srgb, var(--surface) 85%, transparent)' }}
      >
        {navItems.map((item, idx) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center justify-center rounded-[1.5rem] px-5 py-3 transition-all duration-500 mobile-tap-feedback ${
                active ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {active && (
                <div 
                  className="absolute inset-0 rounded-[1.5rem] z-0 overflow-hidden" 
                >
                  <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-white to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 h-[2px] bg-[var(--accent)] shadow-[0_0_12px_var(--accent)]" />
                </div>
              )}
              
              <div className="relative z-10 flex items-center gap-2">
                {item.name === 'Home' ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img 
                    src="/bhutu.jpeg" 
                    alt="Home" 
                    className={`h-5 w-5 rounded-full object-cover transition-all duration-500 ${active ? 'scale-110' : 'scale-90 opacity-70 group-hover:opacity-100'}`}
                  />
                ) : (
                  <item.icon 
                    size={18} 
                    className={`transition-all duration-500 ${active ? 'scale-110' : 'scale-90 group-hover:scale-100 opacity-70 group-hover:opacity-100'}`} 
                  />
                )}
                
                {active && (
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap animate-slide-up">
                    {item.name}
                  </span>
                )}
              </div>

              {!active && (
                <div className="absolute -top-1 right-3 h-1 w-1 rounded-full bg-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNav;
