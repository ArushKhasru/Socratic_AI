"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { Send, ArrowLeft, Lightbulb, RefreshCcw, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function ChatPage() {
  const { subject } = useParams() as { subject: string };
  const { user, checkAuth, loading: authLoading } = useAuthStore();
  const { currentChat, startChat, sendMessage, loading: chatLoading, error } = useChatStore();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && !currentChat) {
      startChat(subject);
    }
  }, [user, currentChat, startChat, subject]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentChat?.messages]);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ color: 'var(--muted)' }}>
        Loading...
      </div>
    );
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatLoading) return;
    const msg = input;
    setInput("");
    await sendMessage(msg);
  };

  const handleQuickAction = async (action: string) => {
    if (chatLoading) return;
    await sendMessage(action);
  };

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <header className="px-8 py-5 glass flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 -ml-2 rounded-full transition-colors"
            style={{ color: 'var(--muted)' }}
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="font-bold tracking-tight capitalize" style={{ color: 'var(--foreground)' }}>
            {subject} <span style={{ color: 'var(--accent)' }}>Assistant</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div
            className="px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2"
            style={{ backgroundColor: 'var(--surface)', color: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            {currentChat?.messages.filter(m => m.role === 'user').length || 0} questions asked
          </div>
          <button
            className="p-2 rounded-full transition-all"
            style={{ backgroundColor: 'var(--surface)', color: 'var(--muted)', border: '1px solid var(--border)' }}
            onClick={() => {
              // Reset chat for a new session
              useChatStore.setState({ currentChat: null });
              startChat(subject);
            }}
          >
            <RefreshCcw size={18} />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <div
        ref={scrollRef}
        className="flex-grow overflow-y-auto px-4 py-8 space-y-8 flex flex-col items-center"
      >
        <div className="w-full max-w-3xl space-y-6">
          {/* Welcome message if no messages yet */}
          {(!currentChat || currentChat.messages.length === 0) && !chatLoading && (
            <div className="text-center py-16 space-y-4">
              <div className="text-5xl">🧠</div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                Ready to explore <span className="capitalize">{subject}</span>?
              </h2>
              <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--muted)' }}>
                Ask a question and I'll guide you to the answer through the Socratic method — no spoilers, just discovery!
              </p>
            </div>
          )}

          {currentChat?.messages.map((m, i) => (
            <div
              key={i}
              className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className="max-w-[85%] p-5 rounded-2xl text-[15px] leading-relaxed whitespace-pre-wrap"
                style={m.role === 'user'
                  ? {
                      backgroundColor: 'var(--accent)',
                      color: 'var(--background)',
                      borderTopRightRadius: '8px',
                    }
                  : {
                      backgroundColor: 'var(--surface)',
                      color: 'var(--foreground)',
                      borderTopLeftRadius: '8px',
                      border: '1px solid var(--border)',
                    }
                }
              >
                {m.content}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex justify-start">
              <div
                className="p-5 rounded-2xl flex gap-1.5"
                style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--muted)' }} />
                <span className="w-2 h-2 rounded-full animate-bounce [animation-delay:0.2s]" style={{ backgroundColor: 'var(--muted)' }} />
                <span className="w-2 h-2 rounded-full animate-bounce [animation-delay:0.4s]" style={{ backgroundColor: 'var(--muted)' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6 shrink-0">
        <div className="max-w-3xl mx-auto space-y-3">
          {error && (
            <div
              className="rounded-2xl px-4 py-3 text-sm"
              style={{
                backgroundColor: '#fff1f2',
                color: '#9f1239',
                border: '1px solid #fecdd3',
              }}
            >
              {error}
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-2">
            <button
              className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
              style={{ backgroundColor: 'var(--surface)', color: 'var(--accent)', border: '1px solid var(--border)' }}
              onClick={() => handleQuickAction("Can you give me a hint?")}
            >
              <Lightbulb size={14} /> Get a Hint
            </button>
            <button
              className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
              style={{ backgroundColor: 'var(--surface)', color: 'var(--accent)', border: '1px solid var(--border)' }}
              onClick={() => handleQuickAction("Can you explain this concept more simply?")}
            >
              <HelpCircle size={14} /> Simplify
            </button>
          </div>

          <form onSubmit={handleSend} className="relative group">
            <input
              type="text"
              className="w-full p-5 pr-20 rounded-2xl shadow-tonal focus:outline-none transition-all"
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
              }}
              placeholder="Ask your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={chatLoading}
            />
            <button
              type="submit"
              className="absolute right-3 top-3 bottom-3 px-6 rounded-xl transition-all flex items-center justify-center disabled:opacity-50"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--background)',
              }}
              disabled={!input.trim() || chatLoading}
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
