"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { runAudit } from "@/lib/audit-engine";

// ─── Types ────────────────────────────────────────────────────────────────────

type PrimaryUseCase = "coding" | "writing" | "research" | "data" | "mixed";

type ToolName =
  | "Cursor"
  | "GitHub Copilot"
  | "Claude"
  | "ChatGPT"
  | "Anthropic API"
  | "OpenAI API"
  | "Gemini"
  | "Windsurf"
  | "v0";

interface ToolEntry {
  id: string;
  name: ToolName;
  plan: string;
  monthlySpend: string;
  seats: string;
}

interface FormState {
  teamSize: string;
  primaryUseCase: PrimaryUseCase | "";
  tools: ToolEntry[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_TOOLS: ToolName[] = [
  "Cursor",
  "GitHub Copilot",
  "Claude",
  "ChatGPT",
  "Anthropic API",
  "OpenAI API",
  "Gemini",
  "Windsurf",
  "v0",
];

const USE_CASES: { value: PrimaryUseCase; label: string; icon: string }[] = [
  { value: "coding", label: "Coding", icon: "⌨️" },
  { value: "writing", label: "Writing", icon: "✍️" },
  { value: "research", label: "Research", icon: "🔬" },
  { value: "data", label: "Data & Analytics", icon: "📊" },
  { value: "mixed", label: "Mixed / General", icon: "🌐" },
];

const TOOL_PLANS: Record<ToolName, string[]> = {
  Cursor: ["Free", "Pro", "Business", "Custom"],
  "GitHub Copilot": ["Individual", "Business", "Enterprise"],
  Claude: ["Free", "Pro", "Team", "Enterprise"],
  ChatGPT: ["Free", "Plus", "Team", "Enterprise"],
  "Anthropic API": ["Pay-as-you-go", "Committed Use"],
  "OpenAI API": ["Pay-as-you-go", "Committed Use"],
  Gemini: ["Free", "Advanced", "Business", "Enterprise"],
  Windsurf: ["Free", "Pro", "Teams", "Enterprise"],
  v0: ["Free", "Premium", "Team"],
};

const TOOL_COLORS: Record<ToolName, string> = {
  Cursor: "#7C3AED",
  "GitHub Copilot": "#238636",
  Claude: "#D97706",
  ChatGPT: "#10A37F",
  "Anthropic API": "#D97706",
  "OpenAI API": "#10A37F",
  Gemini: "#4285F4",
  Windsurf: "#06B6D4",
  v0: "#ffffff",
};

const STORAGE_KEY = "auditFormState";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function createToolEntry(name: ToolName): ToolEntry {
  return {
    id: generateId(),
    name,
    plan: TOOL_PLANS[name][0],
    monthlySpend: "",
    seats: "1",
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: i < currentStep ? "28px" : i === currentStep ? "28px" : "28px",
              height: "28px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "700",
              fontFamily: "'DM Mono', monospace",
              transition: "all 0.3s ease",
              background:
                i < currentStep
                  ? "linear-gradient(135deg, #6EE7B7, #3B82F6)"
                  : i === currentStep
                  ? "rgba(110, 231, 183, 0.15)"
                  : "rgba(255,255,255,0.04)",
              border:
                i < currentStep
                  ? "none"
                  : i === currentStep
                  ? "1.5px solid #6EE7B7"
                  : "1.5px solid rgba(255,255,255,0.1)",
              color:
                i < currentStep ? "#000" : i === currentStep ? "#6EE7B7" : "rgba(255,255,255,0.3)",
            }}
          >
            {i < currentStep ? "✓" : i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div
              style={{
                width: "40px",
                height: "1px",
                background:
                  i < currentStep - 1
                    ? "linear-gradient(90deg, #6EE7B7, #3B82F6)"
                    : "rgba(255,255,255,0.08)",
                transition: "background 0.3s ease",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function ToolCard({
  tool,
  onUpdate,
  onRemove,
}: {
  tool: ToolEntry;
  onUpdate: (field: keyof ToolEntry, value: string) => void;
  onRemove: () => void;
}) {
  const accentColor = TOOL_COLORS[tool.name];
  const plans = TOOL_PLANS[tool.name];

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "16px",
        padding: "20px",
        position: "relative",
        transition: "border-color 0.2s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = `${accentColor}40`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)";
      }}
    >
      {/* Tool header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: accentColor,
              boxShadow: `0 0 8px ${accentColor}80`,
            }}
          />
          <span
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#fff",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {tool.name}
          </span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "8px",
            padding: "4px 10px",
            color: "rgba(239,68,68,0.7)",
            fontSize: "11px",
            cursor: "pointer",
            fontFamily: "'DM Mono', monospace",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.15)";
            (e.currentTarget as HTMLButtonElement).style.color = "#EF4444";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.08)";
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(239,68,68,0.7)";
          }}
        >
          remove
        </button>
      </div>

      {/* Fields */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "12px",
        }}
      >
        {/* Plan */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: "10px",
              fontFamily: "'DM Mono', monospace",
              color: "rgba(255,255,255,0.35)",
              marginBottom: "6px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Plan
          </label>
          <select
            value={tool.plan}
            onChange={(e) => onUpdate("plan", e.target.value)}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              padding: "8px 10px",
              color: "#fff",
              fontSize: "13px",
              fontFamily: "'DM Sans', sans-serif",
              outline: "none",
              cursor: "pointer",
            }}
          >
            {plans.map((p) => (
              <option key={p} value={p} style={{ background: "#141414" }}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Monthly Spend */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: "10px",
              fontFamily: "'DM Mono', monospace",
              color: "rgba(255,255,255,0.35)",
              marginBottom: "6px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Monthly ($)
          </label>
          <input
            type="number"
            min="0"
            placeholder="0"
            value={tool.monthlySpend}
            onChange={(e) => onUpdate("monthlySpend", e.target.value)}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              padding: "8px 10px",
              color: "#fff",
              fontSize: "13px",
              fontFamily: "'DM Mono', monospace",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Seats */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: "10px",
              fontFamily: "'DM Mono', monospace",
              color: "rgba(255,255,255,0.35)",
              marginBottom: "6px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Seats
          </label>
          <input
            type="number"
            min="1"
            placeholder="1"
            value={tool.seats}
            onChange={(e) => onUpdate("seats", e.target.value)}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              padding: "8px 10px",
              color: "#fff",
              fontSize: "13px",
              fontFamily: "'DM Mono', monospace",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AuditPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0 = basics, 1 = tools, 2 = review
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showToolPicker, setShowToolPicker] = useState(false);

  const [form, setForm] = useState<FormState>({
    teamSize: "",
    primaryUseCase: "",
    tools: [],
  });

  // ── Load from localStorage ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as FormState;
        setForm(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  // ── Persist to localStorage ──
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch {
      // ignore
    }
  }, [form]);

  // ── Validation ──
  function validateStep(s: number): Record<string, string> {
    const errs: Record<string, string> = {};
    if (s === 0) {
      if (!form.teamSize || parseInt(form.teamSize) < 1) {
        errs.teamSize = "Please enter a valid team size.";
      }
      if (!form.primaryUseCase) {
        errs.primaryUseCase = "Please select a primary use case.";
      }
    }
    if (s === 1) {
      if (form.tools.length === 0) {
        errs.tools = "Add at least one AI tool.";
      }
      form.tools.forEach((t) => {
        if (!t.monthlySpend || parseFloat(t.monthlySpend) < 0) {
          errs[`spend_${t.id}`] = `Enter monthly spend for ${t.name}.`;
        }
        if (!t.seats || parseInt(t.seats) < 1) {
          errs[`seats_${t.id}`] = `Enter seats for ${t.name}.`;
        }
      });
    }
    return errs;
  }

  function handleNext() {
    const errs = validateStep(step);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStep((s) => s + 1);
  }

  function handleBack() {
    setErrors({});
    setStep((s) => s - 1);
  }

  // ── Tool management ──
  function addTool(name: ToolName) {
    if (form.tools.find((t) => t.name === name)) return;
    setForm((f) => ({ ...f, tools: [...f.tools, createToolEntry(name)] }));
    setShowToolPicker(false);
  }

  function removeTool(id: string) {
    setForm((f) => ({ ...f, tools: f.tools.filter((t) => t.id !== id) }));
  }

  function updateTool(id: string, field: keyof ToolEntry, value: string) {
    setForm((f) => ({
      ...f,
      tools: f.tools.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
    }));
  }

  // ── Submit ──
  async function handleSubmit() {
    const errs = validateStep(1);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setIsSubmitting(true);
    try {
      const auditInput = {
        teamSize: parseInt(form.teamSize),
        primaryUseCase: form.primaryUseCase,
        tools: form.tools.map((t) => ({
          name: t.name,
          plan: t.plan,
          monthlySpend: parseFloat(t.monthlySpend) || 0,
          seats: parseInt(t.seats) || 1,
        })),
      };
      const result = await runAudit(auditInput);
      localStorage.setItem("latestAuditResult", JSON.stringify(result));
      localStorage.removeItem(STORAGE_KEY);
      router.push("/results");
    } catch (err) {
      console.error("Audit failed:", err);
      setErrors({ submit: "Something went wrong. Please try again." });
      setIsSubmitting(false);
    }
  }

  const totalMonthly = form.tools.reduce(
    (sum, t) => sum + (parseFloat(t.monthlySpend) || 0),
    0
  );
  const addedToolNames = new Set(form.tools.map((t) => t.name));

  // ── Shared input style ──
  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    padding: "14px 16px",
    color: "#fff",
    fontSize: "15px",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s ease",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "11px",
    fontFamily: "'DM Mono', monospace",
    color: "rgba(255,255,255,0.4)",
    marginBottom: "8px",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  };

  const errorStyle: React.CSSProperties = {
    fontSize: "12px",
    color: "#F87171",
    marginTop: "6px",
    fontFamily: "'DM Mono', monospace",
  };

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');

        * { box-sizing: border-box; }

        body {
          background: #0A0A0A;
          margin: 0;
        }

        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          opacity: 0.3;
        }

        input:focus, select:focus {
          border-color: rgba(110,231,183,0.4) !important;
          box-shadow: 0 0 0 3px rgba(110,231,183,0.06);
        }

        .tool-picker-btn:hover {
          background: rgba(110,231,183,0.08) !important;
          border-color: rgba(110,231,183,0.3) !important;
          color: #6EE7B7 !important;
        }

        .next-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(110,231,183,0.25);
        }

        .next-btn:active:not(:disabled) {
          transform: translateY(0);
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "#0A0A0A",
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(16,185,129,0.06) 0%, transparent 60%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "40px 16px 80px",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* Back to home */}
        <div style={{ width: "100%", maxWidth: "680px", marginBottom: "32px" }}>
          <button
            type="button"
            onClick={() => router.push("/")}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.35)",
              fontSize: "13px",
              fontFamily: "'DM Mono', monospace",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "0",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.7)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.35)";
            }}
          >
            ← home
          </button>
        </div>

        {/* Header */}
        <div
          style={{
            width: "100%",
            maxWidth: "680px",
            marginBottom: "40px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(110,231,183,0.06)",
              border: "1px solid rgba(110,231,183,0.15)",
              borderRadius: "100px",
              padding: "5px 14px",
              width: "fit-content",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#6EE7B7",
                animation: "pulse 2s infinite",
              }}
            />
            <span
              style={{
                fontSize: "11px",
                color: "#6EE7B7",
                fontFamily: "'DM Mono', monospace",
                letterSpacing: "0.08em",
              }}
            >
              AI SPEND AUDIT
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(28px, 5vw, 40px)",
              fontWeight: "800",
              color: "#fff",
              margin: "0",
              letterSpacing: "-0.02em",
              lineHeight: "1.15",
            }}
          >
            Audit your AI stack.
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #6EE7B7 0%, #3B82F6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Cut what doesn't work.
            </span>
          </h1>

          <p
            style={{
              fontSize: "15px",
              color: "rgba(255,255,255,0.45)",
              margin: "0",
              lineHeight: "1.6",
            }}
          >
            Answer a few questions about your team's AI usage and we'll surface
            waste, gaps, and smarter alternatives — in seconds.
          </p>
        </div>

        {/* Step indicator */}
        <div
          style={{
            width: "100%",
            maxWidth: "680px",
            marginBottom: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <StepIndicator currentStep={step} totalSteps={3} />
          <span
            style={{
              fontSize: "11px",
              fontFamily: "'DM Mono', monospace",
              color: "rgba(255,255,255,0.25)",
            }}
          >
            {step === 0 ? "basics" : step === 1 ? "your tools" : "review"}
          </span>
        </div>

        {/* Card */}
        <div
          style={{
            width: "100%",
            maxWidth: "680px",
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "24px",
            padding: "36px",
          }}
        >
          {/* ─── STEP 0: Basics ───────────────────────────────────────────── */}
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              <div>
                <h2
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#fff",
                    margin: "0 0 4px",
                  }}
                >
                  About your team
                </h2>
                <p
                  style={{
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.35)",
                    margin: "0",
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  Step 1 of 3
                </p>
              </div>

              {/* Team size */}
              <div>
                <label style={labelStyle}>Team size</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 12"
                  value={form.teamSize}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, teamSize: e.target.value }))
                  }
                  style={inputStyle}
                />
                {errors.teamSize && (
                  <p style={errorStyle}>{errors.teamSize}</p>
                )}
              </div>

              {/* Primary use case */}
              <div>
                <label style={labelStyle}>Primary use case</label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "10px",
                  }}
                >
                  {USE_CASES.map((uc) => {
                    const isSelected = form.primaryUseCase === uc.value;
                    return (
                      <button
                        key={uc.value}
                        type="button"
                        onClick={() =>
                          setForm((f) => ({ ...f, primaryUseCase: uc.value }))
                        }
                        style={{
                          background: isSelected
                            ? "rgba(110,231,183,0.1)"
                            : "rgba(255,255,255,0.03)",
                          border: isSelected
                            ? "1.5px solid rgba(110,231,183,0.4)"
                            : "1.5px solid rgba(255,255,255,0.07)",
                          borderRadius: "12px",
                          padding: "14px 12px",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "8px",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            (e.currentTarget as HTMLButtonElement).style.borderColor =
                              "rgba(255,255,255,0.15)";
                            (e.currentTarget as HTMLButtonElement).style.background =
                              "rgba(255,255,255,0.05)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            (e.currentTarget as HTMLButtonElement).style.borderColor =
                              "rgba(255,255,255,0.07)";
                            (e.currentTarget as HTMLButtonElement).style.background =
                              "rgba(255,255,255,0.03)";
                          }
                        }}
                      >
                        <span style={{ fontSize: "22px" }}>{uc.icon}</span>
                        <span
                          style={{
                            fontSize: "12px",
                            color: isSelected
                              ? "#6EE7B7"
                              : "rgba(255,255,255,0.6)",
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: "500",
                          }}
                        >
                          {uc.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {errors.primaryUseCase && (
                  <p style={errorStyle}>{errors.primaryUseCase}</p>
                )}
              </div>
            </div>
          )}

          {/* ─── STEP 1: Tools ────────────────────────────────────────────── */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <h2
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#fff",
                    margin: "0 0 4px",
                  }}
                >
                  Your AI tools
                </h2>
                <p
                  style={{
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.35)",
                    margin: "0",
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  Step 2 of 3 — add every tool your team pays for
                </p>
              </div>

              {/* Tool cards */}
              {form.tools.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {form.tools.map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      onUpdate={(field, value) =>
                        updateTool(tool.id, field, value)
                      }
                      onRemove={() => removeTool(tool.id)}
                    />
                  ))}
                </div>
              )}

              {/* Per-tool errors */}
              {form.tools.map((t) => (
                <div key={t.id}>
                  {errors[`spend_${t.id}`] && (
                    <p style={errorStyle}>{errors[`spend_${t.id}`]}</p>
                  )}
                  {errors[`seats_${t.id}`] && (
                    <p style={errorStyle}>{errors[`seats_${t.id}`]}</p>
                  )}
                </div>
              ))}

              {/* Add tool button */}
              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setShowToolPicker((v) => !v)}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px dashed rgba(255,255,255,0.12)",
                    borderRadius: "12px",
                    padding: "14px",
                    color: "rgba(255,255,255,0.45)",
                    fontSize: "13px",
                    fontFamily: "'DM Mono', monospace",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "rgba(110,231,183,0.3)";
                    (e.currentTarget as HTMLButtonElement).style.color = "#6EE7B7";
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(110,231,183,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "rgba(255,255,255,0.12)";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "rgba(255,255,255,0.45)";
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(255,255,255,0.03)";
                  }}
                >
                  <span style={{ fontSize: "16px" }}>+</span>
                  Add AI tool
                </button>

                {/* Tool picker dropdown */}
                {showToolPicker && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      left: "0",
                      right: "0",
                      background: "#141414",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "14px",
                      padding: "8px",
                      zIndex: 50,
                      boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "6px",
                      }}
                    >
                      {ALL_TOOLS.map((name) => {
                        const isAdded = addedToolNames.has(name);
                        return (
                          <button
                            key={name}
                            type="button"
                            className="tool-picker-btn"
                            disabled={isAdded}
                            onClick={() => addTool(name)}
                            style={{
                              background: isAdded
                                ? "rgba(255,255,255,0.02)"
                                : "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.07)",
                              borderRadius: "9px",
                              padding: "10px 8px",
                              color: isAdded
                                ? "rgba(255,255,255,0.2)"
                                : "rgba(255,255,255,0.7)",
                              fontSize: "12px",
                              fontFamily: "'DM Sans', sans-serif",
                              cursor: isAdded ? "not-allowed" : "pointer",
                              textAlign: "center",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px",
                              transition: "all 0.15s",
                            }}
                          >
                            {isAdded && (
                              <span style={{ color: "#6EE7B7", fontSize: "10px" }}>
                                ✓
                              </span>
                            )}
                            {name}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowToolPicker(false)}
                      style={{
                        width: "100%",
                        marginTop: "8px",
                        background: "none",
                        border: "none",
                        color: "rgba(255,255,255,0.25)",
                        fontSize: "11px",
                        fontFamily: "'DM Mono', monospace",
                        cursor: "pointer",
                        padding: "6px",
                      }}
                    >
                      close
                    </button>
                  </div>
                )}
              </div>

              {errors.tools && <p style={errorStyle}>{errors.tools}</p>}

              {/* Running total */}
              {form.tools.length > 0 && (
                <div
                  style={{
                    background: "rgba(110,231,183,0.04)",
                    border: "1px solid rgba(110,231,183,0.1)",
                    borderRadius: "12px",
                    padding: "14px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontFamily: "'DM Mono', monospace",
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    TOTAL MONTHLY SPEND
                  </span>
                  <span
                    style={{
                      fontSize: "20px",
                      fontFamily: "'DM Mono', monospace",
                      fontWeight: "500",
                      color: "#6EE7B7",
                    }}
                  >
                    ${totalMonthly.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ─── STEP 2: Review ───────────────────────────────────────────── */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <h2
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#fff",
                    margin: "0 0 4px",
                  }}
                >
                  Review & run audit
                </h2>
                <p
                  style={{
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.35)",
                    margin: "0",
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  Step 3 of 3 — confirm your details
                </p>
              </div>

              {/* Summary grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "12px",
                    padding: "16px",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 6px",
                      fontSize: "10px",
                      fontFamily: "'DM Mono', monospace",
                      color: "rgba(255,255,255,0.35)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    Team size
                  </p>
                  <p
                    style={{
                      margin: "0",
                      fontSize: "22px",
                      fontFamily: "'DM Mono', monospace",
                      fontWeight: "500",
                      color: "#fff",
                    }}
                  >
                    {form.teamSize}
                    <span
                      style={{
                        fontSize: "13px",
                        color: "rgba(255,255,255,0.35)",
                        marginLeft: "4px",
                      }}
                    >
                      people
                    </span>
                  </p>
                </div>

                <div
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "12px",
                    padding: "16px",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 6px",
                      fontSize: "10px",
                      fontFamily: "'DM Mono', monospace",
                      color: "rgba(255,255,255,0.35)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    Use case
                  </p>
                  <p
                    style={{
                      margin: "0",
                      fontSize: "15px",
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: "600",
                      color: "#fff",
                      textTransform: "capitalize",
                    }}
                  >
                    {USE_CASES.find((u) => u.value === form.primaryUseCase)?.icon}{" "}
                    {form.primaryUseCase}
                  </p>
                </div>
              </div>

              {/* Tools summary */}
              <div>
                <p
                  style={{
                    margin: "0 0 12px",
                    fontSize: "10px",
                    fontFamily: "'DM Mono', monospace",
                    color: "rgba(255,255,255,0.35)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Tools ({form.tools.length})
                </p>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: "8px" }}
                >
                  {form.tools.map((t) => (
                    <div
                      key={t.id}
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "10px",
                        padding: "12px 16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            width: "7px",
                            height: "7px",
                            borderRadius: "50%",
                            background: TOOL_COLORS[t.name],
                            boxShadow: `0 0 6px ${TOOL_COLORS[t.name]}80`,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: "500",
                            color: "#fff",
                          }}
                        >
                          {t.name}
                        </span>
                        <span
                          style={{
                            fontSize: "11px",
                            color: "rgba(255,255,255,0.3)",
                            fontFamily: "'DM Mono', monospace",
                          }}
                        >
                          {t.plan}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "13px",
                            fontFamily: "'DM Mono', monospace",
                            color: "#6EE7B7",
                          }}
                        >
                          ${parseFloat(t.monthlySpend || "0").toFixed(0)}/mo
                        </span>
                        <span
                          style={{
                            fontSize: "11px",
                            color: "rgba(255,255,255,0.3)",
                            fontFamily: "'DM Mono', monospace",
                          }}
                        >
                          {t.seats} seat{parseInt(t.seats) !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(110,231,183,0.06) 0%, rgba(59,130,246,0.06) 100%)",
                  border: "1px solid rgba(110,231,183,0.15)",
                  borderRadius: "14px",
                  padding: "20px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: "0 0 2px",
                      fontSize: "10px",
                      fontFamily: "'DM Mono', monospace",
                      color: "rgba(255,255,255,0.35)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    Total monthly spend
                  </p>
                  <p
                    style={{
                      margin: "0",
                      fontSize: "11px",
                      fontFamily: "'DM Mono', monospace",
                      color: "rgba(255,255,255,0.25)",
                    }}
                  >
                    ${(totalMonthly * 12).toFixed(0)}/yr annualized
                  </p>
                </div>
                <span
                  style={{
                    fontSize: "28px",
                    fontFamily: "'DM Mono', monospace",
                    fontWeight: "500",
                    color: "#6EE7B7",
                  }}
                >
                  ${totalMonthly.toFixed(2)}
                </span>
              </div>

              {errors.submit && (
                <div
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    borderRadius: "10px",
                    padding: "12px 16px",
                  }}
                >
                  <p style={{ ...errorStyle, margin: "0" }}>{errors.submit}</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "32px",
              paddingTop: "24px",
              borderTop: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {step > 0 ? (
              <button
                type="button"
                onClick={handleBack}
                style={{
                  background: "none",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  padding: "11px 20px",
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "13px",
                  fontFamily: "'DM Mono', monospace",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "rgba(255,255,255,0.2)";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "rgba(255,255,255,0.8)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "rgba(255,255,255,0.1)";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "rgba(255,255,255,0.5)";
                }}
              >
                ← back
              </button>
            ) : (
              <div />
            )}

            {step < 2 ? (
              <button
                type="button"
                className="next-btn"
                onClick={handleNext}
                style={{
                  background: "linear-gradient(135deg, #6EE7B7 0%, #3B82F6 100%)",
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px 28px",
                  color: "#000",
                  fontSize: "14px",
                  fontWeight: "700",
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  letterSpacing: "-0.01em",
                }}
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                className="next-btn"
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{
                  background: isSubmitting
                    ? "rgba(110,231,183,0.4)"
                    : "linear-gradient(135deg, #6EE7B7 0%, #3B82F6 100%)",
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px 28px",
                  color: "#000",
                  fontSize: "14px",
                  fontWeight: "700",
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  letterSpacing: "-0.01em",
                }}
              >
                {isSubmitting ? (
                  <>
                    <span
                      style={{
                        display: "inline-block",
                        width: "14px",
                        height: "14px",
                        border: "2px solid rgba(0,0,0,0.3)",
                        borderTopColor: "#000",
                        borderRadius: "50%",
                        animation: "spin 0.7s linear infinite",
                      }}
                    />
                    Analyzing…
                  </>
                ) : (
                  "Run audit →"
                )}
              </button>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p
          style={{
            marginTop: "24px",
            fontSize: "11px",
            fontFamily: "'DM Mono', monospace",
            color: "rgba(255,255,255,0.18)",
            textAlign: "center",
          }}
        >
          Data stays in your browser. Nothing is sent to a server.
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
