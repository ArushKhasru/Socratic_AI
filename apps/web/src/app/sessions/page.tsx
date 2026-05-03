'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';

type SessionMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

type SessionItem = {
  _id: string;
  subject: 'physics' | 'chemistry' | 'math' | 'biology';
  topic?: string;
  duration?: number;
  messages: SessionMessage[];
  createdAt: string;
  updatedAt: string;
};

const subjects: Array<SessionItem['subject'] | 'all'> = ['all', 'physics', 'chemistry', 'math', 'biology'];

export default function SessionsPage() {
  const { user, loading, checkAuth } = useAuthStore();
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [subjectFilter, setSubjectFilter] = useState<(typeof subjects)[number]>('all');

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (!user) return;

    const query = subjectFilter === 'all' ? '' : `?subject=${subjectFilter}`;
    api.get(`/sessions${query}`).then((response) => {
      if (response.data.success) {
        setSessions(response.data.data);
      }
    });
  }, [user, subjectFilter]);

  const sorted = useMemo(
    () => [...sessions].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)),
    [sessions]
  );

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--foreground)' }}>Session History</h1>
        <Link href="/dashboard" className="rounded-full px-4 py-2 text-sm font-bold" style={{ backgroundColor: 'var(--surface-alt)', color: 'var(--foreground)' }}>
          Back to Dashboard
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {subjects.map((subject) => (
          <button
            key={subject}
            onClick={() => setSubjectFilter(subject)}
            className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide"
            style={{
              backgroundColor: subjectFilter === subject ? 'var(--accent-soft)' : 'var(--surface-alt)',
              color: subjectFilter === subject ? 'var(--accent)' : 'var(--muted)',
            }}
          >
            {subject}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {sorted.map((session) => (
          <Link
            key={session._id}
            href={`/sessions/${session._id}`}
            className="block rounded-2xl border p-4 transition-colors hover:bg-[var(--surface-alt)]"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em]" style={{ color: 'var(--accent)' }}>
                  {session.subject}
                </p>
                <h2 className="mt-1 text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                  {session.topic || 'Untitled Session'}
                </h2>
                <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
                  {new Date(session.updatedAt).toLocaleString()}
                </p>
              </div>
              <div className="text-right text-sm" style={{ color: 'var(--muted)' }}>
                <p>{session.duration ? `${Math.floor(session.duration / 60)}m` : `${session.messages.length} msgs`}</p>
                <p>{session.messages.length} messages</p>
              </div>
            </div>
          </Link>
        ))}

        {sorted.length === 0 && (
          <div className="rounded-2xl border p-8 text-center" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
            No sessions yet.
          </div>
        )}
      </div>
    </div>
  );
}
