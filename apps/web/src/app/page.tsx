import Link from 'next/link';
import { ArrowRight, BrainCircuit, Compass, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <nav className="glass sticky top-0 z-50 flex items-center justify-between px-8 py-6">
        <div>
          <div className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
            Socratic <span style={{ color: 'var(--accent)' }}>AI</span>
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: 'var(--muted)' }}>
            Learn by discovery
          </div>
        </div>
        <div className="hidden items-center gap-4 text-sm font-medium md:flex" style={{ color: 'var(--muted)' }}>
          <Link href="#how-it-works" className="button-ghost rounded-full px-5 py-2.5">
            How it works
          </Link>
          <Link href="/login" className="button-accent inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-semibold">
            Get started
            <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      <main className="flex flex-1 flex-col px-4 py-12 md:px-8">
        <section className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="reveal-up space-y-8">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em]"
              style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              <Sparkles size={14} />
              Question-first tutoring
            </div>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.05em] md:text-7xl" style={{ color: 'var(--foreground)' }}>
                Learn through
                <br />
                <span style={{ color: 'var(--accent)' }}>personal discovery</span>
              </h1>
              <p className="max-w-2xl text-lg leading-8" style={{ color: 'var(--muted)' }}>
                Socratic AI does not rush to the answer. It nudges, reframes, and scaffolds your thinking until the solution becomes yours.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/login" className="button-accent inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-lg font-semibold">
                Start learning now
                <ArrowRight size={18} />
              </Link>
              <Link href="#how-it-works" className="button-ghost inline-flex items-center justify-center rounded-full px-8 py-4 text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                See how it works
              </Link>
            </div>
          </div>

          <div className="reveal-up stagger-2 relative">
            <div className="floating-orb absolute -top-8 right-8 h-36 w-36 rounded-full blur-3xl" style={{ background: 'var(--accent-soft)' }} />
            <div className="panel-surface relative overflow-hidden rounded-[2rem] p-6 md:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Live Socratic Session</div>
                  <div className="text-[10px] uppercase tracking-[0.24em]" style={{ color: 'var(--muted)' }}>Adaptive tutoring loop</div>
                </div>
                <div className="soft-pulse h-3 w-3 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
              </div>
              <div className="space-y-4">
                <div className="panel-muted ml-auto max-w-[82%] rounded-[1.5rem] px-4 py-3 text-sm leading-6" style={{ color: 'var(--foreground)' }}>
                  Why does acceleration stay constant in free fall?
                </div>
                <div className="panel-muted max-w-[88%] rounded-[1.5rem] px-4 py-3 text-sm leading-6 accent-halo" style={{ color: 'var(--foreground)' }}>
                  Before we name the force, what do you think keeps acting on the object for the whole motion?
                </div>
                <div className="panel-muted ml-auto max-w-[78%] rounded-[1.5rem] px-4 py-3 text-sm leading-6" style={{ color: 'var(--foreground)' }}>
                  Gravity does, and it stays nearly the same near Earth.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto mt-24 grid w-full max-w-6xl gap-8 md:grid-cols-3">
          {[
            {
              icon: <Compass size={20} />,
              title: 'Choose a direction',
              body: 'Pick a subject and begin with what you know, not what the system assumes.',
            },
            {
              icon: <BrainCircuit size={20} />,
              title: 'Think in dialogue',
              body: 'Use guided back-and-forth prompts instead of answer dumps and passive reading.',
            },
            {
              icon: <Sparkles size={20} />,
              title: 'Build real intuition',
              body: 'Hints, reframing, and momentum cues help concepts stick beyond the session.',
            },
          ].map((item, index) => (
            <div
              key={item.title}
              className={`panel-surface interactive-card reveal-up rounded-[1.75rem] p-8 ${index === 0 ? 'stagger-1' : index === 1 ? 'stagger-2' : 'stagger-3'}`}
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl panel-muted" style={{ color: 'var(--accent)' }}>
                {item.icon}
              </div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>{item.title}</h3>
              <p className="mt-3 text-sm leading-7" style={{ color: 'var(--muted)' }}>{item.body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t px-8 py-10" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm md:flex-row" style={{ color: 'var(--muted)' }}>
          <div>© 2026 Socratic AI Teaching Assistant. Built for mastery.</div>
          <div className="flex gap-6">
            <Link href="#" className="transition-colors hover:text-[var(--foreground)]">Terms</Link>
            <Link href="#" className="transition-colors hover:text-[var(--foreground)]">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
