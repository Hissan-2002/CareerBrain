import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "CareerBrain | AI Career Intelligence",
  description:
    "Structure your career. Reason over your future. CareerBrain ingests your CV and GitHub profile, builds a structured knowledge base, and uses RAG to power job fit analysis and career coaching.",
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary">

      {/* Nav */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <Image src="/careerbrainlogo.png" alt="CareerBrain" width={28} height={28} />
          <span className="font-heading font-bold text-base tracking-tight">CareerBrain</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-accent-lime text-black font-semibold px-4 py-2 rounded-lg hover:brightness-110 transition-all"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-4 sm:px-8 pt-16 sm:pt-28 pb-20 sm:pb-36 text-center max-w-4xl mx-auto overflow-hidden">
        {/* Accent radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 20%, rgba(100, 200, 190, 0.07) 0%, transparent 70%)",
          }}
        />

        <div className="relative animate-fade-in">
          <h1 className="font-heading font-extrabold text-[2.25rem] sm:text-5xl md:text-7xl leading-[1.08] text-text-primary tracking-tight mb-6 sm:mb-7">
            Your career,{" "}
            <span className="text-accent-lime">structured.</span>
            <br />
            Your future, reasoned.
          </h1>

          <p className="text-text-secondary text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 sm:mb-12 leading-relaxed">
            Upload your CV and GitHub profile. CareerBrain builds a structured AI
            model of your career and uses RAG to power intelligent job analysis
            and coaching, grounded in your actual history.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-accent-lime text-black font-semibold px-8 py-3.5 rounded-lg hover:brightness-110 transition-all text-sm"
            >
              Build My Career Brain
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto bg-transparent border border-border text-text-secondary font-medium px-8 py-3.5 rounded-lg hover:border-border-bright hover:text-text-primary transition-colors text-sm"
            >
              How it works
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-4 sm:px-8 py-20 sm:py-28 max-w-5xl mx-auto">
        <p className="font-mono text-xs text-text-muted tracking-[0.2em] uppercase text-center mb-4">
          Process
        </p>
        <h2 className="font-heading font-bold text-3xl text-text-primary text-center mb-16">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden">
          {[
            {
              step: "01",
              title: "Upload CV + GitHub",
              description:
                "Upload your PDF resume and connect your GitHub username to include real project and contribution data.",
            },
            {
              step: "02",
              title: "AI Builds Your Brain",
              description:
                "Our AI extracts a structured career profile from your data. Everything is chunked and embedded into a vector database.",
            },
            {
              step: "03",
              title: "Get Intelligence",
              description:
                "Analyze job fit with visible retrieved sources, or chat with an advisor grounded in your actual career history.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-surface p-8"
            >
              <div className="font-mono text-xs text-accent-lime mb-5 tracking-widest">
                {item.step}
              </div>
              <h3 className="font-heading font-semibold text-base text-text-primary mb-3">
                {item.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-4 sm:px-8 py-20 sm:py-28 max-w-5xl mx-auto">
        <p className="font-mono text-xs text-text-muted tracking-[0.2em] uppercase text-center mb-4">
          Features
        </p>
        <h2 className="font-heading font-bold text-3xl text-text-primary text-center mb-16">
          Built on Visible RAG
        </h2>
        <div className="grid md:grid-cols-2 gap-6">

          {/* Job Intelligence */}
          <div className="bg-surface border border-border rounded-xl p-7 space-y-5">
            <div>
              <p className="font-mono text-[10px] text-accent-lime tracking-widest uppercase mb-3">
                Job Intelligence
              </p>
              <h3 className="font-heading font-semibold text-lg text-text-primary mb-2">
                Know if you&apos;re ready before you apply.
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Paste any job description. Get a fit score, gap analysis, and
                three concrete projects to close skill gaps, grounded in
                retrieved chunks from your actual profile.
              </p>
            </div>
            <div className="bg-surface-raised rounded-lg p-4 flex items-center gap-4 border border-border">
              <div className="relative w-14 h-14 shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#1a1a1a" strokeWidth="2.5" />
                  <circle
                    cx="18" cy="18" r="15" fill="none"
                    stroke="var(--accent-lime)" strokeWidth="2.5"
                    strokeDasharray="72 94"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-heading font-bold text-sm text-accent-lime">
                  76
                </span>
              </div>
              <div>
                <div className="text-xs font-semibold text-success mb-1">Strong Match</div>
                <div className="text-xs text-text-muted">Gap: Kubernetes · Terraform</div>
              </div>
            </div>
          </div>

          {/* Career Chat */}
          <div className="bg-surface border border-border rounded-xl p-7 space-y-5">
            <div>
              <p className="font-mono text-[10px] text-accent-lime tracking-widest uppercase mb-3">
                Career Agent Chat
              </p>
              <h3 className="font-heading font-semibold text-lg text-text-primary mb-2">
                An advisor that knows your history.
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Ask career questions. Every answer is grounded in your real
                profile via RAG, not generic advice. Sources shown with every
                response.
              </p>
            </div>
            <div className="space-y-2">
              <div className="bg-surface-raised rounded-lg px-3.5 py-2.5 text-xs text-text-secondary border border-border">
                Am I ready for a senior role?
              </div>
              <div className="rounded-lg px-3.5 py-2.5 text-xs text-text-primary border border-accent-lime/20 bg-accent-lime/5">
                Based on your 4 years at Stripe and your ML infrastructure
                work, you&apos;re close. The main gap is people management
                experience.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Closing statement */}
      <section className="px-4 sm:px-8 py-16 sm:py-20 max-w-5xl mx-auto border-t border-border">
        <p className="font-heading text-2xl font-bold text-text-primary text-center max-w-xl mx-auto leading-snug">
          Every answer shows its sources.{" "}
          <span className="text-text-muted font-normal">No black box.</span>
        </p>
      </section>

      {/* Built by */}
      <section className="border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-16 flex flex-col items-center gap-5 text-center">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-text-muted">
            Designed &amp; built by
          </p>
          <p className="font-heading text-3xl font-bold text-text-primary">
            Hissan Butt
          </p>
          <p className="text-sm text-text-secondary max-w-xs">
            Software Engineer · Full-stack · AI
          </p>
          <div className="flex items-center gap-4 mt-1">
            <a
              href="https://my-portfolio-vert-ten-39.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent-lime transition-colors"
              aria-label="Portfolio"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253M3 12a8.959 8.959 0 01.284-2.253" />
              </svg>
              Portfolio
            </a>
            <span className="text-border">·</span>
            <a
              href="https://github.com/Hissan-2002"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent-lime transition-colors"
              aria-label="GitHub"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.920.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </a>
            <span className="text-border">·</span>
            <a
              href="https://www.linkedin.com/in/hissan-butt/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent-lime transition-colors"
              aria-label="LinkedIn"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-8 py-6 border-t border-border max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Image src="/careerbrainlogo.png" alt="CareerBrain" width={18} height={18} />
          <span className="font-heading font-bold text-sm text-text-primary">
            CareerBrain
          </span>
        </div>
        <p className="text-xs text-text-muted">
          AI-powered career intelligence
        </p>
      </footer>

    </div>
  )
}
