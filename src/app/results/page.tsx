"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Recommendation {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  category: string;
  monthlySavings: number;
  confidence: number;
  effort: "low" | "medium" | "high";
  tags?: string[];
}

interface ScoreBreakdown {
  label: string;
  score: number;
  maxScore: number;
  icon: string;
}

interface AuditResult {
  totalMonthlySpend: number;
  optimizedSpend: number;
  monthlySavings: number;
  annualSavings: number;
  savingsPercentage: number;
  overallScore: number;
  confidenceScore: number;
  aiSummary: string;
  recommendations: Recommendation[];
  scoreBreakdown: ScoreBreakdown[];
  auditedAt: string;
  companyName?: string;
  teamSize?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SEVERITY_CONFIG = {
  critical: {
    label: "Critical",
    bg: "rgba(239,68,68,0.15)",
    border: "rgba(239,68,68,0.4)",
    text: "#ef4444",
    dot: "#ef4444",
    ring: "rgba(239,68,68,0.25)",
  },
  high: {
    label: "High",
    bg: "rgba(249,115,22,0.15)",
    border: "rgba(249,115,22,0.4)",
    text: "#f97316",
    dot: "#f97316",
    ring: "rgba(249,115,22,0.25)",
  },
  medium: {
    label: "Medium",
    bg: "rgba(234,179,8,0.15)",
    border: "rgba(234,179,8,0.4)",
    text: "#eab308",
    dot: "#eab308",
    ring: "rgba(234,179,8,0.25)",
  },
  low: {
    label: "Low",
    bg: "rgba(34,197,94,0.15)",
    border: "rgba(34,197,94,0.4)",
    text: "#22c55e",
    dot: "#22c55e",
    ring: "rgba(34,197,94,0.25)",
  },
};

const EFFORT_CONFIG = {
  low: { label: "Quick Win", color: "#22c55e" },
  medium: { label: "Some Effort", color: "#eab308" },
  high: { label: "Complex", color: "#f97316" },
};

// ─── Animated Number ──────────────────────────────────────────────────────────

function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1400,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease out expo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(eased * value);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  const formatted = display.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

// ─── Animated Progress Bar ────────────────────────────────────────────────────

function ProgressBar({
  pct,
  color,
  delay = 0,
}: {
  pct: number;
  color: string;
  delay?: number;
}) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(Math.min(pct, 100)), delay + 120);
    return () => clearTimeout(t);
  }, [pct, delay]);

  return (
    <div
      style={{
        height: "6px",
        borderRadius: "99px",
        background: "rgba(255,255,255,0.07)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${width}%`,
          background: color,
          borderRadius: "99px",
          transition: "width 1s cubic-bezier(0.22,1,0.36,1)",
          boxShadow: `0 0 8px ${color}66`,
        }}
      />
    </div>
  );
}

// ─── Score Arc ────────────────────────────────────────────────────────────────

function ScoreArc({ score }: { score: number }) {
  const [animated, setAnimated] = useState(0);
  const safeScore = isNaN(score) || !isFinite(score) ? 0 : score;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(safeScore), 300);
    return () => clearTimeout(t);
  }, [safeScore]);

  const r = 54;
  const circ = 2 * Math.PI * r;
  const safeAnimated = isNaN(animated) || !isFinite(animated) ? 0 : animated;
  const dashoffset = circ - (safeAnimated / 100) * circ * 0.75;
  const color =
    score >= 80
      ? "#22c55e"
      : score >= 60
      ? "#eab308"
      : score >= 40
      ? "#f97316"
      : "#ef4444";

  return (
    <svg width="140" height="110" viewBox="0 0 140 110">
      {/* Background arc */}
      <circle
        cx="70"
        cy="80"
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth="8"
        strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
        strokeDashoffset={circ * 0.125}
        strokeLinecap="round"
        transform="rotate(135, 70, 80)"
      />
      {/* Colored arc */}
      <circle
        cx="70"
        cy="80"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
        strokeDashoffset={dashoffset}
        strokeLinecap="round"
        transform="rotate(135, 70, 80)"
        style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)" }}
        filter={`drop-shadow(0 0 6px ${color}aa)`}
      />
      <text
        x="70"
        y="82"
        textAnchor="middle"
        fontSize="28"
        fontWeight="700"
        fill="white"
        fontFamily="'DM Mono', monospace"
      >
        {Math.round(safeAnimated)}
      </text>
      <text
        x="70"
        y="97"
        textAnchor="middle"
        fontSize="10"
        fill="rgba(255,255,255,0.45)"
        fontFamily="inherit"
        letterSpacing="1"
      >
        SCORE
      </text>
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<AuditResult | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem("latestAuditResult");
      if (!raw) {
        router.replace("/audit");
        return;
      }
      const parsed = JSON.parse(raw) as AuditResult;
      setResult(parsed);
    } catch {
      router.replace("/audit");
    }
  }, [router]);

  if (!mounted || !result) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#080c14",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "2px solid rgba(99,102,241,0.3)",
            borderTop: "2px solid #6366f1",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const {
    totalMonthlySpend,
    optimizedSpend,
    monthlySavings,
    annualSavings,
    savingsPercentage,
    overallScore,
    confidenceScore,
    aiSummary,
    recommendations,
    scoreBreakdown,
    auditedAt,
    companyName,
  } = result;

  const severities = ["all", "critical", "high", "medium", "low"];
  const filtered =
    activeFilter === "all"
      ? recommendations
      : recommendations.filter((r) => r.severity === activeFilter);

  const criticalCount = recommendations.filter((r) => r.severity === "critical").length;
  const highCount = recommendations.filter((r) => r.severity === "high").length;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spend-audit-${new Date(auditedAt).toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const scoreColor =
    overallScore >= 80
      ? "#22c55e"
      : overallScore >= 60
      ? "#eab308"
      : overallScore >= 40
      ? "#f97316"
      : "#ef4444";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #080c14;
          font-family: 'Inter', sans-serif;
          color: white;
          -webkit-font-smoothing: antialiased;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; } 50% { opacity: 0.4; }
        }

        .fade-up { animation: fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) both; }
        .fade-in { animation: fadeIn 0.4s ease both; }

        .metric-card {
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 24px;
          position: relative;
          overflow: hidden;
          transition: border-color 0.2s, background 0.2s;
        }
        .metric-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at top left, rgba(99,102,241,0.06) 0%, transparent 70%);
          pointer-events: none;
        }
        .metric-card:hover {
          border-color: rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.05);
        }

        .rec-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 20px 24px;
          transition: border-color 0.2s, background 0.2s, transform 0.2s;
        }
        .rec-card:hover {
          border-color: rgba(255,255,255,0.13);
          background: rgba(255,255,255,0.04);
          transform: translateY(-1px);
        }

        .btn-primary {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 11px 22px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: opacity 0.2s, transform 0.15s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
        .btn-primary:active { transform: translateY(0); }

        .btn-secondary {
          background: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.85);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 11px 22px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .btn-secondary:hover {
          background: rgba(255,255,255,0.11);
          border-color: rgba(255,255,255,0.18);
          transform: translateY(-1px);
        }

        .filter-pill {
          padding: 6px 14px;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.2s;
          font-family: 'Inter', sans-serif;
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }

        .noise-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 128px;
        }

        .grid-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background-image:
            linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .glow-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }

        .mono { font-family: 'DM Mono', monospace; }
        .display { font-family: 'Syne', sans-serif; }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }

        @media (max-width: 768px) {
          .metrics-grid { grid-template-columns: 1fr 1fr !important; }
          .hero-grid { grid-template-columns: 1fr !important; }
          .score-breakdown-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .metrics-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Background layers */}
      <div className="noise-bg" />
      <div className="grid-bg" />
      <div
        className="glow-orb"
        style={{
          width: "600px",
          height: "400px",
          top: "-100px",
          left: "-100px",
          background: "rgba(99,102,241,0.12)",
        }}
      />
      <div
        className="glow-orb"
        style={{
          width: "400px",
          height: "400px",
          bottom: "10%",
          right: "-80px",
          background: "rgba(139,92,246,0.08)",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
        {/* ── Nav ── */}
        <nav
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px)",
            background: "rgba(8,12,20,0.7)",
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "0 24px",
              height: "60px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <span className="display" style={{ fontWeight: 700, fontSize: "15px", letterSpacing: "-0.01em" }}>
                SpendAudit
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", fontFamily: "'DM Mono', monospace" }}>
                {new Date(auditedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
          </div>
        </nav>

        <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px 80px" }}>

          {/* ── Header ── */}
          <div className="fade-up" style={{ marginBottom: "40px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <div
                    style={{
                      width: "8px", height: "8px", borderRadius: "50%",
                      background: "#22c55e",
                      animation: "pulse-dot 2s ease-in-out infinite",
                      boxShadow: "0 0 8px #22c55e",
                    }}
                  />
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Audit Complete
                  </span>
                </div>
                <h1
                  className="display"
                  style={{
                    fontSize: "clamp(28px, 4vw, 44px)",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    lineHeight: 1.1,
                    background: "linear-gradient(135deg, #ffffff 30%, rgba(255,255,255,0.6))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {companyName ? `${companyName}'s Audit` : "Your Audit Results"}
                </h1>
                <p style={{ color: "rgba(255,255,255,0.45)", marginTop: "6px", fontSize: "14px" }}>
                  {recommendations.length} recommendations found ·{" "}
                  {criticalCount > 0 && (
                    <span style={{ color: "#ef4444" }}>{criticalCount} critical</span>
                  )}
                  {criticalCount > 0 && highCount > 0 && " · "}
                  {highCount > 0 && (
                    <span style={{ color: "#f97316" }}>{highCount} high priority</span>
                  )}
                </p>
              </div>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button className="btn-secondary" onClick={handleCopyLink}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                  {copied ? "Copied!" : "Share"}
                </button>
                <button className="btn-secondary" onClick={handleExport}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Export
                </button>
                <button className="btn-primary" onClick={() => router.push("/audit")}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.92" />
                  </svg>
                  Run Another Audit
                </button>
              </div>
            </div>
          </div>

          {/* ── Hero: Score + Savings ── */}
          <div
            className="hero-grid fade-up"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              gap: "16px",
              marginBottom: "16px",
              animationDelay: "0.05s",
            }}
          >
            {/* Score card */}
            <div
              className="metric-card"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "32px 24px",
                background: `rgba(${scoreColor === "#22c55e" ? "34,197,94" : scoreColor === "#eab308" ? "234,179,8" : scoreColor === "#f97316" ? "249,115,22" : "239,68,68"},0.06)`,
                borderColor: `${scoreColor}22`,
              }}
            >
              <ScoreArc score={overallScore} />
              <div style={{ textAlign: "center", marginTop: "4px" }}>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "4px" }}>Overall Health Score</div>
                <div style={{ fontSize: "12px", color: scoreColor, fontWeight: 600, background: `${scoreColor}18`, padding: "3px 10px", borderRadius: "99px", display: "inline-block" }}>
                  {overallScore >= 80 ? "Excellent" : overallScore >= 60 ? "Good" : overallScore >= 40 ? "Needs Work" : "Critical"}
                </div>
              </div>
              <div style={{ marginTop: "16px", textAlign: "center" }}>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginBottom: "4px" }}>AI Confidence</div>
                <ProgressBar pct={confidenceScore} color="#6366f1" delay={400} />
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", marginTop: "4px" }} className="mono">
                  {confidenceScore}%
                </div>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div
              className="metrics-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "16px",
              }}
            >
              {/* Monthly Spend */}
              <div className="metric-card">
                <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "10px" }}>
                  Monthly Spend
                </div>
                <div className="display mono" style={{ fontSize: "28px", fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: "-0.02em" }}>
                  <AnimatedNumber value={totalMonthlySpend} prefix="$" />
                </div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginTop: "4px" }}>current baseline</div>
              </div>

              {/* Optimized Spend */}
              <div className="metric-card">
                <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "10px" }}>
                  Optimized Spend
                </div>
                <div className="display mono" style={{ fontSize: "28px", fontWeight: 700, color: "#6366f1", letterSpacing: "-0.02em" }}>
                  <AnimatedNumber value={optimizedSpend} prefix="$" />
                </div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginTop: "4px" }}>after recommendations</div>
              </div>

              {/* Monthly Savings */}
              <div
                className="metric-card"
                style={{
                  background: "rgba(34,197,94,0.06)",
                  borderColor: "rgba(34,197,94,0.2)",
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "rgba(34,197,94,0.7)", marginBottom: "10px" }}>
                  Monthly Savings
                </div>
                <div className="display mono" style={{ fontSize: "28px", fontWeight: 700, color: "#22c55e", letterSpacing: "-0.02em" }}>
                  <AnimatedNumber value={monthlySavings} prefix="$" />
                </div>
                <ProgressBar pct={savingsPercentage} color="#22c55e" delay={300} />
                <div style={{ fontSize: "12px", color: "rgba(34,197,94,0.7)", marginTop: "4px" }} className="mono">
                  {savingsPercentage.toFixed(1)}% reduction
                </div>
              </div>

              {/* Annual Savings */}
              <div
                className="metric-card"
                style={{
                  background: "rgba(99,102,241,0.06)",
                  borderColor: "rgba(99,102,241,0.2)",
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "rgba(99,102,241,0.7)", marginBottom: "10px" }}>
                  Annual Savings
                </div>
                <div className="display mono" style={{ fontSize: "28px", fontWeight: 700, color: "#818cf8", letterSpacing: "-0.02em" }}>
                  <AnimatedNumber value={annualSavings} prefix="$" duration={1800} />
                </div>
                <div style={{ fontSize: "12px", color: "rgba(99,102,241,0.6)", marginTop: "4px" }}>projected 12-month total</div>
              </div>
            </div>
          </div>

          {/* ── AI Summary ── */}
          <div
            className="fade-up"
            style={{
              animationDelay: "0.1s",
              background: "rgba(99,102,241,0.06)",
              border: "1px solid rgba(99,102,241,0.2)",
              borderRadius: "16px",
              padding: "24px 28px",
              marginBottom: "16px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0, left: 0, right: 0,
                height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)",
              }}
            />
            <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
              <div
                style={{
                  width: "32px", height: "32px", flexShrink: 0,
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  borderRadius: "8px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "rgba(99,102,241,0.8)", marginBottom: "6px" }}>
                  AI Analysis Summary
                </div>
                <p style={{ fontSize: "14px", lineHeight: 1.7, color: "rgba(255,255,255,0.75)" }}>{aiSummary}</p>
              </div>
            </div>
          </div>

          {/* ── Score Breakdown ── */}
          {scoreBreakdown && scoreBreakdown.length > 0 && (
            <div className="fade-up" style={{ animationDelay: "0.15s", marginBottom: "16px" }}>
              <h2 className="display" style={{ fontSize: "16px", fontWeight: 700, marginBottom: "12px", color: "rgba(255,255,255,0.8)", letterSpacing: "-0.01em" }}>
                Score Breakdown
              </h2>
              <div
                className="score-breakdown-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${Math.min(scoreBreakdown.length, 4)}, 1fr)`,
                  gap: "12px",
                }}
              >
                {scoreBreakdown.map((item, i) => {
                  const pct = (item.score / item.maxScore) * 100;
                  const c = pct >= 80 ? "#22c55e" : pct >= 60 ? "#eab308" : pct >= 40 ? "#f97316" : "#ef4444";
                  return (
                    <div
                      key={item.label}
                      className="metric-card"
                      style={{ padding: "18px 20px", animationDelay: `${0.15 + i * 0.04}s` }}
                    >
                      <div style={{ fontSize: "20px", marginBottom: "8px" }}>{item.icon}</div>
                      <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: "6px" }}>
                        {item.label}
                      </div>
                      <div className="mono" style={{ fontSize: "22px", fontWeight: 700, color: c, marginBottom: "8px" }}>
                        {item.score}<span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>/{item.maxScore}</span>
                      </div>
                      <ProgressBar pct={pct} color={c} delay={400 + i * 80} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Recommendations ── */}
          <div className="fade-up" style={{ animationDelay: "0.2s" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
              <h2 className="display" style={{ fontSize: "16px", fontWeight: 700, color: "rgba(255,255,255,0.8)", letterSpacing: "-0.01em" }}>
                Recommendations
                <span className="mono" style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", fontWeight: 400, marginLeft: "8px" }}>
                  {filtered.length} of {recommendations.length}
                </span>
              </h2>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {severities.map((s) => {
                  const isActive = activeFilter === s;
                  const cfg = s !== "all" ? SEVERITY_CONFIG[s as keyof typeof SEVERITY_CONFIG] : null;
                  return (
                    <button
                      key={s}
                      className="filter-pill"
                      onClick={() => setActiveFilter(s)}
                      style={{
                        background: isActive
                          ? cfg ? cfg.bg : "rgba(255,255,255,0.12)"
                          : "rgba(255,255,255,0.04)",
                        borderColor: isActive
                          ? cfg ? cfg.border : "rgba(255,255,255,0.2)"
                          : "rgba(255,255,255,0.07)",
                        color: isActive
                          ? cfg ? cfg.text : "white"
                          : "rgba(255,255,255,0.4)",
                      }}
                    >
                      {s === "all" ? "All" : SEVERITY_CONFIG[s as keyof typeof SEVERITY_CONFIG].label}
                      {s !== "all" && (
                        <span style={{ marginLeft: "4px", opacity: 0.7 }}>
                          ({recommendations.filter((r) => r.severity === s).length})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Empty state */}
            {filtered.length === 0 ? (
              <div
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "14px",
                  padding: "48px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>✨</div>
                <div style={{ fontSize: "15px", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: "6px" }}>
                  No {activeFilter !== "all" ? activeFilter : ""} issues found
                </div>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)" }}>
                  {activeFilter !== "all"
                    ? `No ${activeFilter} severity recommendations for this audit.`
                    : "Your spending looks optimized!"}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {filtered.map((rec, i) => {
                  const sev = SEVERITY_CONFIG[rec.severity];
                  const eff = EFFORT_CONFIG[rec.effort];
                  return (
                    <div
                      key={rec.id}
                      className="rec-card"
                      style={{ animationDelay: `${0.22 + i * 0.04}s` }}
                    >
                      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                        {/* Severity indicator */}
                        <div
                          style={{
                            width: "4px", flexShrink: 0, alignSelf: "stretch",
                            borderRadius: "99px",
                            backgroundColor: sev.text,
                            minHeight: "40px",
                          }}
                        />

                        <div style={{ flex: 1, minWidth: 0 }}>
                          {/* Top row */}
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "8px" }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                                <span
                                  style={{
                                    fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em",
                                    textTransform: "uppercase", padding: "2px 8px",
                                    borderRadius: "99px", border: `1px solid ${sev.border}`,
                                    background: sev.bg, color: sev.text,
                                  }}
                                >
                                  {sev.label}
                                </span>
                                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: "99px" }}>
                                  {rec.category}
                                </span>
                                <span style={{ fontSize: "11px", color: eff.color, background: `${eff.color}15`, padding: "2px 8px", borderRadius: "99px" }}>
                                  {eff.label}
                                </span>
                              </div>
                              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.9)", lineHeight: 1.4 }}>
                                {rec.title}
                              </h3>
                            </div>
                            <div style={{ textAlign: "right", flexShrink: 0 }}>
                              <div className="mono" style={{ fontSize: "16px", fontWeight: 700, color: "#22c55e" }}>
                                +${rec.monthlySavings.toLocaleString()}/mo
                              </div>
                              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>
                                ${(rec.monthlySavings * 12).toLocaleString()}/yr
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: "10px" }}>
                            {rec.description}
                          </p>

                          {/* Confidence bar */}
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>Confidence</span>
                            <div style={{ flex: 1, maxWidth: "120px" }}>
                              <ProgressBar pct={rec.confidence} color="#6366f1" delay={300 + i * 60} />
                            </div>
                            <span className="mono" style={{ fontSize: "11px", color: "rgba(99,102,241,0.8)" }}>{rec.confidence}%</span>

                            {rec.tags && rec.tags.length > 0 && (
                              <div style={{ display: "flex", gap: "4px", marginLeft: "8px", flexWrap: "wrap" }}>
                                {rec.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    style={{
                                      fontSize: "10px", padding: "1px 6px",
                                      borderRadius: "99px",
                                      background: "rgba(255,255,255,0.05)",
                                      color: "rgba(255,255,255,0.3)",
                                      border: "1px solid rgba(255,255,255,0.07)",
                                    }}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── CTA Footer ── */}
          <div
            className="fade-up"
            style={{
              animationDelay: "0.3s",
              marginTop: "40px",
              background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.06))",
              border: "1px solid rgba(99,102,241,0.2)",
              borderRadius: "20px",
              padding: "32px",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0, left: 0, right: 0, height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.7), transparent)",
              }}
            />
            <div className="display" style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px", letterSpacing: "-0.02em" }}>
              Ready to start saving{" "}
              <span style={{ color: "#22c55e" }}>
                ${annualSavings.toLocaleString()}
              </span>{" "}
              this year?
            </div>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "14px", marginBottom: "24px", maxWidth: "500px", margin: "0 auto 24px" }}>
              Implement these recommendations and unlock your optimized spend potential. Run a new audit anytime to track your progress.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn-primary" style={{ padding: "13px 28px", fontSize: "15px" }} onClick={() => router.push("/audit")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.92" />
                </svg>
                Run Another Audit
              </button>
              <button className="btn-secondary" style={{ padding: "13px 28px", fontSize: "15px" }} onClick={handleExport}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export Full Report
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
