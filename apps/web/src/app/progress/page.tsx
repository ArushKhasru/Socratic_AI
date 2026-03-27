"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore } from "@/store/useThemeStore";
import subjectsData from "@/data/subjects.json";
import {
  Clock,
  ChevronRight,
  History,
  LayoutDashboard,
  Brain,
  Activity,
  Flame,
  ArrowLeft,
  BookOpen,
} from "lucide-react";

interface WeeklyActivityPoint {
  day: string;
  count: number;
}

interface SubjectDistributionPoint {
  subject: string;
  percentage: number;
}

interface TimelineSession {
  subject: string;
  updatedAt: string;
  messageCount: number;
}

interface StatsResponse {
  totalSessions: number;
  hoursLearned: number;
  streak: number;
  averageMastery: number;
  weeklyActivity: WeeklyActivityPoint[];
  subjectDistribution: SubjectDistributionPoint[];
  recentTimeline: TimelineSession[];
}

export default function ProgressPage() {
  const { user, loading, checkAuth } = useAuthStore();
  const { hydrate } = useThemeStore();
  const router = useRouter();
  const [statsData, setStatsData] = useState<StatsResponse | null>(null);

  useEffect(() => {
    checkAuth();
    hydrate();

    import("@/lib/api").then(({ default: api }) => {
      api.get("/user/stats").then((res) => {
        if (res.data.success) {
          setStatsData(res.data.data);
        }
      });
    });
  }, [checkAuth, hydrate]);

  useEffect(() => {
    if (!loading && !user) router.push("/signin");
  }, [user, loading, router]);

  if (loading || !user || !statsData) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ color: 'var(--muted)' }}>
        Gathering your intellectual metrics...
      </div>
    );
  }

  const stats = [
    { label: "Total Sessions", value: statsData.totalSessions, icon: Brain, color: "var(--accent)" },
    { label: "Hours Learned", value: `${statsData.hoursLearned}h`, icon: Clock, color: "#9AC2FF" },
    { label: "Learning Streak", value: `${statsData.streak} Days`, icon: Flame, color: "#FF8A65" },
  ];

  const mostActiveDay = statsData.weeklyActivity.reduce(
    (best: WeeklyActivityPoint, day: WeeklyActivityPoint) => (day.count > best.count ? day : best),
    { day: "N/A", count: 0 }
  );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[var(--border)] px-4 py-3 glass sm:px-6 sm:py-5 lg:px-8 lg:py-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-[var(--surface)] rounded-xl transition-colors" style={{ color: 'var(--muted)' }}>
            <ArrowLeft size={20} />
          </Link>
          <div className="text-xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
            Your <span style={{ color: 'var(--accent)' }}>Insights</span>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 sm:flex">
            <Flame size={16} className="text-[#FF8A65]" />
            <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{statsData.streak} Day Streak</span>
          </div>
          <Link href="/profile" className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold shadow-lg">
            {user.name.charAt(0)}
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-10 px-4 py-8 sm:space-y-12 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <section className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
            Intellectual Journey
          </h1>
          <p className="text-[var(--muted)] leading-relaxed max-w-2xl">
            Track study momentum, revisit recent dialogues, and see where your understanding is growing strongest.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="p-8 rounded-3xl transition-transform hover:-translate-y-1 shadow-tonal border border-[var(--border)] bg-[var(--surface)]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                  <stat.icon size={24} />
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Live</div>
              </div>
              <div className="text-3xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>{stat.value}</div>
              <div className="text-sm font-medium" style={{ color: 'var(--muted)' }}>{stat.label}</div>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="space-y-6">
            <div className="p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-tonal space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Weekly Activity</h3>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>Engagement by day of week</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-[10px] font-bold">
                  Peak day: {mostActiveDay.day}
                </div>
              </div>

              <div className="flex items-end justify-between h-48 gap-2 pt-4">
                {statsData.weeklyActivity.map((day: WeeklyActivityPoint, i: number) => {
                  const maxCount = Math.max(...statsData.weeklyActivity.map((point) => point.count), 1);
                  const height = (day.count / maxCount) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                      <div className="relative w-full flex justify-center items-end h-full">
                        <div
                          className="w-full max-w-[32px] rounded-t-xl transition-all duration-500 group-hover:opacity-80"
                          style={{
                            height: `${height}%`,
                            minHeight: day.count > 0 ? '4px' : '0',
                            background: `linear-gradient(180deg, var(--accent) 0%, var(--accent-soft) 100%)`
                          }}
                        />
                        {day.count > 0 && (
                          <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--surface-alt)] px-2 py-1 rounded text-[10px] font-bold shadow-lg" style={{ color: 'var(--foreground)' }}>
                            {day.count}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>{day.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-tonal space-y-8">
              <div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Subject-wise Progress</h3>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>Mastery levels across disciplines</p>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="relative w-48 h-48 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50" cy="50" r="40"
                      fill="none"
                      stroke="var(--border)"
                      strokeWidth="12"
                    />
                    {statsData.subjectDistribution.reduce((acc: { elements: React.ReactNode[]; totalPercentage: number }, sd: SubjectDistributionPoint, i: number) => {
                      const colors = ["var(--accent)", "#9AC2FF", "#8FD3FF", "#FF8A65"];
                      const strokeDasharray = `${(sd.percentage / 100) * 251.2} 251.2`;
                      const strokeDashoffset = -((acc.totalPercentage / 100) * 251.2);

                      const element = (
                        <circle
                          key={i}
                          cx="50" cy="50" r="40"
                          fill="none"
                          stroke={colors[i % colors.length]}
                          strokeWidth="12"
                          strokeLinecap="round"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          style={{ transition: 'all 1s ease-out' }}
                        />
                      );

                      return {
                        elements: [...acc.elements, element],
                        totalPercentage: acc.totalPercentage + sd.percentage
                      };
                    }, { elements: [], totalPercentage: 0 }).elements}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-black" style={{ color: 'var(--foreground)' }}>{statsData.averageMastery}%</span>
                    <span className="text-[8px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>Average Mastery</span>
                  </div>
                </div>

                <div className="flex-grow space-y-4 w-full">
                  {statsData.subjectDistribution.map((sd: SubjectDistributionPoint, i: number) => {
                    const colors = ["var(--accent)", "#9AC2FF", "#8FD3FF", "#FF8A65"];
                    return (
                      <div key={i} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                          <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{sd.subject}</span>
                        </div>
                        <span className="text-sm font-bold" style={{ color: 'var(--muted)' }}>({sd.percentage}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <History size={20} style={{ color: 'var(--accent)' }} />
            <h2 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Discovery Timeline</h2>
          </div>

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-tonal">
            {statsData.recentTimeline && statsData.recentTimeline.length > 0 ? (
              statsData.recentTimeline.map((session: TimelineSession, i: number) => (
                <div
                  key={i}
                  className="p-6 flex items-center justify-between hover:bg-[var(--background)] transition-colors group"
                  style={{ borderBottom: i === statsData.recentTimeline.length - 1 ? 'none' : '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--border)] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {subjectsData.find((subject) => subject.slug === session.subject.toLowerCase())?.icon || "📘"}
                    </div>
                    <div>
                      <div className="font-bold capitalize" style={{ color: 'var(--foreground)' }}>{session.subject} dialogue</div>
                      <div className="text-xs" style={{ color: 'var(--muted)' }}>
                        {new Date(session.updatedAt).toLocaleDateString()} • {session.messageCount} messages
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <Link
                      href={`/learn/${session.subject.toLowerCase()}`}
                      className="hidden md:flex flex-col items-end hover:opacity-70 transition-opacity"
                    >
                      <div className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Status</div>
                      <div className="text-xs font-bold" style={{ color: 'var(--accent)' }}>View insights</div>
                    </Link>
                    <ChevronRight size={20} style={{ color: 'var(--muted)' }} />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-[var(--muted)]">
                No dialogues started yet. Embark on your first subject to see insights here.
              </div>
            )}
          </div>
        </section>
      </main>

      <nav className="safe-bottom fixed bottom-3 left-1/2 z-50 flex -translate-x-1/2 items-center gap-8 rounded-full border border-[var(--border)] px-6 py-4 glass shadow-2xl md:hidden">
        <Link href="/dashboard" style={{ color: 'var(--muted)' }}><LayoutDashboard size={20} /></Link>
        <Link href="/learn" style={{ color: 'var(--accent)' }}><BookOpen size={20} /></Link>
        <Link href="/progress" style={{ color: 'var(--accent)' }}><Activity size={20} /></Link>
        <Link href="/profile" style={{ color: 'var(--muted)' }}><History size={20} /></Link>
      </nav>
    </div>
  );
}
