'use client';

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import AuthTabs from "@/components/AuthTabs";
import {
  BrandMark,
  EmailGlyph,
  GoogleMark,
  PasswordGlyph,
  ScholarOrbIllustration,
  SubmitArrow,
  VisibilityGlyph,
} from "@/components/icons/AuthIcons";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore } from "@/store/useThemeStore";
import api from "@/lib/api";

export default function AuthContainer() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { user, setUser } = useAuthStore();
  const hydrate = useThemeStore((state) => state.hydrate);
  const pathname = usePathname();
  const router = useRouter();
  const mode: "signin" | "signup" = pathname === "/signup" ? "signup" : "signin";

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [router, user]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const endpoint = mode === "signin" ? "/auth/signin" : "/auth/signup";
      const payload = mode === "signin"
        ? { email, password }
        : { name, email, password };

      const response = await api.post(endpoint, payload);

      if (response.data.success) {
        setUser(response.data.data);
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error
        : undefined;
      setError(message || `${mode === "signin" ? "signin" : "Signup"} failed.`);
    }
  };

  const panelStyle = {
    background: "rgba(32, 40, 57, 0.42)",
    border: "1px solid color-mix(in srgb, var(--border) 84%, white 8%)",
    backdropFilter: "blur(22px)",
    WebkitBackdropFilter: "blur(22px)",
  } as const;

  const inputShellStyle = {
    backgroundColor: "color-mix(in srgb, var(--surface-alt) 62%, transparent)",
    border: "1px solid color-mix(in srgb, var(--border) 76%, transparent)",
    color: "var(--foreground)",
  } as const;

  return (
    <main
      className="flex min-h-screen overflow-hidden"
      style={{ fontFamily: "Inter, Segoe UI, Arial, sans-serif", backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      <section
        className="relative hidden min-h-screen w-1/2 items-center justify-center overflow-hidden px-12 py-16 lg:flex"
        style={{ backgroundColor: "color-mix(in srgb, var(--background) 84%, black 16%)" }}
      >
        <div
          className="absolute -left-24 -top-24 h-[30rem] w-[30rem] rounded-full blur-[120px]"
          style={{ background: "color-mix(in srgb, var(--accent) 16%, transparent)" }}
        />
        <div
          className="absolute -bottom-24 -right-20 h-[26rem] w-[26rem] rounded-full blur-[110px]"
          style={{ background: "color-mix(in srgb, #44e2cd 16%, transparent)" }}
        />

        <div className="absolute left-12 top-12 flex items-center gap-3">
          <BrandMark />
          <span className="text-2xl font-bold tracking-tight" style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', Inter, Segoe UI, sans-serif" }}>
            Socratic AI
          </span>
        </div>

        <div className="relative z-10 flex max-w-xl flex-col items-center text-center">
          <div className="mb-12">
            <ScholarOrbIllustration />
          </div>

          <h1 className="mb-6 text-5xl font-extrabold leading-[1.02] tracking-[-0.05em]" style={{ fontFamily: "'Plus Jakarta Sans', Inter, Segoe UI, sans-serif" }}>
            Elevate your
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, color-mix(in srgb, var(--accent) 82%, white) 0%, #44e2cd 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              intellectual journey
            </span>
          </h1>

          <p className="max-w-md text-lg leading-8" style={{ color: "var(--muted)" }}>
            Join a question-led study space designed to turn complex ideas into clear, durable understanding.
          </p>
        </div>
      </section>

      <section className="relative flex min-h-screen w-full items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:w-1/2 lg:px-16 xl:px-20">
        <div className="absolute left-8 top-8 flex items-center gap-3 md:hidden">
          <BrandMark className="h-9 w-9" />
          <span className="text-xl font-bold tracking-tight" style={{ color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', Inter, Segoe UI, sans-serif" }}>
            Socratic AI
          </span>
        </div>

        <div
          className="w-full max-w-md rounded-[2rem] p-5 sm:p-6 md:p-8"
          style={panelStyle}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: mode === "signup" ? 28 : -28, y: 10, scale: 0.985 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: mode === "signup" ? -24 : 24, y: -8, scale: 0.985 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-8"
            >
            <AuthTabs
              activeTab={mode}
              onChange={(nextMode) => {
                router.push(nextMode === "signup" ? "/signup" : "/signin");
              }}
            />

            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-extrabold tracking-[-0.04em] sm:text-3xl" style={{ fontFamily: "'Plus Jakarta Sans', Inter, Segoe UI, sans-serif" }}>
                {mode === "signin" ? "Welcome back" : "Join Socratic AI"}
              </h2>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                {mode === "signin"
                  ? "Sign in to continue your guided learning sessions."
                  : "Create an account to start your question-first workspace."}
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleAuth}>
              <AnimatePresence initial={false}>
                {mode === "signup" && (
                  <motion.div
                    key="signup-name"
                    initial={{ opacity: 0, y: -14, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    transition={{ duration: 0.24, ease: "easeOut" }}
                    className="space-y-2 overflow-hidden"
                  >
                    <label className="ml-1 block text-sm font-medium" htmlFor="name" style={{ color: "var(--muted)" }}>
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      placeholder="e.g. Ada Lovelace"
                      className="w-full rounded-2xl px-4 py-4 outline-none transition-all focus:ring-2"
                      style={{ ...inputShellStyle, boxShadow: "none" }}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="ml-1 block text-sm font-medium" htmlFor="email" style={{ color: "var(--muted)" }}>
                  Email
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4" style={{ color: "var(--muted)" }}>
                    <EmailGlyph />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="name@university.edu"
                    className="w-full rounded-2xl py-4 pl-12 pr-4 outline-none transition-all focus:ring-2"
                    style={{ ...inputShellStyle, boxShadow: "none" }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label className="block text-sm font-medium" htmlFor="password" style={{ color: "var(--muted)" }}>
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-xs font-bold transition-colors"
                    style={{ color: "var(--accent)" }}
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4" style={{ color: "var(--muted)" }}>
                    <PasswordGlyph />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    className="w-full rounded-2xl py-4 pl-12 pr-12 outline-none transition-all focus:ring-2"
                    style={{ ...inputShellStyle, boxShadow: "none" }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-4 transition-colors"
                    style={{ color: "var(--muted)" }}
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <VisibilityGlyph visible={showPassword} />
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-3 px-1 text-sm" style={{ color: "var(--muted)" }}>
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded-md"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember my session
              </label>

              {error && (
                <div
                  className="rounded-2xl px-4 py-3 text-sm"
                  style={{
                    backgroundColor: "rgba(224, 108, 117, 0.12)",
                    border: "1px solid rgba(224, 108, 117, 0.3)",
                    color: "#ffb4ab",
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-extrabold transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, color-mix(in srgb, var(--accent) 90%, white 10%) 0%, color-mix(in srgb, var(--accent) 72%, var(--surface-alt)) 100%)",
                  color: "var(--background)",
                  boxShadow: "0 18px 36px -24px color-mix(in srgb, var(--accent) 55%, transparent)",
                }}
              >
                {mode === "signin" ? "Sign In to Library" : "Create Account"}
                <SubmitArrow />
              </button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t" style={{ borderColor: "color-mix(in srgb, var(--border) 70%, transparent)" }} />
                <span className="mx-4 text-[10px] font-black uppercase tracking-[0.35em]" style={{ color: "var(--muted)" }}>
                  Or
                </span>
                <div className="flex-grow border-t" style={{ borderColor: "color-mix(in srgb, var(--border) 70%, transparent)" }} />
              </div>

              <button
                type="button"
                disabled
                className="flex w-full items-center justify-center gap-3 rounded-full px-4 py-4 text-sm font-semibold transition-all opacity-80"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--surface-alt) 78%, var(--surface))",
                  border: "1px solid color-mix(in srgb, var(--border) 76%, transparent)",
                  color: "var(--foreground)",
                }}
              >
                <GoogleMark className="h-5 w-5" />
                <span>Continue with Google</span>
              </button>
            </form>

            <footer className="flex flex-wrap items-center justify-center gap-5 text-xs" style={{ color: "var(--muted)" }}>
              <a href="#" className="transition-colors hover:text-[var(--foreground)]">Privacy Protocol</a>
              <a href="#" className="transition-colors hover:text-[var(--foreground)]">Terms of Inquiry</a>
              <span>&copy; 2026 Socratic AI</span>
            </footer>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}
