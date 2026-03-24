"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/api";
import { Session } from "@socratic-ai/types";
import { BookOpen, History, LogOut } from "lucide-react";

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
      api.get("/sessions").then((res) => {
        if (res.data.success) setSessions(res.data.data);
      });
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ color: 'var(--muted)' }}>
        Loading...
      </div>
    );
  }

  const subjects = [
    { id: "physics", name: "Physics", icon: "⚛️" },
    { id: "chemistry", name: "Chemistry", icon: "🧪" },
    { id: "math", name: "Mathematics", icon: "📐" },
    { id: "biology", name: "Biology", icon: "🌿" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header
        className="px-8 py-6 flex items-center justify-between sticky top-0 z-40 glass"
      >
        <div className="text-xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
          Socratic <span style={{ color: 'var(--accent)' }}>AI</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
            Hello, <span className="font-bold" style={{ color: 'var(--foreground)' }}>{user.name}</span>
          </div>
          <button
            onClick={logout}
            className="p-2 transition-colors"
            style={{ color: 'var(--muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#E06C75'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted)'}
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full px-8 py-12 space-y-16">
        {/* Subject Grid */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--surface)', color: 'var(--accent)' }}
            >
              <BookOpen size={20} />
            </div>
            <h2 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>Pick a Subject</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {subjects.map((s) => (
              <Link
                key={s.id}
                href={`/learn/${s.id}`}
                className="group p-8 rounded-2xl shadow-tonal hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center space-y-4"
                style={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  className="w-20 h-20 rounded-2xl text-4xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform"
                  style={{ backgroundColor: 'var(--border)' }}
                >
                  {s.icon}
                </div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>{s.name}</h3>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>Master {s.name.toLowerCase()} concepts through discovery.</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Sessions */}
        <section className="space-y-8 pb-12">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--surface)', color: 'var(--muted)' }}
            >
              <History size={20} />
            </div>
            <h2 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>Your Journey</h2>
          </div>

          <div
            className="rounded-2xl shadow-tonal overflow-hidden"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            {sessions.length === 0 ? (
              <div className="p-20 text-center space-y-4">
                <p style={{ color: 'var(--muted)' }}>No sessions yet. Start your first discovery today!</p>
              </div>
            ) : (
              <div>
                {sessions.map((session) => (
                  <div
                    key={session._id}
                    className="p-6 flex items-center justify-between transition-colors group"
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: 'var(--border)' }}
                      >
                        {subjects.find(s => s.id === session.subject)?.icon || "📖"}
                      </div>
                      <div>
                        <div className="font-bold capitalize" style={{ color: 'var(--foreground)' }}>{session.subject} Session</div>
                        <div className="text-sm" style={{ color: 'var(--muted)' }}>
                          {new Date(session.createdAt).toLocaleDateString()} • {session.messages.length} messages
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/learn/${session.subject}`}
                      className="px-5 py-2 rounded-full text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: 'var(--accent)', color: 'var(--background)' }}
                    >
                      Resume
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
