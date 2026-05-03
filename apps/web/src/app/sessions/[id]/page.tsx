'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';

type SessionMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

type SessionDetail = {
  _id: string;
  subject: 'physics' | 'chemistry' | 'math' | 'biology';
  topic?: string;
  duration?: number;
  messages: SessionMessage[];
  updatedAt: string;
};

export default function SessionDetailPage() {
  const { id } = useParams() as { id: string };
  const { user, loading, checkAuth } = useAuthStore();
  const router = useRouter();
  const [session, setSession] = useState<SessionDetail | null>(null);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (!user || !id) return;
    api.get(`/sessions/${id}`).then((response) => {
      if (response.data.success) {
        setSession(response.data.data);
      }
    });
  }, [id, user]);

  if (loading || !user || !session) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: 'var(--accent)' }}>
            {session.subject}
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight" style={{ color: 'var(--foreground)' }}>
            {session.topic || 'Session Transcript'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>{new Date(session.updatedAt).toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/sessions" className="rounded-full px-4 py-2 text-sm font-bold" style={{ backgroundColor: 'var(--surface-alt)', color: 'var(--foreground)' }}>
            Back
          </Link>
          <Link href={`/chat/${session.subject}`} className="rounded-full px-4 py-2 text-sm font-bold" style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
            Continue
          </Link>
        </div>
      </div>

      <div className="space-y-3">
        {session.messages.map((message, index) => (
          <div
            key={`${message.timestamp}-${index}`}
            className={`rounded-2xl border p-4 ${message.role === 'user' ? 'ml-auto max-w-[85%]' : 'mr-auto max-w-[85%]'}`}
            style={{
              borderColor: 'var(--border)',
              backgroundColor: message.role === 'user' ? 'color-mix(in srgb, var(--accent) 14%, transparent)' : 'var(--surface-alt)',
            }}
          >
            <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>
              {message.role}
            </p>
            <p className="whitespace-pre-wrap" style={{ color: 'var(--foreground)' }}>
              {message.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
