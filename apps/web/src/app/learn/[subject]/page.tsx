"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  History,
  Lightbulb,
  Plus,
  RefreshCcw,
  Send,
  X,
  Activity,
  Sparkles,
  LayoutDashboard,
  Trash2,
  Edit2,
  Check,
  Mic,
  Volume2,
  Share2,
  UserPlus
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Chat, Message, useChatStore } from "@/store/useChatStore";

const HINT_PROMPT = "Get a Hint";
const REVEAL_PROMPT =
  "Reveal the correct answer now and explain it clearly in a concise way.";

export default function ChatPage() {
  const { subject } = useParams() as { subject: string };
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chatId");
  const { user, checkAuth, loading: authLoading } = useAuthStore();
  const {
    currentChat,
    chats,
    fetchSubjectChats,
    startChat,
    sendMessage,
    fetchChat,
    deleteChat,
    updateTopic,
    loading: chatLoading,
    error,
  } = useChatStore();
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTopic, setEditTopic] = useState("");
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ _id: string; name: string }[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => typeof window === "undefined" || window.innerWidth >= 1024
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const activeChat = currentChat?.subject === subject ? currentChat : null;
  const userMessages = activeChat?.messages.filter((m: Message) => m.role === "user") || [];
  const questionCount = userMessages.filter(
    (m) => m.content !== HINT_PROMPT && m.content !== REVEAL_PROMPT
  ).length;
  const hintCount = userMessages.filter((m) => m.content === HINT_PROMPT).length;
  const canUseHint = questionCount > 0;
  const canRevealAnswer = hintCount >= 3 && questionCount > 0;

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      if (chatId) {
        fetchChat(chatId);
      } else {
        useChatStore.setState({ currentChat: null, chats: [], error: null });
      }
      fetchSubjectChats(subject);
      useChatStore.getState().fetchSharedChats();
    }
  }, [user, subject, chatId, fetchSubjectChats, fetchChat]);

  useEffect(() => {
    const search = async () => {
      if (searchQuery.trim().length > 1) {
        const results = await useChatStore.getState().searchUsers(searchQuery);
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    };
    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeChat?.messages]);

  if (authLoading || !user) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ color: "var(--muted)" }}
      >
        Loading...
      </div>
    );
  }

  const ensureSession = async () => {
    if (activeChat) {
      return activeChat;
    }

    const createdChat = await startChat(subject, { forceNew: true });
    return createdChat;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatLoading) return;

    const msg = input;
    setInput("");

    const session = await ensureSession();
    if (!session) return;

    await sendMessage(msg);
    fetchSubjectChats(subject);
  };

  const handleQuickAction = async (action: string) => {
    if (chatLoading) return;

    const session = await ensureSession();
    if (!session) return;

    await sendMessage(action);
    fetchSubjectChats(subject);
  };

  const handleDelete = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this session?")) {
      await deleteChat(chatId);
    }
  };

  const startEditing = (e: React.MouseEvent, chat: Chat) => {
    e.stopPropagation();
    setEditingChatId(chat._id);
    setEditTopic(chat.topic || "");
  };

  const saveTopic = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (editTopic.trim()) {
      await updateTopic(chatId, editTopic.trim());
    }
    setEditingChatId(null);
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? " " : "") + transcript);
    };

    recognition.start();
  };

  const speak = (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="relative flex h-full min-w-0 flex-grow flex-col">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-70"
          style={{ background: "radial-gradient(circle at top, var(--accent-soft) 0%, transparent 70%)" }}
        />

        <header className="glass z-10 flex shrink-0 items-center justify-between px-8 py-5">
           <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 transition-colors hover:bg-[var(--surface-alt)] rounded-xl"
              style={{ color: "var(--muted)" }}
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="hidden sm:block">
              <div
                className="font-bold tracking-tight capitalize"
                style={{ color: "var(--foreground)" }}
              >
                {subject} <span style={{ color: "var(--accent)" }}>Assistant</span>
              </div>
              <div
                className="text-[10px] font-black uppercase tracking-[0.24em]"
                style={{ color: "var(--muted)" }}
              >
                Guided problem solving
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/progress" className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-bold hover:bg-[var(--surface-alt)] rounded-xl transition-all" style={{ color: "var(--muted)" }}>
              <Activity size={18} />
              Progress
            </Link>
            <Link href="/profile" className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-bold hover:bg-[var(--surface-alt)] rounded-xl transition-all" style={{ color: "var(--muted)" }}>
              <Sparkles size={18} />
              Atelier
            </Link>
            
            <div className="h-6 w-px bg-[var(--border)] mx-2 hidden lg:block" />

            <div
              className="hidden lg:flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold bg-[var(--surface)] border border-[var(--border)]"
              style={{ color: "var(--muted)" }}
            >
              {questionCount} questions asked
            </div>
            
            <button
               className="p-3 rounded-xl transition-all hover:bg-[var(--surface-alt)] text-[var(--muted)]"
               onClick={() => {
                 useChatStore.setState({ currentChat: null });
                 router.push(`/learn/${subject}`);
               }}
               title="New session"
             >
               <Plus size={18} />
             </button>

             {activeChat && (
               <div className="relative">
                 <button
                   className={`p-3 rounded-xl transition-all ${showShare ? 'bg-[var(--accent)] text-white' : 'hover:bg-[var(--surface-alt)] text-[var(--muted)]'}`}
                   onClick={() => setShowShare(!showShare)}
                   title="Share Session"
                 >
                   <Share2 size={18} />
                 </button>

                 {showShare && (
                   <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border bg-[var(--surface)] p-4 shadow-xl z-50 overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                     <div className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Share with user</div>
                     <input
                       autoFocus
                       type="text"
                       placeholder="Search by name..."
                       className="w-full rounded-xl border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                       style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                       value={searchQuery}
                       onChange={e => setSearchQuery(e.target.value)}
                     />
                     
                     <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                       {searchResults.map(u => (
                         <button
                           key={u._id}
                           onClick={async () => {
                             await useChatStore.getState().shareChat(activeChat._id, u._id);
                             setShowShare(false);
                             alert(`Shared with ${u.name}`);
                           }}
                           className="flex w-full items-center gap-3 rounded-xl p-2 text-sm hover:bg-[var(--surface-alt)] transition-colors"
                         >
                           <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-bold">
                             {u.name[0]}
                           </div>
                           <span className="font-medium text-[var(--foreground)]">{u.name}</span>
                           <UserPlus size={14} className="ml-auto text-[var(--muted)]" />
                         </button>
                       ))}
                       {searchQuery.length > 1 && searchResults.length === 0 && (
                         <div className="p-4 text-center text-xs text-[var(--muted)]">No users found</div>
                       )}
                     </div>
                   </div>
                 )}
               </div>
             )}

            <button
              className={`p-3 rounded-xl transition-all ${isSidebarOpen ? 'bg-[var(--accent)] text-white' : 'hover:bg-[var(--surface-alt)] text-[var(--muted)]'}`}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              title="Toggle History"
            >
              <History size={18} />
            </button>
            
            <div className="hidden rounded-full px-4 py-2 text-sm font-medium md:block" style={{ backgroundColor: 'var(--surface)', color: 'var(--foreground)', border: '1px solid var(--border)' }}>
              Hello, <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{user.name}</span>
            </div>
          </div>
        </header>

        <div
          ref={scrollRef}
          className="flex flex-grow flex-col items-center overflow-y-auto px-4 py-8"
        >
          <div className="w-full max-w-3xl space-y-6">
            {(!activeChat || activeChat.messages.length === 0) && !chatLoading && (
              <div className="reveal-up space-y-4 py-16 text-center">
                <div className="floating-orb text-5xl">🧠</div>
                <h2 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
                  Ready to explore <span className="capitalize">{subject}</span>?
                </h2>
                <p className="mx-auto max-w-md text-sm leading-7" style={{ color: "var(--muted)" }}>
                  Start with a question first. Hints unlock after your first real question, and reveal appears after three hints.
                </p>
              </div>
            )}

            {activeChat?.messages.map((m: Message, i: number) => (
              <div
                key={i}
                className={`reveal-up flex w-full ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`relative max-w-[85%] whitespace-pre-wrap rounded-2xl p-5 text-[15px] leading-relaxed shadow-sm ${
                    m.role === "user"
                      ? "rounded-tr-none bg-[var(--accent)] text-white"
                      : "rounded-tl-none bg-[var(--surface-alt)] border"
                  }`}
                  style={{
                    borderColor: m.role !== "user" ? "var(--border)" : "transparent",
                  }}
                >
                  <div className="prose prose-sm max-w-none text-inherit leading-relaxed">
                    {m.content}
                  </div>

                  {m.role === "assistant" && (
                    <button 
                      onClick={() => speak(m.content)}
                      className="absolute -bottom-6 right-0 p-1 hover:text-[var(--accent)] transition-colors opacity-60 hover:opacity-100"
                      title="Read out loud"
                    >
                      <Volume2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {chatLoading && (
              <div className="flex justify-start">
                <div className="panel-surface flex gap-1.5 rounded-2xl p-5">
                  <span
                    className="h-2 w-2 animate-bounce rounded-full"
                    style={{ backgroundColor: "var(--muted)" }}
                  />
                  <span
                    className="h-2 w-2 animate-bounce rounded-full [animation-delay:0.2s]"
                    style={{ backgroundColor: "var(--muted)" }}
                  />
                  <span
                    className="h-2 w-2 animate-bounce rounded-full [animation-delay:0.4s]"
                    style={{ backgroundColor: "var(--muted)" }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 p-6">
          <div className="mx-auto max-w-3xl space-y-3">
            {error && (
              <div
                className="rounded-2xl px-4 py-3 text-sm"
                style={{
                  backgroundColor: "#fff1f2",
                  color: "#9f1239",
                  border: "1px solid #fecdd3",
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSend} className="relative flex items-center">
              <button
                type="button"
                className="button-ghost group absolute top-3 bottom-3 left-3 z-10 flex items-center rounded-xl px-4"
                style={{ color: canUseHint ? "var(--accent)" : "var(--muted)" }}
                onClick={() => handleQuickAction(HINT_PROMPT)}
                disabled={chatLoading || !canUseHint}
                title={canUseHint ? "Get a Hint" : "Ask at least one question to unlock hints"}
              >
                <Lightbulb size={20} />
                <span className="w-0 overflow-hidden whitespace-nowrap text-sm font-bold uppercase tracking-wider opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:w-10 group-hover:opacity-100">
                  Hint
                </span>
              </button>

              {canRevealAnswer && (
                <button
                  type="button"
                  className="button-ghost absolute top-3 bottom-3 left-[112px] z-10 flex items-center gap-2 rounded-xl px-4 text-sm font-bold uppercase tracking-[0.18em]"
                  style={{ color: "var(--accent)" }}
                  onClick={() => handleQuickAction(REVEAL_PROMPT)}
                  disabled={chatLoading}
                  title="Reveal the correct answer"
                >
                  <Eye size={18} />
                </button>
              )}

              <input
                type="text"
                className="panel-surface shadow-tonal w-full rounded-[1.7rem] p-5 pr-32 transition-all focus:outline-none"
                style={{
                  color: "var(--foreground)",
                  paddingLeft: canRevealAnswer ? "238px" : "124px",
                }}
                placeholder="Ask your question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={chatLoading}
              />

              <div className="absolute right-3 top-3 bottom-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={startListening}
                  className={`button-ghost flex h-full items-center justify-center rounded-xl px-4 transition-all ${
                    isListening ? "animate-pulse text-red-500 scale-110" : ""
                  }`}
                  disabled={chatLoading}
                  title="Voice Input"
                >
                  <Mic size={20} />
                </button>
                <button
                  type="submit"
                  className="button-accent flex h-full items-center justify-center rounded-xl px-6 disabled:opacity-50"
                  disabled={!input.trim() || chatLoading}
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <aside
        className={`flex shrink-0 flex-col overflow-hidden border-l bg-[var(--background)] transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "w-80 border-opacity-100" : "w-0 border-opacity-0"
        }`}
        style={{ borderColor: "var(--border)" }}
      >
        <div className="panel-surface flex h-full w-80 flex-col rounded-l-[2rem] border-l-0">
          <div
            className="flex shrink-0 items-center justify-between border-b p-6"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2">
              <History size={18} className="text-[var(--accent)]" />
              <div>
                <h2 className="font-bold tracking-tight">History</h2>
                <div className="text-[10px] uppercase tracking-[0.24em]" style={{ color: "var(--muted)" }}>
                  Subject sessions
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="button-ghost rounded-lg p-1"
              style={{ color: "var(--muted)" }}
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-grow space-y-3 overflow-y-auto p-4">
            <button
              onClick={() => {
                useChatStore.setState({ currentChat: null });
                router.push(`/learn/${subject}`);
              }}
              className="interactive-card flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-4 text-sm font-bold"
              style={{ borderColor: "var(--border)", color: "var(--muted)", backgroundColor: "var(--accent-soft)" }}
            >
              <Plus size={18} />
              New Session
            </button>

            <div
              className="pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ color: "var(--muted)" }}
            >
              Recent Dialogues
            </div>

            {chats.length === 0 ? (
              <div className="py-8 text-center text-xs italic" style={{ color: "var(--muted)" }}>
                No past dialogues yet
              </div>
            ) : (
              chats.map((chat: Chat) => (
                <div
                  key={chat._id}
                  onClick={() => {
                    fetchChat(chat._id);
                    router.push(`/learn/${subject}?chatId=${chat._id}`);
                  }}
                  className={`interactive-card group relative w-full rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                    activeChat?._id === chat._id
                      ? "border-[var(--accent)] bg-[var(--surface)]"
                      : "border-[var(--border)]"
                  }`}
                >
                  <div className="flex flex-col gap-1 pr-12">
                    <div
                      className="text-[10px] font-bold opacity-50"
                      style={{ color: "var(--foreground)" }}
                    >
                      {chat.createdAt ? new Date(chat.createdAt).toLocaleDateString() : 'Recent'} • {chat.messages.length} messages
                    </div>
                    {editingChatId === chat._id ? (
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <input
                          autoFocus
                          className="w-full bg-transparent text-xs font-bold outline-none border-b border-[var(--accent)]"
                          value={editTopic}
                          onChange={e => setEditTopic(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && saveTopic(e as any, chat._id)}
                        />
                        <button onClick={e => saveTopic(e, chat._id)} className="text-[var(--accent)]">
                          <Check size={14} />
                        </button>
                      </div>
                    ) : (
                      <div
                        className="line-clamp-1 text-xs font-bold"
                        style={{ color: "var(--foreground)" }}
                      >
                        {chat.topic || 
                         chat.messages.find(m => m.role === 'user')?.content.slice(0, 30) || 
                         `Session ${chat._id.slice(-4)}`}
                      </div>
                    )}
                    <div
                      className="line-clamp-1 text-[10px] opacity-70"
                      style={{ color: "var(--muted)" }}
                    >
                      {chat.messages[0]?.content || "No messages yet"}
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={e => editingChatId === chat._id ? saveTopic(e, chat._id) : startEditing(e, chat)}
                      className="p-1 hover:text-[var(--accent)] transition-colors"
                    >
                      {editingChatId === chat._id ? <Check size={14} /> : <Edit2 size={14} />}
                    </button>
                    <button 
                      onClick={e => handleDelete(e, chat._id)}
                      className="p-1 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-3 border-t p-4" style={{ borderColor: "var(--border)" }}>
            <div
              className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ color: "var(--muted)" }}
            >
              Explore Other Subjects
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "physics", icon: "⚛️" },
                { id: "chemistry", icon: "🧪" },
                { id: "math", icon: "📐" },
                { id: "biology", icon: "🌿" },
              ]
                .filter((s) => s.id !== subject)
                .map((s) => (
                  <Link
                    key={s.id}
                    href={`/learn/${s.id}`}
                    className="interactive-card flex flex-col items-center gap-1 rounded-xl border p-3"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <span className="text-xl">{s.icon}</span>
                    <span
                      className="text-[10px] font-bold capitalize"
                      style={{ color: "var(--foreground)" }}
                    >
                      {s.id === "math" ? "Math" : s.id}
                    </span>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
