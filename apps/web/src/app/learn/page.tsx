"use client";

import { useAuthStore } from "@/store/useAuthStore";
import subjectsData from "@/data/subjects.json";
import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";

export default function LearnOverviewPage() {
  const { user } = useAuthStore();
  const featuredSubjects = subjectsData.filter(
    (subject) => subject.isPermanent || user?.subjects?.includes(subject.slug)
  );

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 sm:gap-10 lg:gap-12 px-3 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-14 lg:gap-16">
        <section className="relative overflow-hidden group slide-down-enter">
          <div
            className="ai-orb-glow absolute -top-16 sm:-top-20 -right-16 sm:-right-20 h-48 sm:h-64 w-48 sm:w-64 rounded-full"
            style={{ opacity: 0.4 }}
          />
          <div className="relative max-w-3xl space-y-4 sm:space-y-6">
            <div
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] bg-[var(--accent-soft)] text-[var(--accent)] bounce-enter"
            >
              <Sparkles size={12} className="sm:w-3.5 sm:h-3.5" />
              <span>Socratic Repository</span>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight sm:leading-[1.1]" style={{ color: "var(--foreground)" }}>
              Every breakthrough begins with a <span className="text-[var(--accent)] italic text-xl sm:text-4xl md:text-5xl">single question.</span>
            </h1>
            <p className="max-w-2xl text-xs sm:text-base leading-6 sm:leading-8 opacity-70" style={{ color: "var(--foreground)" }}>
              The Socratic Assistant guides your mind through cycles of inquiry, ensuring every leap in understanding is earned and permanent.
            </p>
          </div>
        </section>

        <section className="space-y-6 sm:space-y-8 lg:space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border)] gap-3 sm:gap-4 pb-4 sm:pb-6 slide-up-enter">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-lg sm:rounded-2xl bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--accent)] shadow-inner shrink-0">
                <BookOpen size={18} className="sm:w-5.5 sm:h-5.5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-2xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
                  Core Disciplines
                </h2>
                <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em]" style={{ color: "var(--muted)" }}>
                  Guided learning pathways
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 md:grid-cols-2 lg:grid-cols-3 stagger-list">
            {featuredSubjects.map((subject, idx) => (
              <Link
                key={subject.slug}
                href={`/learn/${subject.slug}`}
                className="group relative glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 transition-all hover:shadow-lg mobile-tap-feedback"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div
                  className="mb-6 sm:mb-8 flex h-12 sm:h-16 w-12 sm:w-16 items-center justify-center rounded-lg sm:rounded-2xl text-2xl sm:text-4xl shadow-inner transition-transform group-hover:scale-110"
                  style={{ background: "linear-gradient(135deg, var(--surface-alt), var(--surface))" }}
                >
                  {subject.icon}
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
                    {subject.name}
                  </h3>
                  <p className="text-xs sm:text-sm leading-6 sm:leading-7 opacity-60 line-clamp-3" style={{ color: "var(--foreground)" }}>
                    {subject.description}
                  </p>
                  <div className="flex items-center gap-2 sm:gap-3 pt-3 sm:pt-4 text-[9px] sm:text-xs font-black uppercase tracking-widest text-[var(--accent)] transition-all group-hover:gap-4">
                    Open Session
                    <ArrowRight size={14} className="sm:w-4 sm:h-4" />
                  </div>
                </div>

                {/* Subtle hover accent */}
                <div className="absolute top-3 sm:top-4 right-3 sm:right-4 h-1.5 sm:h-2 w-1.5 sm:w-2 rounded-full bg-[var(--accent)] opacity-0 group-hover:opacity-100 transition-all blur-[1px]" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
