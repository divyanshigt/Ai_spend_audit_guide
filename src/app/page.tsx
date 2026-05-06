"use client";

import Link from "next/link";
import { useState } from "react";

const tools = [
  { name: "Cursor", icon: "⌘", color: "from-violet-500 to-purple-600" },
  { name: "Claude", icon: "◎", color: "from-orange-400 to-amber-500" },
  { name: "ChatGPT", icon: "✦", color: "from-emerald-400 to-teal-500" },
  { name: "Copilot", icon: "◈", color: "from-blue-400 to-indigo-500" },
  { name: "Gemini", icon: "◇", color: "from-sky-400 to-cyan-500" },
  { name: "OpenAI API", icon: "⬡", color: "from-slate-400 to-gray-500" },
  { name: "Anthropic API", icon: "◑", color: "from-rose-400 to-pink-500" },
  { name: "Windsurf", icon: "◐", color: "from-fuchsia-400 to-violet-500" },
];

const steps = [
  {
    num: "01",
    title: "Connect Your Tools",
    desc: "Enter your AI subscription details — Cursor, Claude, ChatGPT, and 5 others. No OAuth, no API keys handed over. Just your spend data.",
  },
  {
    num: "02",
    title: "Get Instant Analysis",
    desc: "Our engine maps your usage patterns, detects redundancies, overlaps, and idle seats across every tool in your stack.",
  },
  {
    num: "03",
    title: "See Your Savings",
    desc: "Receive a prioritized action plan with exact dollar amounts to cut. Most teams find savings within 5 minutes.",
  },
];

const testimonials = [
  {
    name: "Priya Menon",
    role: "CTO @ Finstack",
    text: "We were paying for Cursor Pro, Copilot, AND ChatGPT Plus for the same 4 engineers. SpendAudit flagged it instantly. Saved us $1,200/yr.",
    avatar: "PM",
    color: "bg-violet-500",
  },
  {
    name: "Arjun Sharma",
    role: "Head of Eng @ Zepto Clone",
    text: "The Anthropic API waste detection is incredible. We had zombie API calls burning $300/month. Gone now.",
    avatar: "AS",
    color: "bg-emerald-500",
  },
  {
    name: "Neha Gupta",
    role: "Founder @ DevPilot",
    text: "Took 4 minutes to audit. Found $2,800 in annual savings across 8 tools. This should be required reading for every startup.",
    avatar: "NG",
    color: "bg-orange-500",
  },
];

const faqs = [
  {
    q: "Is my data safe?",
    a: "Absolutely. We never store API keys or credentials. Spend data you enter is processed in-memory and never persisted to a database. Your audit disappears when you close the tab.",
  },
  {
    q: "Which AI tools does this cover?",
    a: "Cursor, Claude, ChatGPT, GitHub Copilot, Gemini, OpenAI API, Anthropic API, and Windsurf/v0. We cover the 8 most common tools in startup AI stacks.",
  },
  {
    q: "How accurate are the savings estimates?",
    a: "Our recommendations are based on real pricing data and industry-standard usage benchmarks. We update pricing tables monthly to stay accurate.",
  },
  {
    q: "Do I need to sign up?",
    a: "No account required. The audit is 100% free and runs entirely in your browser. No email, no credit card, no friction.",
  },
  {
    q: "What if I use tools not on the list?",
    a: "The audit covers the highest-impact tools. We're adding more integrations each sprint. Drop us feedback and we'll prioritize accordingly.",
  },
];

const stats = [
  { value: "$3,400", label: "Average annual savings per startup", sub: "across all audited teams" },
  { value: "73%", label: "of startups have at least one redundant AI tool", sub: "identified in first audit" },
  { value: "4 min", label: "Average time to complete a full audit", sub: "no setup required" },
  { value: "8 tools", label: "AI platforms audited in one session", sub: "comprehensive coverage" },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-white overflow-x-hidden">
      {/* Grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-xs font-bold">
            ✦
          </div>
          <span className="font-semibold text-sm tracking-tight text-white/90">
            SpendAudit
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/50">
          <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
          <a href="#savings" className="hover:text-white transition-colors">Savings</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </div>
        <Link
          href="/audit"
          className="text-sm px-4 py-2 rounded-lg bg-white text-black font-medium hover:bg-white/90 transition-all"
        >
          Start Free Audit →
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-32">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/60 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Free audit · No signup required · Results in 4 minutes
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] max-w-4xl mb-6">
          Your startup is{" "}
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-rose-400 bg-clip-text text-transparent">
            bleeding money
          </span>
          <br />
          on AI tools.
        </h1>

        <p className="text-lg md:text-xl text-white/50 max-w-xl mb-10 leading-relaxed">
          The average startup wastes{" "}
          <span className="text-white/80 font-medium">$3,400/year</span> on
          overlapping AI subscriptions. SpendAudit finds exactly where — and
          shows you how to cut it.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <Link
            href="/audit"
            className="group flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold text-base hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/20"
          >
            Audit My AI Stack
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
          <span className="text-sm text-white/30">No account needed</span>
        </div>

        {/* Tool logos row */}
        <div className="mt-16 flex flex-wrap justify-center gap-3">
          {tools.map((tool) => (
            <div
              key={tool.name}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/8 bg-white/4 text-sm text-white/50 hover:text-white/80 hover:border-white/15 transition-all cursor-default"
            >
              <span
                className={`text-xs bg-gradient-to-br ${tool.color} bg-clip-text text-transparent font-bold`}
              >
                {tool.icon}
              </span>
              {tool.name}
            </div>
          ))}
        </div>
      </section>

      {/* Problem statement */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-28">
        <div className="rounded-2xl border border-white/8 bg-white/3 p-8 md:p-12">
          <p className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-4">
            The Real Problem
          </p>
          <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-6 max-w-2xl">
            AI budgets are a black box. Most CTOs have no idea what they&apos;re
            actually paying for.
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {[
              { icon: "⚠️", title: "Redundant Subscriptions", desc: "Teams often pay for 2–3 coding assistants doing the same job. Cursor + Copilot + ChatGPT Pro on the same engineer." },
              { icon: "💸", title: "Zombie API Spend", desc: "Unused OpenAI or Anthropic API integrations silently billing you every month for calls that return zero value." },
              { icon: "🕳️", title: "Idle Seat Waste", desc: "Enterprise seats that haven't been touched in 60+ days. The tool is on, the engineers moved on." },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-white/8 bg-white/3 p-5"
              >
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-white/90 mb-2">{item.title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative z-10 max-w-5xl mx-auto px-6 pb-28">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-3">
            How It Works
          </p>
          <h2 className="text-3xl md:text-4xl font-bold">
            From zero to savings in under 5 minutes
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="relative group">
              <div className="rounded-2xl border border-white/8 bg-white/3 p-7 h-full hover:border-white/15 hover:bg-white/5 transition-all">
                <div className="text-4xl font-black text-white/8 mb-4 font-mono">
                  {step.num}
                </div>
                <h3 className="font-semibold text-white/90 text-lg mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-white/45 leading-relaxed">{step.desc}</p>
              </div>
              {i < 2 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 text-white/20 text-center z-10">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section id="savings" className="relative z-10 max-w-5xl mx-auto px-6 pb-28">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-3">
            By The Numbers
          </p>
          <h2 className="text-3xl md:text-4xl font-bold">
            Real savings. Real data.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/8 bg-white/3 p-6 text-center hover:border-violet-500/30 hover:bg-violet-500/5 transition-all"
            >
              <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">
                {s.value}
              </div>
              <div className="text-sm font-medium text-white/70 mb-1">{s.label}</div>
              <div className="text-xs text-white/30">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-28">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-3">
            Social Proof
          </p>
          <h2 className="text-3xl md:text-4xl font-bold">
            Founders who found their leaks
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/8 bg-white/3 p-6 flex flex-col justify-between hover:border-white/15 transition-all"
            >
              <p className="text-sm text-white/60 leading-relaxed mb-6">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white/90">
                    {t.name}
                  </div>
                  <div className="text-xs text-white/40">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative z-10 max-w-3xl mx-auto px-6 pb-28">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-3">
            FAQ
          </p>
          <h2 className="text-3xl md:text-4xl font-bold">Questions answered</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/8 bg-white/3 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/3 transition-colors"
              >
                <span className="font-medium text-white/85 text-sm">{faq.q}</span>
                <span
                  className={`text-white/40 transition-transform text-lg leading-none ${
                    openFaq === i ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5">
                  <p className="text-sm text-white/50 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <div className="rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-900/30 via-fuchsia-900/20 to-rose-900/20 p-12 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 50%, rgba(139,92,246,0.4) 0%, transparent 60%), radial-gradient(circle at 70% 50%, rgba(236,72,153,0.3) 0%, transparent 60%)",
            }}
          />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
              Stop the bleed.
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Start saving today.
              </span>
            </h2>
            <p className="text-white/50 mb-8 text-lg max-w-md mx-auto">
              Free. No signup. Results in minutes. Your AI stack has a leak —
              let&apos;s find it.
            </p>
            <Link
              href="/audit"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-black font-bold text-base hover:bg-white/90 transition-all shadow-xl shadow-white/10"
            >
              Run My Free Audit
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/6 px-6 py-10 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-xs font-bold">
              ✦
            </div>
            <span className="text-sm font-semibold text-white/60">SpendAudit</span>
          </div>
          <p className="text-xs text-white/25">
            Built for startups burning money on AI they don&apos;t need.
          </p>
          <div className="flex items-center gap-5 text-xs text-white/30">
            <Link href="/audit" className="hover:text-white/60 transition-colors">
              Start Audit
            </Link>
            <span>·</span>
            <span>© 2025 SpendAudit</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
