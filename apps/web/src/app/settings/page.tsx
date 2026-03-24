"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore, themes, type ThemePalette } from "@/store/useThemeStore";
import { Info, Palette, Sparkles, User as UserIcon } from "lucide-react";

function ThemeCard({
  palette,
  isActive,
  onSelect,
}: {
  palette: ThemePalette;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="interactive-card accent-halo reveal-up flex flex-col items-start gap-4 rounded-3xl p-5 text-left"
      style={{
        background: `linear-gradient(180deg, ${palette.surfaceAlt} 0%, ${palette.surface} 100%)`,
        border: isActive ? `1px solid ${palette.accent}` : `1px solid ${palette.border}`,
        boxShadow: isActive ? `0 0 0 3px ${palette.accentSoft}` : "none",
      }}
    >
      <div
        className="h-24 w-full rounded-2xl"
        style={{
          background: `radial-gradient(circle at top right, ${palette.accentSoft} 0%, transparent 45%), linear-gradient(135deg, ${palette.background} 0%, ${palette.surfaceAlt} 50%, ${palette.surface} 100%)`,
          border: `1px solid ${palette.border}`,
        }}
      />
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 rounded-full" style={{ backgroundColor: palette.background }} />
        <div className="h-4 w-4 rounded-full" style={{ backgroundColor: palette.accent }} />
        <div className="h-4 w-4 rounded-full" style={{ backgroundColor: palette.muted }} />
        <div className="h-4 w-4 rounded-full" style={{ backgroundColor: palette.foreground }} />
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold" style={{ color: palette.foreground }}>
            {palette.name}
          </span>
          {isActive && (
            <span
              className="rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em]"
              style={{ backgroundColor: palette.accentSoft, color: palette.accent }}
            >
              Active
            </span>
          )}
        </div>
        <p className="text-xs" style={{ color: palette.muted }}>
          Tuned for contrast, softer depth, and accent highlights that feel alive.
        </p>
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
      <div className="flex min-h-screen items-center justify-center" style={{ color: "var(--muted)" }}>
        Loading...
      </div>
    );
  }

  const themeList = Object.values(themes);

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-12">
        <div className="reveal-up relative overflow-hidden rounded-[2rem] px-8 py-10 panel-surface">
          <div className="floating-orb absolute top-0 right-0 h-40 w-40 rounded-full blur-3xl" style={{ background: "var(--accent-soft)" }} />
          <div className="relative space-y-3">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em]"
              style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent)" }}
            >
              <Sparkles size={14} />
              Workspace Tuning
            </div>
            <h1 className="text-4xl font-black tracking-[-0.04em]" style={{ color: "var(--foreground)" }}>
              Settings
            </h1>
            <p className="max-w-2xl text-sm leading-7" style={{ color: "var(--muted)" }}>
              Refine the mood of your study space, tune the visual rhythm, and keep the interface feeling focused without becoming flat.
            </p>
          </div>
        </div>

        <section className="space-y-6 reveal-up stagger-1">
          <div className="flex items-center gap-3">
            <div
              className="accent-halo flex h-10 w-10 items-center justify-center rounded-2xl panel-muted"
              style={{ color: "var(--accent)" }}
            >
              <Palette size={18} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
                Appearance
              </h2>
              <p className="text-xs uppercase tracking-[0.24em]" style={{ color: "var(--muted)" }}>
                Theme Library
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {themeList.map((palette, index) => (
              <div key={palette.key} className={index < 4 ? "stagger-2" : "stagger-3"}>
                <ThemeCard
                  palette={palette}
                  isActive={activeTheme === palette.key}
                  onSelect={() => setTheme(palette.key)}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="panel-surface reveal-up stagger-2 rounded-[2rem] p-6">
            <div className="mb-6 flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-2xl panel-muted"
                style={{ color: "var(--accent)" }}
              >
                <UserIcon size={18} />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
                  Account
                </h2>
                <p className="text-xs uppercase tracking-[0.24em]" style={{ color: "var(--muted)" }}>
                  Identity
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="panel-muted rounded-2xl p-4">
                <div className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: "var(--muted)" }}>
                  Name
                </div>
                <div className="mt-2 text-base font-bold" style={{ color: "var(--foreground)" }}>
                  {user.name}
                </div>
              </div>
              <div className="panel-muted rounded-2xl p-4">
                <div className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: "var(--muted)" }}>
                  Email
                </div>
                <div className="mt-2 text-base font-bold" style={{ color: "var(--foreground)" }}>
                  {user.email}
                </div>
              </div>
            </div>
          </div>

          <div className="panel-surface reveal-up stagger-3 rounded-[2rem] p-6">
            <div className="mb-6 flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-2xl panel-muted"
                style={{ color: "var(--accent)" }}
              >
                <Info size={18} />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
                  About
                </h2>
                <p className="text-xs uppercase tracking-[0.24em]" style={{ color: "var(--muted)" }}>
                  System Details
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="panel-muted rounded-2xl p-4">
                <div className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: "var(--muted)" }}>
                  Version
                </div>
                <div className="mt-2 text-base font-bold" style={{ color: "var(--foreground)" }}>
                  0.1.0
                </div>
              </div>
              <div className="panel-muted rounded-2xl p-4">
                <div className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: "var(--muted)" }}>
                  Engine
                </div>
                <div className="mt-2 text-base font-bold" style={{ color: "var(--foreground)" }}>
                  Gemini 2.5 Flash
                </div>
              </div>
              <div className="rounded-2xl px-4 py-3 text-sm" style={{ backgroundColor: "var(--accent-soft)", color: "var(--foreground)" }}>
                Theme changes apply instantly, so the whole workspace now feels more tactile and a little less static.
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
