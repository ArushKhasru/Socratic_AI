"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/api";
import { Session } from "@socratic-ai/types";
import { ArrowRight, BookOpen, History, LogOut, Sparkles } from "lucide-react";

import subjectsData from "@/data/subjects.json";

export default function DashboardPage() {
  const { user, logout, checkAuth, loading } = useAuthStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      api.get("/chat").then((res) => {
        if (res.data.success) setSessions(res.data.data);
      });
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ color: "var(--muted)" }}>
        Loading...
      </div>
    );
  }

  const userSubjects = subjectsData.filter(s => 
    user.subjects?.includes(s.slug) || s.isPermanent
  );

  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-40 flex items-center justify-between px-8 py-6">
        <div>
          <div className="text-xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
            Socratic <span style={{ color: "var(--accent)" }}>AI</span>
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: "var(--muted)" }}>
            Learning Dashboard
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/progress" className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-bold hover:bg-[var(--surface-alt)] rounded-xl transition-all" style={{ color: "var(--muted)" }}>
            <History size={18} />
            Progress
          </Link>
          <Link href="/profile" className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-bold hover:bg-[var(--surface-alt)] rounded-xl transition-all" style={{ color: "var(--muted)" }}>
            <Sparkles size={18} />
            Atelier
          </Link>
          <div className="hidden rounded-full px-4 py-2 text-sm font-medium md:block button-ghost" style={{ color: "var(--foreground)" }}>
            Hello, <span style={{ color: "var(--accent)" }}>{user.name}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-8 py-12">
        <section className="panel-surface reveal-up relative overflow-hidden rounded-[2rem] px-8 py-10">
          <div className="floating-orb absolute top-0 right-0 h-44 w-44 rounded-full blur-3xl" style={{ background: "var(--accent-soft)" }} />
          <div className="relative max-w-3xl space-y-5">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em]"
              style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent)" }}
            >
              <Sparkles size={14} />
              Guided by Questions
            </div>
            <h1 className="text-4xl font-black tracking-[-0.05em] md:text-5xl" style={{ color: "var(--foreground)" }}>
              Shape a sharper study rhythm.
            </h1>
            <p className="max-w-2xl text-sm leading-7 md:text-base" style={{ color: "var(--muted)" }}>
              Jump into a subject, revisit your recent conversations, and keep the interface tuned to exploration instead of clutter.
            </p>
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center gap-3 reveal-up stagger-1">
            <div className="panel-muted flex h-11 w-11 items-center justify-center rounded-2xl" style={{ color: "var(--accent)" }}>
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
                Pick a subject
              </h2>
              <p className="text-xs uppercase tracking-[0.24em]" style={{ color: "var(--muted)" }}>
                Start a guided session
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {userSubjects.map((s: any, index: number) => (
              <Link
                key={s.slug}
                href={`/learn/${s.slug}`}
                className={`group panel-surface interactive-card accent-halo reveal-up rounded-[1.75rem] p-7`}
              >
                <div
                  className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl shadow-tonal"
                  style={{ background: "linear-gradient(135deg, var(--surface-alt), var(--surface))" }}
                >
                  {s.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
                    {s.name}
                  </h3>
                  <p className="text-sm leading-6" style={{ color: "var(--muted)" }}>
                    {s.description}
                  </p>
                </div>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold" style={{ color: "var(--accent)" }}>
                  Open subject
                  <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-8 pb-12">
          <div className="flex items-center gap-3 reveal-up stagger-2">
            <div className="panel-muted flex h-11 w-11 items-center justify-center rounded-2xl" style={{ color: "var(--accent)" }}>
              <History size={20} />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
                Your journey
              </h2>
              <p className="text-xs uppercase tracking-[0.24em]" style={{ color: "var(--muted)" }}>
                Recent sessions
              </p>
            </div>
          </div>

          <div className="panel-surface overflow-hidden rounded-[2rem] reveal-up stagger-3">
            {sessions.length === 0 ? (
              <div className="space-y-4 px-8 py-20 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl panel-muted" style={{ color: "var(--accent)" }}>
                  <History size={22} />
                </div>
                <p style={{ color: "var(--muted)" }}>
                  No sessions yet. Your first subject card is waiting above.
                </p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {sessions.map((session) => (
                  <div
                    key={session._id}
                    className="interactive-card flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
                        style={{ background: "linear-gradient(135deg, var(--surface-alt), var(--surface))" }}
                      >
                        {subjectsData.find((s: any) => s.slug === session.subject)?.icon || "📘"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="font-bold capitalize" style={{ color: "var(--foreground)" }}>
                            {(session as any).topic || 
                             session.messages.find((m: any) => m.role === 'user')?.content.slice(0, 30) || 
                             `${session.subject} Session`}
                          </div>
                          {(session as any).userId !== user._id && (
                            <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                              Shared
                            </span>
                          )}
                        </div>
                        <div className="text-sm" style={{ color: "var(--muted)" }}>
                          {session.createdAt ? new Date(session.createdAt).toLocaleDateString() : 'Recent'} • {session.messages.length} messages
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/learn/${session.subject}?chatId=${session._id}`}
                      className="button-accent inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold"
                    >
                      Resume
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
