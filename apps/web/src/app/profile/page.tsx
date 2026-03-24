"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore, themes } from "@/store/useThemeStore";
import { 
  User, 
  Settings, 
  LogOut, 
  Mail, 
  ArrowLeft,
  ChevronRight,
  Flame,
  LayoutGrid,
  Search,
  Check
} from "lucide-react";
import api from "@/lib/api";
import subjectsData from "@/data/subjects.json";

interface Subject {
  slug: string;
  name: string;
  description: string;
  icon: string;
  accent: string;
  isPermanent?: boolean;
}

export default function ProfilePage() {
  const { user, logout, checkAuth, loading } = useAuthStore();
  const router = useRouter();
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ color: 'var(--muted)' }}>
        Loading profile...
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const toggleSubject = async (slug: string) => {
    if (updating) return;
    
    const currentSubjects = user.subjects || [];
    const isPermanent = subjectsData.find(s => s.slug === slug)?.isPermanent;
    if (isPermanent) return; // Cannot toggle permanent subjects

    const newSubjects = currentSubjects.includes(slug)
      ? currentSubjects.filter(s => s !== slug)
      : [...currentSubjects, slug];

    setUpdating(true);
    try {
      const res = await api.patch("/user/subjects", { subjects: newSubjects });
      if (res.data.success) {
        await checkAuth(); // Refresh user data
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      {/* Header */}
      <header className="px-8 py-6 flex items-center justify-between sticky top-0 z-40 glass border-b border-[var(--border)]">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-[var(--surface)] rounded-xl transition-colors" style={{ color: 'var(--muted)' }}>
            <ArrowLeft size={20} />
          </Link>
          <div className="text-xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
            User <span style={{ color: 'var(--accent)' }}>Settings</span>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 hover:bg-[var(--surface)] rounded-xl transition-all text-sm font-bold"
          style={{ color: '#E06C75' }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </header>

      <main className="max-w-6xl mx-auto w-full px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-4 space-y-8">
            <div className="p-8 rounded-[2.5rem] bg-[var(--surface)] border border-[var(--border)] shadow-tonal text-center space-y-6">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-soft)] flex items-center justify-center text-white text-5xl font-black shadow-2xl">
                  {user.name.charAt(0)}
                </div>
                <div className="absolute bottom-1 right-1 p-2 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] shadow-lg">
                  <Flame size={18} className="text-[#FF8A65]" />
                </div>
              </div>
              
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight capitalize" style={{ color: 'var(--foreground)' }}>{user.name}</h2>
                <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>Curious Mind</p>
                <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-[var(--border)]">
                  <Mail size={14} style={{ color: 'var(--muted)' }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{user.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Explore & Discovery */}
          <div className="lg:col-span-8 space-y-12">
            
            <section className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-[var(--accent-soft)]" style={{ color: 'var(--accent)' }}>
                    <Search size={22} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight" style={{ color: 'var(--foreground)' }}>Explore Subjects</h3>
                    <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>Expand your intellectual horizons</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(subjectsData as Subject[]).map((subject) => {
                  const isEnabled = user.subjects?.includes(subject.slug) || subject.isPermanent;
                  const isPermanent = subject.isPermanent;

                  return (
                    <div 
                      key={subject.slug}
                      onClick={() => !isPermanent && toggleSubject(subject.slug)}
                      className={`p-6 rounded-3xl border transition-all cursor-pointer group ${isEnabled ? 'bg-[var(--surface)] border-[var(--accent)]' : 'bg-[var(--surface-alt)] border-[var(--border)] hover:border-[var(--muted)] opacity-60'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${isEnabled ? 'bg-[var(--background)]' : 'bg-[var(--surface)]'}`}>
                            {subject.icon}
                          </div>
                          <div>
                            <div className="font-bold" style={{ color: 'var(--foreground)' }}>{subject.name}</div>
                            <div className="text-[10px] font-medium leading-relaxed max-w-[150px]" style={{ color: 'var(--muted)' }}>
                              {subject.description}
                            </div>
                          </div>
                        </div>
                        
                        <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${isEnabled ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'border-[var(--border)] group-hover:border-[var(--muted)]'}`}>
                          {isEnabled && <Check size={14} />}
                        </div>
                      </div>
                      
                      {isPermanent && (
                        <div className="mt-4 inline-flex px-2 py-0.5 rounded bg-[var(--accent-soft)] text-[8px] font-black uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
                          Core Subject
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
