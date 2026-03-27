"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { 
  LogOut, 
  Mail, 
  ArrowLeft,
  Flame,
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
    if (!loading && !user) router.push("/signin");
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
    router.push("/signin");
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
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[var(--border)] px-3 py-2.5 glass sm:px-6 sm:py-4 lg:px-8 lg:py-6 slide-down-enter">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <Link href="/dashboard" className="p-1.5 sm:p-2 hover:bg-[var(--surface)] rounded-lg sm:rounded-xl transition-colors flex-shrink-0" style={{ color: 'var(--muted)' }}>
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
          </Link>
          <div className="text-base sm:text-xl font-bold tracking-tight truncate" style={{ color: 'var(--foreground)' }}>
            User <span style={{ color: 'var(--accent)' }}>Settings</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-bold transition-all hover:bg-[var(--surface)] mobile-tap-feedback flex-shrink-0"
          style={{ color: '#E06C75' }}
        >
          <LogOut size={16} className="sm:w-4.5 sm:h-4.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </header>

      <main className="mx-auto w-full max-w-6xl px-3 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-10 lg:gap-12">

          {/* Left Column: Profile Card */}
          <div className="lg:col-span-4 space-y-6 sm:space-y-8">
            <div className="p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] bg-[var(--surface)] border border-[var(--border)] shadow-tonal text-center space-y-4 sm:space-y-6 bounce-enter">
              <div className="relative inline-block">
                <div className="w-24 sm:w-32 h-24 sm:h-32 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-soft)] flex items-center justify-center text-white text-3xl sm:text-5xl font-black shadow-2xl">
                  {user.name.charAt(0)}
                </div>
                <div className="absolute bottom-0 right-0 p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] shadow-lg mobile-tap-feedback">
                  <Flame size={16} className="sm:w-4.5 sm:h-4.5 text-[#FF8A65]" />
                </div>
              </div>

              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight capitalize" style={{ color: 'var(--foreground)' }}>{user.name}</h2>
                <p className="text-[8px] sm:text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>Curious Mind</p>
                <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[var(--border)]">
                  <Mail size={12} className="sm:w-3.5 sm:h-3.5 text-[var(--muted)]" />
                  <span className="text-[10px] sm:text-xs font-medium truncate" style={{ color: 'var(--muted)' }}>{user.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Explore & Discovery */}
          <div className="lg:col-span-8 space-y-8 sm:space-y-10 lg:space-y-12">

            <section className="space-y-5 sm:space-y-6 lg:space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 slide-up-enter">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                  <div className="p-2 sm:p-3 rounded-lg sm:rounded-2xl bg-[var(--accent-soft)] flex-shrink-0" style={{ color: 'var(--accent)' }}>
                    <Search size={18} className="sm:w-5.5 sm:h-5.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg sm:text-2xl font-black tracking-tight" style={{ color: 'var(--foreground)' }}>Explore Subjects</h3>
                    <p className="text-[8px] sm:text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>Expand your horizons</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 stagger-list">
                {(subjectsData as Subject[]).map((subject, idx) => {
                  const isEnabled = user.subjects?.includes(subject.slug) || subject.isPermanent;
                  const isPermanent = subject.isPermanent;

                  return (
                    <div
                      key={subject.slug}
                      onClick={() => !isPermanent && toggleSubject(subject.slug)}
                      className={`p-4 sm:p-6 rounded-xl sm:rounded-3xl border transition-all cursor-pointer group mobile-tap-feedback ${isEnabled ? 'bg-[var(--surface)] border-[var(--accent)]' : 'bg-[var(--surface-alt)] border-[var(--border)] hover:border-[var(--muted)] opacity-60'}`}
                      style={{ animationDelay: `${idx * 60}ms` }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                          <div className={`w-10 sm:w-12 h-10 sm:h-12 rounded-lg sm:rounded-2xl flex items-center justify-center text-lg sm:text-2xl shadow-sm flex-shrink-0 ${isEnabled ? 'bg-[var(--background)]' : 'bg-[var(--surface)]'}`}>
                            {subject.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-sm sm:text-base truncate" style={{ color: 'var(--foreground)' }}>{subject.name}</div>
                            <div className="text-[8px] sm:text-[10px] font-medium leading-relaxed line-clamp-2" style={{ color: 'var(--muted)' }}>
                              {subject.description}
                            </div>
                          </div>
                        </div>

                        <div className={`w-5 sm:w-6 h-5 sm:h-6 rounded-lg border flex items-center justify-center transition-colors flex-shrink-0 ${isEnabled ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'border-[var(--border)] group-hover:border-[var(--muted)]'}`}>
                          {isEnabled && <Check size={12} className="sm:w-3.5 sm:h-3.5" />}
                        </div>
                      </div>

                      {isPermanent && (
                        <div className="mt-3 inline-flex px-2 py-0.5 rounded text-[7px] sm:text-[8px] font-black uppercase tracking-widest" style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
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
