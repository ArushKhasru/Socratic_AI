"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Session } from "@socratic-ai/types";
import {
  BookOpen,
  BrainCircuit,
  Clock3,
  Flame,
  History,
  Play,
  Share2,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/api";
import subjectsData from "@/data/subjects.json";
import { getSubjectVisual } from "@/lib/subjectMeta";

type DashboardSession = Session & {
  topic?: string;
  userId?: string;
};

type DashboardStats = {
  hoursLearned?: number;
  averageMastery?: number;
  streak?: number;
  masteryData?: Array<{ subject: string; level: number }>;
};

function getSessionTitle(session: DashboardSession) {
  return (
    session.topic ||
    session.messages.find((message) => message.role === "user")?.content.slice(0, 34) ||
    `${session.subject} Session`
  );
}

function getRecommendedSubject(
  userSubjects: typeof subjectsData,
  sessions: DashboardSession[]
) {
  const recentSubject = sessions[0]?.subject;
  return (
    userSubjects.find((subject) => subject.slug === recentSubject) ||
    userSubjects[0] ||
    subjectsData[0]
  );
}

export default function DashboardPage() {
  const { user, checkAuth, loading } = useAuthStore();
  const [sessions, setSessions] = useState<DashboardSession[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    api.get("/chat").then((res) => {
      if (res.data.success) {
        setSessions(res.data.data);
      }
    });

    api.get("/user/stats").then((res) => {
      if (res.data.success) {
        setStats(res.data.data);
      }
    });
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ color: "var(--muted)" }}>
        Loading...
      </div>
    );
  }

  const userSubjects = subjectsData.filter(
    (subject) => user.subjects?.includes(subject.slug) || subject.isPermanent
  );

  const recommendedSubject = getRecommendedSubject(userSubjects, sessions);
  const recommendedVisual = getSubjectVisual(recommendedSubject.slug);

  // Real data integration
  const dashboardStats = {
    progressMinutes: (stats?.hoursLearned || 0) * 60,
    goalMinutes: 60,
    progressPercent: stats?.averageMastery || 0,
    streakDays: stats?.streak || 0,
    sharedCount: sessions.filter((session) => session.userId && session.userId !== user._id).length,
  };

  const topSubjects = userSubjects.slice(0, 2);
  const recentSessions = sessions.slice(0, 3);
  const miniSubjects = userSubjects.slice(0, 4);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="pointer-events-none absolute -right-24 top-8 h-80 w-80 rounded-full blur-[120px]"
        style={{ background: "color-mix(in srgb, var(--accent) 14%, transparent)" }}
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full blur-[120px]"
        style={{ background: "color-mix(in srgb, var(--accent) 8%, transparent)" }}
      />

      <header className="sticky top-0 z-30 flex items-center justify-between border-b px-3 py-2.5 sm:px-6 sm:py-4 lg:px-8 slide-down-enter" style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <div className="min-w-0">
            <div className="text-base sm:text-xl font-black uppercase tracking-[-0.04em] truncate" style={{ color: "var(--foreground)" }}>
              Socratic <span style={{ color: "var(--accent)" }}>AI</span>
            </div>
            <div className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.22em]" style={{ color: "var(--muted)" }}>
              Dashboard
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/shared-topics"
            className="hidden sm:inline-flex items-center gap-2 rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold mobile-tap-feedback"
            style={{ backgroundColor: "var(--surface-alt)", color: "var(--foreground)" }}
          >
            <Share2 size={16} />
            <span className="hidden md:inline">Shared</span>
          </Link>
          <Link
            href="/profile"
            className="flex h-10 sm:h-11 w-10 sm:w-11 items-center justify-center rounded-full text-sm font-black shadow-tonal mobile-tap-feedback active:scale-90"
            style={{ background: recommendedVisual.gradient, color: "var(--foreground)" }}
          >
            {user.name.charAt(0).toUpperCase()}
          </Link>
        </div>
      </header>

      <main className="px-2.5 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <section className="mb-8 sm:mb-10 lg:mb-14 max-w-6xl space-y-3 sm:space-y-4">
        <div
          className="inline-flex items-center gap-2 rounded-full px-2.5 sm:px-4 py-2 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.24em] sm:tracking-[0.28em] bounce-enter"
          style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent)" }}
        >
          <Sparkles size={12} className="sm:w-3.5 sm:h-3.5" />
          <span>Question-first workspace</span>
        </div>
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.04em] leading-tight sm:leading-normal" style={{ color: "var(--foreground)" }}>
          Hello, <span style={{ color: "var(--accent)" }}>{user.name}</span>.
          <br className="hidden sm:block" />
          <span className="text-lg sm:text-4xl md:text-5xl">Ready to explore today?</span>
        </h1>
        <p className="max-w-2xl text-sm sm:text-base lg:text-lg leading-6 sm:leading-7 lg:leading-8" style={{ color: "var(--muted)" }}>
          Your learning space is tuned to discovery, reflection, and momentum.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12">
        <section className="panel-surface lg:col-span-4 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 bounce-enter">
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[8px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.24em]" style={{ color: "var(--accent)" }}>
                Daily Goal
              </div>
              <div className="mt-1.5 sm:mt-2 text-3xl sm:text-4xl font-black tracking-[-0.04em]" style={{ color: "var(--foreground)" }}>
                {Math.round(dashboardStats.progressMinutes)}
                <span className="ml-1 text-sm sm:text-lg font-bold" style={{ color: "var(--muted)" }}>
                  /{dashboardStats.goalMinutes}m
                </span>
              </div>
            </div>
            <div
              className="flex h-12 sm:h-14 w-12 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl shrink-0"
              style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent)" }}
            >
              <Flame size={20} className="sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="mb-3 sm:mb-4 flex items-center justify-between text-xs sm:text-sm gap-2">
            <span style={{ color: "var(--foreground)" }}>{dashboardStats.progressPercent}% reached</span>
            <span style={{ color: "var(--muted)" }}>{Math.max(0, dashboardStats.goalMinutes - dashboardStats.progressMinutes).toFixed(0)}m left</span>
          </div>
          <div className="h-2 sm:h-2.5 overflow-hidden rounded-full" style={{ backgroundColor: "color-mix(in srgb, var(--surface-alt) 84%, black 16%)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${dashboardStats.progressPercent}%`,
                background: "linear-gradient(90deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 45%, white) 100%)",
                boxShadow: "0 0 18px color-mix(in srgb, var(--accent) 36%, transparent)",
              }}
            />
          </div>

          <p className="mt-6 sm:mt-8 text-xs sm:text-sm italic leading-6 sm:leading-7" style={{ color: "var(--muted)" }}>
            Keep your momentum alive.
          </p>
        </section>

        {topSubjects.map((subject, idx) => {
          const visual = getSubjectVisual(subject.slug);
          const mastery = Math.max(54, 92 - sessions.filter((session) => session.subject === subject.slug).length * 6);
          return (
            <Link
              key={subject.slug}
              href={`/learn/${subject.slug}`}
              className="group panel-surface interactive-card lg:col-span-4 overflow-hidden rounded-2xl sm:rounded-[2rem] bounce-enter"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div
                className="relative h-40 sm:h-52 overflow-hidden px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8"
                style={{ background: visual.gradient }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--surface)]/90 to-transparent" />
                <div
                  className="absolute -right-8 sm:-right-10 -top-8 sm:-top-10 h-24 sm:h-32 w-24 sm:w-32 rounded-full blur-2xl sm:blur-3xl"
                  style={{ backgroundColor: visual.soft }}
                />
                <div className="relative flex h-full flex-col justify-end">
                  <div className="mb-3 flex h-10 sm:h-14 w-10 sm:w-14 items-center justify-center rounded-lg sm:rounded-2xl border" style={{ color: visual.accent, borderColor: "color-mix(in srgb, white 12%, transparent)", backgroundColor: "rgba(11,19,38,0.28)" }}>
                    {visual.icon}
                  </div>
                  <h3 className="text-xl sm:text-3xl font-black tracking-[-0.04em] line-clamp-2" style={{ color: "var(--foreground)" }}>
                    {subject.name}
                  </h3>
                  <p className="mt-1 sm:mt-2 text-xs sm:text-sm font-semibold line-clamp-1" style={{ color: visual.accent }}>
                    {subject.description}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-7">
                <div className="min-w-0">
                  <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: "var(--muted)" }}>
                    Mastery
                  </div>
                  <div className="mt-1.5 sm:mt-2 text-2xl sm:text-3xl font-black tracking-[-0.04em]" style={{ color: "var(--foreground)" }}>
                    {stats?.masteryData?.find((item) => item.subject.toLowerCase() === subject.slug.toLowerCase())?.level || 64}%
                  </div>
                </div>
                <div className="h-14 w-14 sm:h-16 sm:w-16 shrink-0">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="var(--border)" strokeWidth="3" />
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke={visual.accent}
                      strokeDasharray={`${mastery}, 100`}
                      strokeLinecap="round"
                      strokeWidth="3"
                      className="transition-all duration-1000"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          );
        })}

        <section className="panel-surface lg:col-span-8 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 lg:p-10 bounce-enter" style={{ animationDelay: '180ms' }}>
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl sm:text-2xl font-black tracking-[-0.04em]" style={{ color: "var(--foreground)" }}>
                Recent Deep Dives
              </h2>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm line-clamp-2" style={{ color: "var(--muted)" }}>
                Resume your latest sessions.
              </p>
            </div>
            <Link href="/shared-topics" className="text-xs sm:text-sm font-bold transition-colors hover:text-[var(--foreground)] whitespace-nowrap mobile-tap-feedback" style={{ color: "var(--accent)" }}>
              View shared
            </Link>
          </div>

          <div className="space-y-3 sm:space-y-4 lg:space-y-5 stagger-list">
            {recentSessions.length === 0 ? (
              <div className="rounded-xl sm:rounded-[1.5rem] px-4 sm:px-6 py-10 sm:py-16 text-center panel-muted">
                <div className="mx-auto mb-3 sm:mb-4 flex h-12 sm:h-14 w-12 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl" style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent)" }}>
                  <History size={20} className="sm:w-5 sm:h-5" />
                </div>
                <p className="text-xs sm:text-sm" style={{ color: "var(--muted)" }}>
                  No sessions yet. Start a subject above.
                </p>
              </div>
            ) : (
              recentSessions.map((session) => {
                const visual = getSubjectVisual(session.subject);
                return (
                  <Link
                    key={session._id}
                    href={`/learn/${session.subject}?chatId=${session._id}`}
                    className="interactive-card flex flex-col gap-3 sm:gap-4 lg:gap-5 rounded-xl sm:rounded-[1.5rem] px-4 sm:px-6 py-4 sm:py-6 mobile-tap-feedback"
                    style={{ backgroundColor: "color-mix(in srgb, var(--surface-alt) 42%, var(--surface))" }}
                  >
                    <div className="flex gap-3 sm:gap-4 min-w-0">
                      <div
                        className="flex h-11 sm:h-14 w-11 sm:w-14 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: visual.soft, color: visual.accent }}
                      >
                        {visual.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 sm:mb-1 flex items-center justify-between gap-2 sm:gap-3">
                          <h4 className="truncate text-base sm:text-lg font-black tracking-[-0.03em]" style={{ color: "var(--foreground)" }}>
                            {getSessionTitle(session)}
                          </h4>
                          <span className="shrink-0 text-[10px] sm:text-xs font-bold whitespace-nowrap" style={{ color: "var(--muted)" }}>
                            {Math.max(session.messages.length * 3, 12)}m
                          </span>
                        </div>
                        <p className="line-clamp-1 sm:line-clamp-2 text-xs sm:text-sm italic leading-5 sm:leading-6" style={{ color: "var(--muted)" }}>
                          {session.messages.find((message) => message.role === "assistant")?.content || "Open to continue."}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </section>

        <section className="lg:col-span-4 flex flex-col gap-3 sm:gap-4 lg:gap-5 lg:gap-6">
          <div className="panel-surface relative overflow-hidden rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 bounce-enter" style={{ animationDelay: '240ms' }}>
            <div
              className="absolute -right-6 sm:-right-8 -top-6 sm:-top-8 h-20 sm:h-28 w-20 sm:w-28 rounded-full blur-2xl sm:blur-3xl"
              style={{ backgroundColor: recommendedVisual.soft }}
            />
            <div className="relative">
              <div className="mb-2 sm:mb-4 text-[8px] sm:text-xs font-black uppercase tracking-[0.24em]" style={{ color: recommendedVisual.accent }}>
                Recommended
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-[-0.04em] line-clamp-2" style={{ color: "var(--foreground)" }}>
                {recommendedSubject.name}
              </h3>
              <p className="mt-2 sm:mt-3 text-xs sm:text-sm leading-6 sm:leading-7" style={{ color: "var(--muted)" }}>
                Re-enter and let the Socratic loop continue.
              </p>
              <Link
                href={`/learn/${recommendedSubject.slug}`}
                className="mt-6 sm:mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-black mobile-tap-feedback"
                style={{
                  background: recommendedVisual.gradient,
                  color: "var(--foreground)",
                  border: `1px solid ${recommendedVisual.soft}`,
                }}
              >
                Jump Back In
                <Play size={14} className="sm:w-4 sm:h-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 stagger-list">
            {miniSubjects.map((subject, idx) => {
              const visual = getSubjectVisual(subject.slug);
              const completion = Math.max(35, 80 - sessions.filter((session) => session.subject === subject.slug).length * 7);
              return (
                <Link
                  key={subject.slug}
                  href={`/learn/${subject.slug}`}
                  className="interactive-card panel-surface rounded-xl sm:rounded-[1.5rem] p-3 sm:p-5 mobile-tap-feedback"
                  style={{ animationDelay: `${300 + idx * 60}ms` }}
                >
                  <div className="mb-3 inline-flex h-9 sm:h-11 w-9 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl" style={{ backgroundColor: visual.soft, color: visual.accent }}>
                    {visual.icon}
                  </div>
                  <h4 className="text-sm sm:text-lg font-black tracking-[-0.03em] line-clamp-1" style={{ color: "var(--foreground)" }}>
                    {subject.name}
                  </h4>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-1 sm:h-1.5 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: "var(--border)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${completion}%`, backgroundColor: visual.accent }}
                      />
                    </div>
                    <span className="text-[8px] sm:text-[10px] font-black" style={{ color: "var(--muted)" }}>
                      {completion}%
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="panel-muted rounded-xl sm:rounded-[1.5rem] p-4 sm:p-5 bounce-enter" style={{ animationDelay: '360ms' }}>
            <div className="mb-3 flex items-center gap-2 sm:gap-3">
              <div className="flex h-9 sm:h-10 w-9 sm:w-10 items-center justify-center rounded-lg sm:rounded-2xl" style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent)" }}>
                <BrainCircuit size={16} className="sm:w-4.5 sm:h-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs sm:text-sm font-black" style={{ color: "var(--foreground)" }}>
                  Mentor Pulse
                </div>
                <div className="text-[8px] uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>
                  Live insight
                </div>
              </div>
            </div>
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm leading-5 sm:leading-6" style={{ color: "var(--muted)" }}>
              <div className="flex items-center gap-2 min-w-0">
                <Clock3 size={12} className="shrink-0 sm:w-3.5 sm:h-3.5" />
                <span className="truncate">{dashboardStats.streakDays} day streak</span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <BookOpen size={12} className="shrink-0 sm:w-3.5 sm:h-3.5" />
                <span className="truncate">{userSubjects.length} subjects ready</span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <Share2 size={12} className="shrink-0 sm:w-3.5 sm:h-3.5" />
                <span className="truncate">{dashboardStats.sharedCount} shared sessions</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <nav className="safe-bottom fixed bottom-3 left-1/2 z-30 flex -translate-x-1/2 items-center gap-4 sm:gap-6 rounded-full px-4 sm:px-6 py-3 sm:py-4 glass lg:hidden mobile-tap-feedback slide-up-enter">
        <Link href="/dashboard" style={{ color: "var(--accent)" }} className="transition-colors">
          <Sparkles size={20} />
        </Link>
        <Link href="/learn" style={{ color: "var(--muted)" }} className="transition-colors hover:text-[var(--foreground)]">
          <BookOpen size={20} />
        </Link>
        <Link href="/progress" style={{ color: "var(--muted)" }} className="transition-colors hover:text-[var(--foreground)]">
          <History size={20} />
        </Link>
      </nav>
      </main>
    </div>
  );
}
