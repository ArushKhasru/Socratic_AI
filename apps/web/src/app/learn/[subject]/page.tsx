"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Brain,
  Bot,
  Eye,
  History,
  Lightbulb,
  Plus,
  Send,
  X,
  Trash2,
  Edit2,
  Check,
  Mic,
  Volume2,
  Share2,
  UserPlus,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { Chat, Message, useChatStore } from "@/store/useChatStore";

const HINT_PROMPT = "Get a Hint";
const REVEAL_PROMPT =
  "Reveal the correct answer now and explain it clearly in a concise way.";

type SpeechRecognitionConstructor = new () => {
  lang: string;
  interimResults: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: { results: { transcript: string }[][] }) => void) | null;
  start: () => void;
};

type BrowserSpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

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
  const [searchResults, setSearchResults] = useState<{ _id: string; name: string; email?: string }[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const activeChat = currentChat?.subject === subject ? currentChat : null;
  const userMessages = activeChat?.messages.filter((m: Message) => m.role === "user") || [];
  const questionCount = userMessages.filter(
    (m) => m.content !== HINT_PROMPT && m.content !== REVEAL_PROMPT
  ).length;
  const hintCount = userMessages.filter((m) => m.content === HINT_PROMPT).length;
  const hasRevealed = userMessages.some((m) => m.content === REVEAL_PROMPT);
  const canRevealAnswer = hintCount >= 3 && questionCount > 0 && !hasRevealed;
  const canUseHint = questionCount > 0 && !canRevealAnswer;

  const personalChats = chats.filter(
    (c) => c.userId === user?._id && (!c.collaborators || c.collaborators.length === 0)
  );
  const sharedWithOrByMe = chats.filter(
    (c) => c.userId !== user?._id || (c.collaborators && c.collaborators.length > 0)
  );

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin");
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

  useEffect(() => {
    const updateSidebarState = () => {
      setIsSidebarOpen(window.innerWidth >= 1024);
    };

    updateSidebarState();
    window.addEventListener("resize", updateSidebarState);
    return () => window.removeEventListener("resize", updateSidebarState);
  }, []);

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

  const handleSend = async () => {
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

  const saveTopic = async (chatId: string) => {
    if (editTopic.trim()) {
      await updateTopic(chatId, editTopic.trim());
    }
    setEditingChatId(null);
  };

  const startListening = () => {
    const speechWindow = window as BrowserSpeechWindow;
    const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
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
      className="relative flex min-h-screen overflow-hidden lg:h-screen"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="relative flex h-full min-w-0 flex-grow flex-col">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-70"
          style={{ background: "radial-gradient(circle at top, var(--accent-soft) 0%, transparent 70%)" }}
        />

        {/* Header Section (Floating Navbar) */}
        <header className="sticky top-0 z-40 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border)] transition-all">
          <div className="mx-auto flex w-full max-w-6xl shrink-0 items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="pressable p-2 transition-colors hover:bg-[var(--surface-alt)] rounded-xl text-[var(--muted)]"
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
              <div
                className="hidden lg:flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold bg-[var(--surface)] border border-[var(--border)]"
                style={{ color: "var(--muted)" }}
              >
                {questionCount} questions asked
              </div>

              {activeChat && activeChat.userId === user?._id && (
                <div className="relative">
                  <button
                    className={`pressable p-3 rounded-xl transition-all ${showShare ? 'bg-[var(--accent)] text-white' : 'hover:bg-[var(--surface-alt)] text-[var(--muted)]'}`}
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
                        placeholder="Search by email..."
                        className="focus-ring w-full rounded-xl border bg-[var(--background)] px-3 py-2 text-sm outline-none"
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
                              toast.success(`Shared with ${u.name}`);
                            }}
                            className="pressable flex w-full items-center gap-3 rounded-xl p-2 text-sm hover:bg-[var(--surface-alt)] transition-colors"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-bold">
                              {u.name[0]}
                            </div>
                            <div className="flex flex-col items-start overflow-hidden text-left">
                              <span className="font-medium text-[var(--foreground)] truncate w-full">{u.name}</span>
                              <span className="text-[10px] text-[var(--muted)] truncate w-full">{u.email || "No email available"}</span>
                            </div>
                            <UserPlus size={14} className="ml-auto text-[var(--muted)] shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                className={`pressable p-3 rounded-xl transition-all ${isSidebarOpen ? 'bg-[var(--accent)] text-white' : 'hover:bg-[var(--surface-alt)] text-[var(--muted)]'}`}
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                title="Toggle History"
              >
                <History size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* Chat Feed */}
        <div
          ref={scrollRef}
          className="custom-scrollbar flex-grow overflow-y-auto px-3 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10"
        >
          <div className="mx-auto max-w-3xl space-y-12 pb-32">
            {activeChat && activeChat.messages.length > 0 && (
              <div className="h-4" /> 
            )}
            {(!activeChat || activeChat.messages.length === 0) && !chatLoading && (
              <div className="flex flex-col items-center py-32 text-center">
                <div className="h-4" /> 
              </div>
            )}

            {activeChat?.messages.map((m: Message, i: number) => (
              <div
                key={i}
                className={`message-pop flex w-full ${m.role === "user" ? "justify-end" : "justify-start"}`}
                style={{ animationDelay: `${Math.min(i * 30, 180)}ms` }}
              >
                {m.role === "assistant" ? (
                  <div className="flex gap-4 items-start w-full group">
                    <div className="relative flex-shrink-0 mt-1">
                      <div className="absolute inset-0 bg-[var(--accent-soft)] blur-md rounded-full shadow-[0_0_20px_var(--accent-soft)]"></div>
                      <div className="relative w-10 h-10 rounded-full bg-[var(--surface-alt)] border border-[var(--accent-soft)] flex items-center justify-center overflow-hidden">
                        <Bot size={18} className="text-[var(--accent)]" />
                      </div>
                    </div>
                    <div className="relative">
                      <div className="bg-[var(--surface-alt)]/60 backdrop-blur-md p-6 rounded-2xl rounded-tl-none border border-[var(--border)] shadow-xl max-w-2xl">
                        <div className="prose prose-invert prose-sm max-w-none text-inherit leading-relaxed" style={{ color: 'var(--foreground)' }}>
                          {m.content}
                        </div>

                        <button
                          onClick={() => speak(m.content)}
                          className="absolute -bottom-8 right-0 p-2 text-[var(--muted)] hover:text-[var(--accent)] transition-colors opacity-0 group-hover:opacity-100"
                          title="Read out loud"
                        >
                          <Volume2 size={16} />
                        </button>
                      </div>

                      {/* Contextual Hint Placeholder when applicable */}
                      {i === activeChat.messages.length - 1 && canUseHint && m.role === 'assistant' && (
                        <div className="mt-8 flex justify-center w-full absolute -bottom-16 left-0 right-0 pointer-events-none">
                          <button
                            onClick={() => handleQuickAction(HINT_PROMPT)}
                            className="pressable pointer-events-auto px-4 py-2 bg-[var(--accent-soft)]/20 border border-[var(--accent-soft)] rounded-full flex items-center gap-2 hover:bg-[var(--accent-soft)]/40 transition-all"
                          >
                            <Lightbulb size={14} className="text-[var(--accent)]" />
                            <span className="text-[10px] text-[var(--accent)] font-bold uppercase tracking-widest">Get a hint</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4 items-start max-w-[85%]">
                    <div className="bg-[var(--accent)]/10 p-5 rounded-2xl rounded-tr-none border border-[var(--accent)]/20 shadow-lg">
                      <p className="text-[var(--foreground)] leading-relaxed text-sm whitespace-pre-wrap">
                        {m.content}
                      </p>
                    </div>
                    <div className="w-9 h-9 shrink-0 mt-1 rounded-full bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center overflow-hidden shadow-inner">
                      <div className="text-xs font-black text-[var(--accent)]">
                        {user.name[0].toUpperCase()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {chatLoading && (
              <div className="flex justify-start">
                <div className="flex gap-2 items-center px-6 py-4 bg-[var(--surface-alt)]/40 rounded-2xl border border-[var(--border)]">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent)]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Dock */}
        <div className="safe-bottom shrink-0 px-3 pb-4 sm:px-6 sm:pb-6 md:px-8 md:pb-10">
          <div className="mx-auto max-w-3xl relative">
            {error && (
              <div className="absolute -top-14 left-0 right-0 rounded-xl px-4 py-2 text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 mb-4 animate-in fade-in slide-in-from-bottom-2">
                {error}
              </div>
            )}

            {!activeChat || activeChat.userId === user?._id ? (
              <div className="bg-[var(--surface-alt)]/40 backdrop-blur-2xl p-2 rounded-2xl border border-[var(--border)] shadow-2xl flex items-center gap-2 group focus-within:border-[var(--accent)]/50 transition-all">
                <textarea
                  className="flex-1 bg-transparent border-none focus:ring-0 text-[var(--foreground)] placeholder-[#5a6b8c] py-3 px-4 resize-none font-medium text-sm leading-relaxed"
                  placeholder="Illuminate your reasoning..."
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                  disabled={chatLoading}
                />

                <div className="flex items-center gap-1 pr-1">
                  <button
                    type="button"
                    onClick={startListening}
                    className={`pressable p-3 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-[var(--surface-alt)]/80 text-[var(--muted)]'}`}
                    disabled={chatLoading}
                  >
                    <Mic size={18} />
                  </button>

                  {canRevealAnswer && (
                    <button
                      type="button"
                      onClick={() => handleQuickAction(REVEAL_PROMPT)}
                      className="pressable p-3 rounded-xl hover:bg-[var(--surface-alt)]/80 text-[var(--accent)] transition-all"
                      title="Reveal Answer"
                    >
                      <Eye size={18} />
                    </button>
                  )}

                  <button
                    onClick={() => void handleSend()}
                    disabled={!input.trim() || chatLoading}
                    className="pressable shimmer-sweep h-11 w-11 flex items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--secondary)] text-[var(--background)] shadow-xl shadow-[var(--accent)]/10 hover:scale-105 transition-all disabled:opacity-30 group"
                  >
                    <Send size={18} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center rounded-2xl border bg-[var(--surface-alt)] opacity-80" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs font-medium text-[var(--muted)] tracking-wide">
                  READ-ONLY ACCESS • JOIN THE DISCUSSION ON YOUR OWN WORKSPACE
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close history panel"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/35 lg:hidden"
        />
      )}

      {/* History Archive Sidebar (Right) */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-[88vw] max-w-[340px] shrink-0 flex-col overflow-hidden bg-[var(--background)] transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:w-auto lg:max-w-none lg:transition-all lg:duration-500 ${
          isSidebarOpen
            ? "translate-x-0 border-l border-[var(--border)] lg:w-[340px]"
            : "translate-x-full border-l-0 lg:w-0"
        }`}
      >
        <div className="custom-scrollbar flex h-full w-full flex-col overflow-y-auto p-4 pt-6 sm:p-5 lg:w-[340px] lg:p-6 space-y-8">
          <div className="flex items-center justify-between sticky top-0 bg-[var(--background)] py-2 z-10 pointer-events-none">
            <div>
              <h2 className="font-bold tracking-tight">History</h2>
              <div className="text-[10px] uppercase tracking-[0.24em]" style={{ color: "var(--muted)" }}>
                Subject sessions
              </div>
            </div>
            <button className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors pointer-events-auto" onClick={() => setIsSidebarOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
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

            {personalChats.length > 0 && (
              <div className="space-y-4">
                <h5 className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest px-2">Previous Sessions</h5>
                <div className="space-y-3">
                  {personalChats.map((chat: Chat) => (
                    <div
                      key={chat._id}
                      onClick={() => {
                        fetchChat(chat._id);
                        router.push(`/learn/${subject}?chatId=${chat._id}`);
                      }}
                      className={`p-4 bg-[var(--surface-alt)]/30 hover:bg-[var(--surface-alt)]/60 border rounded-2xl transition-all cursor-pointer group relative ${activeChat?._id === chat._id ? 'border-[var(--accent)] bg-[var(--surface-alt)]/80' : 'border-[var(--border)]'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        {editingChatId === chat._id ? (
                          <div className="flex items-center gap-2">
                            <input
                              autoFocus
                              className="focus-ring w-40 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs font-bold text-[var(--foreground)]"
                              value={editTopic}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => setEditTopic(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.stopPropagation();
                                  void saveTopic(chat._id);
                                }
                              }}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                void saveTopic(chat._id);
                              }}
                              className="pressable rounded-lg p-1 text-[var(--accent)]"
                            >
                              <Check size={12} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors line-clamp-1">
                            {chat.topic || chat.messages.find(m => m.role === 'user')?.content.slice(0, 30) || `Session ${chat._id.slice(-4)}`}
                          </span>
                        )}
                        <div className="flex flex-col items-end">
                          <span className="text-[8px] text-[var(--muted)] font-bold uppercase tracking-tighter">
                            {chat.updatedAt ? new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                          </span>
                          <span className="text-[7px] text-[var(--muted)] opacity-60 font-medium">
                            {chat.updatedAt ? new Date(chat.updatedAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-[var(--muted)] line-clamp-2 leading-relaxed italic pr-8">
                        &quot;{chat.messages[0]?.content || "Initial prompt pending..."}&quot;
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex gap-2">
                          <span className="px-2 py-0.5 bg-[var(--accent-soft)] text-[var(--accent)] text-[8px] font-black rounded-full uppercase tracking-widest">
                            {chat.messages.length} Steps
                          </span>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={e => { e.stopPropagation(); startEditing(e, chat); }}
                            className="p-1.5 hover:bg-[var(--background)] rounded-lg transition-colors"
                          >
                            <Edit2 size={12} className="text-[var(--muted)]" />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); handleDelete(e, chat._id); }}
                            className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 size={12} className="text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sharedWithOrByMe.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-[var(--border)]">
                <h5 className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest px-2">Shared Sessions</h5>
                <div className="space-y-3">
                  {sharedWithOrByMe.map((chat: Chat) => (
                    <div
                      key={chat._id}
                      onClick={() => {
                        fetchChat(chat._id);
                        router.push(`/learn/${subject}?chatId=${chat._id}`);
                      }}
                      className={`p-4 bg-[var(--surface-alt)]/20 hover:bg-[var(--surface-alt)]/40 border rounded-2xl transition-all cursor-pointer group relative ${activeChat?._id === chat._id ? 'border-[var(--accent)]' : 'border-[var(--border)]'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors line-clamp-1">
                          {chat.topic || `Shared Dialogue`}
                        </span>
                        <span className="rounded-full bg-[var(--accent-soft)]/20 px-1.5 py-0.5 text-[7px] font-black uppercase text-[var(--accent)]">
                          {chat.userId === user?._id ? "By Me" : "Shared"}
                        </span>
                      </div>
                      <div className="mt-2 text-[8px] text-[var(--muted)] flex justify-between items-center">
                        <span>{chat.updatedAt ? new Date(chat.updatedAt).toLocaleDateString() : ''}</span>
                        <span>{chat.updatedAt ? new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}

