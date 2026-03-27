"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/api";
import { Chat } from "@/store/useChatStore";
import { ArrowLeft, ArrowRight, Share2, UserPlus, X } from "lucide-react";
import subjectsData from "@/data/subjects.json";

type CollaboratorUser = string | { _id: string; email: string };

type SharedChat = Omit<Chat, "collaborators"> & {
  topic?: string;
  collaborators?: { userId: CollaboratorUser; access: 'read' | 'write' }[];
};

export default function SharedTopicsPage() {
  const { user, checkAuth, loading } = useAuthStore();
  const [sessions, setSessions] = useState<SharedChat[]>([]);
  const [activeTab, setActiveTab] = useState<'with-me' | 'by-me'>('with-me');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!loading && !user) router.push("/signin");
  }, [user, loading, router]);

  const fetchSessions = useCallback(async () => {
    const res = await api.get("/chat");
    return res.data.success ? (res.data.data as SharedChat[]) : [];
  }, []);

  useEffect(() => {
    if (!user) return;

    let isActive = true;
    void fetchSessions().then((data) => {
      if (isActive) {
        setSessions(data);
      }
    });

    return () => {
      isActive = false;
    };
  }, [fetchSessions, user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ color: "var(--muted)" }}>
        Loading...
      </div>
    );
  }

  const sharedWithMe = sessions.filter((session) => session.userId !== user._id);
  const sharedByMe = sessions.filter((session) => session.userId === user._id && session.collaborators && session.collaborators.length > 0);

  const handleUnshare = async (chatId: string, targetUserId: string) => {
    if (confirm("Revoke access for this user?")) {
      await api.delete(`/chat/${chatId}/share/${targetUserId}`);
      setSessions(await fetchSessions());
    }
  };

  const handleUnshareAll = async (chatId: string) => {
    if (confirm("Revoke access for all users from this chat?")) {
      await api.delete(`/chat/${chatId}/share`);
      setSessions(await fetchSessions());
    }
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b px-4 py-3 sm:px-6 sm:py-4 lg:px-8" style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 transition-colors hover:bg-[var(--surface-alt)] rounded-xl"
            style={{ color: "var(--muted)" }}
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="text-xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
              Shared <span style={{ color: "var(--accent)" }}>Topics</span>
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: "var(--muted)" }}>
              Collaboration Hub
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden rounded-full px-4 py-2 text-sm font-medium md:block button-ghost" style={{ color: "var(--foreground)" }}>
            Workspace of <span style={{ color: "var(--accent)" }}>{user.name}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:gap-10 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="flex justify-center">
          <div className="flex w-full max-w-md gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] p-1">
            <button
              onClick={() => setActiveTab('with-me')}
              className={`flex-1 rounded-xl px-4 py-3 text-xs font-bold transition-all sm:px-6 sm:text-sm ${activeTab === 'with-me' ? 'bg-[var(--surface)] text-[var(--accent)] shadow-sm' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}`}
            >
              Shared with Me ({sharedWithMe.length})
            </button>
            <button
              onClick={() => setActiveTab('by-me')}
              className={`flex-1 rounded-xl px-4 py-3 text-xs font-bold transition-all sm:px-6 sm:text-sm ${activeTab === 'by-me' ? 'bg-[var(--surface)] text-[var(--accent)] shadow-sm' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}`}
            >
              Shared by Me ({sharedByMe.length})
            </button>
          </div>
        </div>

        <section className="reveal-up stagger-1 min-h-[400px]">
          <div className="grid grid-cols-1 gap-4">
            {activeTab === 'with-me' ? (
              sharedWithMe.length === 0 ? (
                <EmptyState icon={<UserPlus size={32} />} message="No sessions shared with you yet." />
              ) : (
                sharedWithMe.map((session) => (
                  <SharedCard key={session._id} session={session} type="with-me" />
                ))
              )
            ) : (
              sharedByMe.length === 0 ? (
                <EmptyState icon={<Share2 size={32} />} message="You haven't shared any sessions yet." />
              ) : (
                sharedByMe.map((session) => (
                  <SharedCard
                    key={session._id}
                    session={session}
                    type="by-me"
                    onRevoke={handleUnshare}
                    onRevokeAll={handleUnshareAll}
                  />
                ))
              )
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function EmptyState({ icon, message }: { icon: React.ReactNode, message: string }) {
  return (
    <div className="panel-surface rounded-[2.5rem] p-24 text-center space-y-4">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl panel-muted" style={{ color: "var(--accent)" }}>
        {icon}
      </div>
      <p className="text-sm italic" style={{ color: "var(--muted)" }}>{message}</p>
    </div>
  );
}

function SharedCard({
  session,
  type,
  onRevoke,
  onRevokeAll
}: {
  session: SharedChat;
  type: 'with-me' | 'by-me';
  onRevoke?: (chatId: string, targetUserId: string) => void;
  onRevokeAll?: (chatId: string) => void;
}) {
  return (
    <div
      className="panel-surface interactive-card flex flex-col gap-6 rounded-[1.75rem] px-8 py-6 md:flex-row md:items-center md:justify-between"
      style={{ border: "1px solid var(--border)" }}
    >
      <div className="flex items-center gap-5">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shadow-tonal"
          style={{ background: "linear-gradient(135deg, var(--surface-alt), var(--surface))" }}
        >
          {subjectsData.find((subject) => subject.slug === session.subject)?.icon || "📘"}
        </div>
        <div>
          <div className="flex items-center gap-3">
            <div className="text-lg font-bold capitalize" style={{ color: "var(--foreground)" }}>
              {session.topic ||
                session.messages.find((message) => message.role === 'user')?.content.slice(0, 30) ||
                `${session.subject} Session`}
            </div>
            <span
              className="rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider"
              style={{
                backgroundColor: type === 'with-me' ? "var(--accent-soft)" : "var(--surface-alt)",
                color: type === 'with-me' ? "var(--accent)" : "var(--muted)",
                border: type === 'by-me' ? "1px solid var(--border)" : "none"
              }}
            >
              {type === 'with-me' ? 'Recipient' : 'Owner'}
            </span>
          </div>
          <div className="text-xs" style={{ color: "var(--muted)" }}>
            {new Date(session.createdAt).toLocaleDateString()} • {session.messages.length} messages
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {type === 'by-me' && (
          <div className="flex flex-col items-end gap-2">
            <div className="flex flex-wrap justify-end gap-2">
              {session.collaborators?.map((collaborator, idx) => {
                const collaboratorUser = collaborator.userId;
                const key = typeof collaboratorUser === 'object' ? collaboratorUser._id : (collaboratorUser + idx);
                return (
                  <div key={key} className="flex items-center gap-2 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] px-3 py-1.5 transition-all hover:border-[var(--muted)]">
                    <span className="text-[10px] font-bold" style={{ color: 'var(--muted)' }}>
                      {typeof collaboratorUser === 'object' ? collaboratorUser.email : collaboratorUser}
                    </span>
                    <button
                      onClick={() => typeof collaboratorUser === "object" && onRevoke?.(session._id, collaboratorUser._id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                      title="Revoke access"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
            {session.collaborators && session.collaborators.length > 1 && (
              <button
                onClick={() => onRevokeAll?.(session._id)}
                className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
              >
                Revoke All Access
              </button>
            )}
          </div>
        )}
        <Link
          href={`/learn/${session.subject}?chatId=${session._id}`}
          className="button-accent inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold shadow-tonal"
        >

          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
