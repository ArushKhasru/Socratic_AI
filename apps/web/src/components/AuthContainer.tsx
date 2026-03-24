'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import AuthTabs from "@/components/AuthTabs";
import { useThemeStore } from "@/store/useThemeStore";
import {
  GraduationCap,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
} from "lucide-react";

export default function AuthContainer() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { user, setUser } = useAuthStore();
  const router = useRouter();

  // Hydrate theme on mount
  const hydrate = useThemeStore((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [user, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const endpoint = mode === 'signin' ? "/auth/signin" : "/auth/signup";
      const payload = mode === 'signin' ? { email, password } : { name, email, password };
      const response = await api.post(endpoint, payload);

      if (response.data.success) {
        setUser(response.data.data);
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || `${mode === 'signin' ? 'Login' : 'Signup'} failed.`);
    }
  };

  const motivationList = [
    {
      icon: <Sparkles size={18} style={{ color: 'var(--accent)' }} />,
      title: "Discovery-Based Learning",
      description: "Learn through scaffolding and guided questions."
    },
    {
      icon: <Zap size={18} style={{ color: 'var(--accent)' }} />,
      title: "The Socratic Method",
      description: "Master subjects by exploring the why, not just the what."
    }
  ];

  return (
    <div className="flex min-h-screen font-sans" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Side Content */}
      <div
        className="hidden lg:flex w-[45%] flex-col justify-between p-16 relative overflow-hidden"
        style={{ backgroundColor: 'var(--surface)', borderRight: '1px solid var(--border)' }}
      >
        <div className="flex items-center space-x-3 relative z-10">
          <GraduationCap size={24} style={{ color: 'var(--accent)' }} />
          <span className="text-xl font-black uppercase tracking-[0.2em]" style={{ color: 'var(--foreground)' }}>
            Socratic
          </span>
        </div>

        <div className="relative z-10 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h1 className="text-5xl font-black leading-[1.05] tracking-tighter" style={{ color: 'var(--foreground)' }}>
              {mode === 'signin' ? "Welcome back to the Socratic." : "Architect your own discovery."}
            </h1>
            <p className="text-lg max-w-sm leading-relaxed font-medium" style={{ color: 'var(--muted)' }}>
              A workspace where the art of the question transforms the path of your learning.
            </p>
          </motion.div>

          <div className="space-y-6">
            {motivationList.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + (i * 0.1) }}
                className="flex items-start space-x-4 max-w-sm"
              >
                <div
                  className="mt-1 p-2 rounded-lg"
                  style={{ border: '1px solid var(--border)' }}
                >
                  {m.icon}
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--foreground)' }}>{m.title}</h3>
                  <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>{m.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--border)' }}>
            Powered by Socratic Intelligence
          </p>
        </div>
      </div>

      {/* Form Area */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
        <motion.div
          layout
          className="w-full max-w-sm space-y-10"
        >
          <AuthTabs activeTab={mode} onChange={(m) => { setMode(m); setError(""); }} />

          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tighter" style={{ color: 'var(--foreground)' }}>
                {mode === 'signin' ? "Welcome Back" : "Welcome to Socratics"}
              </h2>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
                {mode === 'signin' ? "Enter your coordinates" : "Begin your intellectual archive"}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-5">
              <AnimatePresence mode="popLayout">
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -20 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -20 }}
                    className="space-y-2"
                  >
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1" style={{ color: 'var(--muted)' }}>Name</label>
                    <input
                      type="text"
                      required
                      className="w-full px-5 py-4 rounded-xl focus:outline-none transition-all font-medium"
                      style={{
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                        color: 'var(--foreground)',
                      }}
                      placeholder="e.g. Socrates"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2 mt-10">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1" style={{ color: 'var(--muted)' }}>Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-5 py-4 rounded-xl focus:outline-none transition-all font-medium"
                  style={{
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                  }}
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1" style={{ color: 'var(--muted)' }}>
                  {mode === 'signin' ? 'Enter your Password' : 'Create your Password'}
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-5 py-4 rounded-xl focus:outline-none transition-all font-medium"
                  style={{
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                  }}
                  placeholder={mode === 'signin' ? '••••••••' : 'Create your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 text-[10px] font-black uppercase tracking-widest rounded-lg"
                  style={{
                    backgroundColor: '#E06C7522',
                    color: '#E06C75',
                    border: '1px solid #E06C7544',
                  }}
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                className="w-full py-5 text-xs font-black uppercase tracking-[0.3em] rounded-xl active:scale-[0.98] transition-all shadow-xl flex items-center justify-center group"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--background)',
                }}
              >
                {mode === 'signin' ? 'Sign In' : 'Sign Up'}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="flex items-center space-x-4">
              <div className="flex-1" style={{ borderTop: '1px solid var(--border)' }} />
              <span className="text-[8px] font-black uppercase tracking-[0.5em]" style={{ color: 'var(--border)' }}>Or Sign In With</span>
              <div className="flex-1" style={{ borderTop: '1px solid var(--border)' }} />
            </div>

            <button
              className="w-full py-4 rounded-xl transition-all font-black text-[9px] uppercase tracking-widest flex items-center justify-center space-x-3 group"
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--muted)',
              }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>Continue With Google</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
