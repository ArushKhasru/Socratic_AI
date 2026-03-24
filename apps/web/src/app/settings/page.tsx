"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore, themes, type ThemePalette } from "@/store/useThemeStore";
import { Palette, User as UserIcon, Info } from "lucide-react";

function ThemeCard({ palette, isActive, onSelect }: { palette: ThemePalette; isActive: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="flex flex-col items-start gap-3 p-5 rounded-2xl transition-all duration-200 text-left group"
      style={{
        backgroundColor: palette.surface,
        border: isActive ? `2px solid ${palette.accent}` : `2px solid ${palette.border}`,
        boxShadow: isActive ? `0 0 0 3px ${palette.accent}33` : 'none',
      }}
    >
      {/* Color Preview Dots */}
      <div className="flex items-center gap-1.5">
        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: palette.background }} />
        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: palette.accent }} />
        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: palette.muted }} />
        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: palette.foreground }} />
      </div>
      <div>
        <span className="text-sm font-bold" style={{ color: palette.foreground }}>{palette.name}</span>
      </div>
    </button>
  );
}

export default function SettingsPage() {
  const { user, checkAuth, loading } = useAuthStore();
  const { activeTheme, setTheme } = useThemeStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ color: 'var(--muted)' }}>
        Loading...
      </div>
    );
  }

  const themeList = Object.values(themes);

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto py-12 space-y-12">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tighter" style={{ color: 'var(--foreground)' }}>Settings</h1>
          <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Customize your Socratic workspace.</p>
        </div>

        {/* Appearance */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--surface)', color: 'var(--accent)' }}
            >
              <Palette size={18} />
            </div>
            <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>Appearance</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {themeList.map((palette) => (
              <ThemeCard
                key={palette.key}
                palette={palette}
                isActive={activeTheme === palette.key}
                onSelect={() => setTheme(palette.key)}
              />
            ))}
          </div>
        </section>

        {/* Account */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--surface)', color: 'var(--accent)' }}
            >
              <UserIcon size={18} />
            </div>
            <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>Account</h2>
          </div>

          <div
            className="rounded-2xl p-6 space-y-4"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Name</span>
              <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{user.name}</span>
            </div>
            <div style={{ borderTop: '1px solid var(--border)' }} />
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Email</span>
              <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{user.email}</span>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--surface)', color: 'var(--accent)' }}
            >
              <Info size={18} />
            </div>
            <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>About</h2>
          </div>

          <div
            className="rounded-2xl p-6 space-y-4"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Version</span>
              <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>0.1.0</span>
            </div>
            <div style={{ borderTop: '1px solid var(--border)' }} />
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Engine</span>
              <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Gemini 2.5 Flash</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
