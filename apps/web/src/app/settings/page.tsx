"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore, themes, type ThemePalette } from "@/store/useThemeStore";
import { Check, Info, Palette, User as UserIcon } from "lucide-react";
import toast from "react-hot-toast";

function getPatternLayer(palette: ThemePalette) {
  if (palette.cardPattern === "grid") {
    return `
      linear-gradient(${palette.border}55 1px, transparent 1px),
      linear-gradient(90deg, ${palette.border}55 1px, transparent 1px)
    `;
  }

  if (palette.cardPattern === "stripes") {
    return `repeating-linear-gradient(135deg, ${palette.border}66 0 8px, transparent 8px 16px)`;
  }

  if (palette.cardPattern === "rings") {
    return `radial-gradient(circle at 20% 30%, ${palette.secondary}55 0 12%, transparent 13% 100%), radial-gradient(circle at 80% 70%, ${palette.accent}66 0 16%, transparent 17% 100%)`;
  }

  if (palette.cardPattern === "mesh") {
    return `conic-gradient(from 130deg at 20% 20%, ${palette.accent}44, transparent 38%), conic-gradient(from -45deg at 70% 70%, ${palette.secondary}44, transparent 42%)`;
  }

  return `repeating-linear-gradient(0deg, ${palette.border}33 0 2px, transparent 2px 7px)`;
}

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
      className="interactive-card shimmer-sweep reveal-up group relative flex flex-col items-start gap-3 rounded-2xl p-4 text-left"
      style={{
        background: `linear-gradient(160deg, ${palette.surface} 0%, ${palette.surfaceAlt} 100%)`,
        border: isActive ? `1px solid ${palette.accent}` : `1px solid ${palette.border}`,
        boxShadow: isActive
          ? `0 0 0 1px ${palette.accent}44, 0 18px 28px -18px ${palette.cardGlow}`
          : `0 14px 24px -20px ${palette.cardGlow}`,
      }}
    >
      <div
        className="relative h-14 w-full overflow-hidden rounded-xl transition-transform duration-300 group-hover:scale-[1.02]"
        style={{
          backgroundColor: palette.cardBase,
          backgroundImage: `${getPatternLayer(palette)}, linear-gradient(135deg, ${palette.cardBase} 0%, ${palette.surfaceAlt} 55%, ${palette.surface} 100%)`,
          backgroundSize: palette.cardPattern === "grid" ? "12px 12px, 12px 12px, cover" : "cover",
          border: `1px solid ${palette.border}`,
        }}
      >
        <div
          className="absolute -right-5 -top-5 h-16 w-16 rounded-full blur-xl transition-transform duration-300 group-hover:scale-125"
          style={{ backgroundColor: palette.cardGlow }}
        />
        <div
          className="absolute bottom-2 left-2 h-1.5 w-8 rounded-full"
          style={{ backgroundColor: palette.accent }}
        />
        <div
          className="absolute bottom-2 left-11 h-1.5 w-5 rounded-full"
          style={{ backgroundColor: palette.secondary }}
        />
      </div>
      <div className="flex w-full items-center justify-between">
        <span className="text-[11px] font-bold" style={{ color: palette.foreground }}>
          {palette.name}
        </span>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: palette.accent }} />
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: palette.secondary }} />
          {isActive && <Check size={12} style={{ color: palette.accent }} />}
        </div>
      </div>
    </button>
  );
}

export default function SettingsPage() {
  const { user, checkAuth, loading, updateProfile } = useAuthStore();
  const { activeTheme, setTheme } = useThemeStore();
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!loading && !user) router.push("/signin");
  }, [user, loading, router]);

  const handleSave = async () => {
    const nextName = name.trim() || user?.name || "";
    if (!nextName.trim()) return;
    setIsSaving(true);
    const success = await updateProfile({ name: nextName.trim() });
    if (success) {
      toast.success("Profile updated successfully");
    } else {
      toast.error("Failed to update profile");
    }
    setIsSaving(false);
  };

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
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:gap-10 sm:px-6 sm:py-12">

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

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
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

        <section className="grid gap-5 sm:gap-6 lg:grid-cols-2">
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
                <label className="text-[10px] font-black uppercase tracking-[0.24em] block mb-2" style={{ color: "var(--muted)" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name || user.name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-transparent border-none p-0 text-base font-bold focus:ring-0 placeholder:text-[var(--muted)]/30"
                  style={{ color: "var(--foreground)" }}
                />
              </div>
              <div className="panel-muted rounded-2xl p-4">
                <div className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: "var(--muted)" }}>
                  Email Address
                </div>
                <div className="mt-2 text-sm font-medium opacity-60" style={{ color: "var(--foreground)" }}>
                  {user.email}
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving || (name.trim().length > 0 && name.trim() === user.name)}
                className="w-full py-4 rounded-2xl bg-[var(--accent)] text-white text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-20 disabled:cursor-not-allowed group relative overflow-hidden"
              >
                <span className="relative z-10">{isSaving ? "Synchronizing..." : "Save Identity Changes"}</span>
                {isSaving && (
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-[var(--surface-alt)]">
                    <div className="h-full bg-white/30 animate-progress" />
                  </div>
                )}
              </button>
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
