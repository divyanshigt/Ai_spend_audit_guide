"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { runAudit } from "@/lib/audit-engine";
import type { AITool, AuditInput, UseCase } from "@/types/audit";

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
  primaryUseCase: UseCase | "";
  tools: ToolEntry[];
}

const STORAGE_KEY = "auditFormState";

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

const TOOL_MAP: Record<ToolName, AITool> = {
  Cursor: "cursor",
  "GitHub Copilot": "github_copilot",
  Claude: "claude",
  ChatGPT: "chatgpt",
  "Anthropic API": "anthropic_api",
  "OpenAI API": "openai_api",
  Gemini: "gemini",
  Windsurf: "windsurf",
  v0: "v0",
};

const USE_CASES: { value: UseCase; label: string; icon: string }[] = [
  { value: "coding", label: "Coding", icon: "⌨️" },
  { value: "writing", label: "Writing", icon: "✍️" },
  { value: "research", label: "Research", icon: "🔬" },
  { value: "data", label: "Data & Analytics", icon: "📊" },
  { value: "mixed", label: "Mixed / General", icon: "🌐" },
];

const TOOL_PLANS: Record<ToolName, string[]> = {
  Cursor: ["free", "pro", "business", "enterprise"],
  "GitHub Copilot": ["individual", "business", "enterprise"],
  Claude: ["free", "pro", "team", "enterprise"],
  ChatGPT: ["free", "plus", "team", "enterprise"],
  "Anthropic API": ["pay_as_you_go", "committed_use"],
  "OpenAI API": ["pay_as_you_go", "committed_use"],
  Gemini: ["free", "pro", "ultra", "api"],
  Windsurf: ["free", "pro", "teams", "enterprise"],
  v0: ["free", "premium", "team"],
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

function generateId() {
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

function formatPlan(plan: string) {
  return plan
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export default function AuditPage() {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showToolPicker, setShowToolPicker] = useState(false);

  const [form, setForm] = useState<FormState>({
    teamSize: "",
    primaryUseCase: "",
    tools: [],
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setForm(JSON.parse(saved) as FormState);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch {}
  }, [form]);

  function validateStep(currentStep: number) {
    const nextErrors: Record<string, string> = {};

    if (currentStep === 0) {
      if (!form.teamSize || Number(form.teamSize) < 1) {
        nextErrors.teamSize = "Please enter a valid team size.";
      }

      if (!form.primaryUseCase) {
        nextErrors.primaryUseCase = "Please select a primary use case.";
      }
    }

    if (currentStep === 1) {
      if (form.tools.length === 0) {
        nextErrors.tools = "Add at least one AI tool.";
      }

      form.tools.forEach((tool) => {
        if (!tool.monthlySpend || Number(tool.monthlySpend) < 0) {
          nextErrors[`spend_${tool.id}`] = `Enter monthly spend for ${tool.name}.`;
        }

        if (!tool.seats || Number(tool.seats) < 1) {
          nextErrors[`seats_${tool.id}`] = `Enter seats for ${tool.name}.`;
        }
      });
    }

    return nextErrors;
  }

  function handleNext() {
    const nextErrors = validateStep(step);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setStep((value) => value + 1);
  }

  function handleBack() {
    setErrors({});
    setStep((value) => value - 1);
  }

  function addTool(name: ToolName) {
    if (form.tools.some((tool) => tool.name === name)) return;

    setForm((current) => ({
      ...current,
      tools: [...current.tools, createToolEntry(name)],
    }));

    setShowToolPicker(false);
  }

  function removeTool(id: string) {
    setForm((current) => ({
      ...current,
      tools: current.tools.filter((tool) => tool.id !== id),
    }));
  }

  function updateTool(id: string, field: keyof ToolEntry, value: string) {
    setForm((current) => ({
      ...current,
      tools: current.tools.map((tool) =>
        tool.id === id ? { ...tool, [field]: value } : tool
      ),
    }));
  }

  function handleSubmit() {
    const nextErrors = validateStep(1);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (!form.primaryUseCase) {
      setErrors({ primaryUseCase: "Please select a primary use case." });
      return;
    }

    setIsSubmitting(true);

    try {
      const auditInput: AuditInput = {
        teamSize: Number(form.teamSize),
        useCase: form.primaryUseCase,
        tools: form.tools.map((tool) => ({
          tool: TOOL_MAP[tool.name],
          plan: tool.plan,
          monthlySpend: Number(tool.monthlySpend) || 0,
          seats: Number(tool.seats) || 1,
        })),
      };

      const rawResult = runAudit(auditInput);

      const resultForDashboard = {
        ...rawResult,
        optimizedSpend: rawResult.optimizedMonthlySpend,
        overallScore: Math.round(
          (rawResult.scoreBreakdown.efficiency +
            rawResult.scoreBreakdown.coverage +
            rawResult.scoreBreakdown.overlap +
            rawResult.scoreBreakdown.planFit) /
            4
        ),
        confidenceScore:
          rawResult.recommendations.length > 0
            ? Math.round(
                rawResult.recommendations.reduce(
                  (sum, rec) => sum + rec.confidence,
                  0
                ) / rawResult.recommendations.length
              )
            : 90,
        aiSummary: rawResult.aiSummary || rawResult.summary,
        auditedAt: rawResult.createdAt,
        scoreBreakdown: [
          {
            label: "Efficiency",
            score: rawResult.scoreBreakdown.efficiency,
            maxScore: 100,
            icon: "⚡",
          },
          {
            label: "Coverage",
            score: rawResult.scoreBreakdown.coverage,
            maxScore: 100,
            icon: "🧩",
          },
          {
            label: "Overlap",
            score: rawResult.scoreBreakdown.overlap,
            maxScore: 100,
            icon: "🔁",
          },
          {
            label: "Plan Fit",
            score: rawResult.scoreBreakdown.planFit,
            maxScore: 100,
            icon: "🎯",
          },
        ],
        recommendations: rawResult.recommendations.map((rec) => ({
          id: rec.id,
          title: rec.title,
          description: rec.description,
          severity:
            rec.severity === "critical"
              ? "critical"
              : rec.severity === "warning"
              ? "high"
              : rec.severity === "info"
              ? "medium"
              : "low",
          category: rec.tool.replace("_", " "),
          monthlySavings: rec.monthlySavings,
          confidence: rec.confidence,
          effort:
            rec.monthlySavings >= 500
              ? "high"
              : rec.monthlySavings >= 100
              ? "medium"
              : "low",
          tags: [rec.action],
        })),
      };

      localStorage.setItem("latestAuditResult", JSON.stringify(resultForDashboard));
      localStorage.removeItem(STORAGE_KEY);
      router.push("/results");
    } catch (error) {
      console.error("Audit failed:", error);
      setErrors({ submit: "Something went wrong. Please try again." });
      setIsSubmitting(false);
    }
  }

  const totalMonthly = form.tools.reduce(
    (sum, tool) => sum + (Number(tool.monthlySpend) || 0),
    0
  );

  const addedToolNames = new Set(form.tools.map((tool) => tool.name));

  const inputStyle: CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    padding: "14px 16px",
    color: "#fff",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: CSSProperties = {
    display: "block",
    fontSize: "11px",
    color: "rgba(255,255,255,0.4)",
    marginBottom: "8px",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  };

  const errorStyle: CSSProperties = {
    fontSize: "12px",
    color: "#F87171",
    marginTop: "6px",
  };

  return (
    <>
      <style>{`
        body {
          background: #0A0A0A;
          margin: 0;
        }

        * {
          box-sizing: border-box;
        }

        input:focus,
        select:focus {
          border-color: rgba(110,231,183,0.4) !important;
          box-shadow: 0 0 0 3px rgba(110,231,183,0.06);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <main
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(16,185,129,0.08), transparent 60%), #0A0A0A",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "40px 16px 80px",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div style={{ width: "100%", maxWidth: "680px", marginBottom: "32px" }}>
          <button
            type="button"
            onClick={() => router.push("/")}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.45)",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            ← home
          </button>
        </div>

        <section style={{ width: "100%", maxWidth: "680px", marginBottom: "32px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              border: "1px solid rgba(110,231,183,0.18)",
              background: "rgba(110,231,183,0.06)",
              padding: "6px 14px",
              borderRadius: "999px",
              marginBottom: "16px",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "999px",
                background: "#6EE7B7",
                animation: "pulse 2s infinite",
              }}
            />
            <span style={{ fontSize: "12px", color: "#6EE7B7" }}>
              AI SPEND AUDIT
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 46px)",
              lineHeight: 1.1,
              margin: "0 0 12px",
              letterSpacing: "-0.04em",
            }}
          >
            Audit your AI stack.
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #6EE7B7, #3B82F6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Cut what doesn&apos;t work.
            </span>
          </h1>

          <p style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
            Answer a few questions about your team&apos;s AI usage and we&apos;ll
            surface waste, overlaps, and smarter savings opportunities.
          </p>
        </section>

        <section
          style={{
            width: "100%",
            maxWidth: "680px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {[0, 1, 2].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "999px",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "12px",
                    fontWeight: 700,
                    background:
                      item < step
                        ? "linear-gradient(135deg, #6EE7B7, #3B82F6)"
                        : item === step
                        ? "rgba(110,231,183,0.12)"
                        : "rgba(255,255,255,0.04)",
                    color: item < step ? "#000" : item === step ? "#6EE7B7" : "#777",
                    border:
                      item === step
                        ? "1px solid rgba(110,231,183,0.35)"
                        : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {item < step ? "✓" : item + 1}
                </div>
                {item < 2 && (
                  <div
                    style={{
                      width: "40px",
                      height: "1px",
                      background:
                        item < step
                          ? "linear-gradient(90deg, #6EE7B7, #3B82F6)"
                          : "rgba(255,255,255,0.08)",
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px" }}>
            {step === 0 ? "basics" : step === 1 ? "tools" : "review"}
          </span>
        </section>

        <section
          style={{
            width: "100%",
            maxWidth: "680px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "24px",
            padding: "32px",
          }}
        >
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <h2 style={{ margin: "0 0 6px", fontSize: "22px" }}>
                  About your team
                </h2>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.4)" }}>
                  Step 1 of 3
                </p>
              </div>

              <div>
                <label style={labelStyle}>Team size</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 12"
                  value={form.teamSize}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      teamSize: event.target.value,
                    }))
                  }
                  style={inputStyle}
                />
                {errors.teamSize && <p style={errorStyle}>{errors.teamSize}</p>}
              </div>

              <div>
                <label style={labelStyle}>Primary use case</label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                    gap: "10px",
                  }}
                >
                  {USE_CASES.map((item) => {
                    const active = form.primaryUseCase === item.value;

                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            primaryUseCase: item.value,
                          }))
                        }
                        style={{
                          background: active
                            ? "rgba(110,231,183,0.1)"
                            : "rgba(255,255,255,0.04)",
                          border: active
                            ? "1px solid rgba(110,231,183,0.45)"
                            : "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "14px",
                          padding: "14px",
                          color: active ? "#6EE7B7" : "rgba(255,255,255,0.68)",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ fontSize: "22px", marginBottom: "8px" }}>
                          {item.icon}
                        </div>
                        <div>{item.label}</div>
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

          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
              <div>
                <h2 style={{ margin: "0 0 6px", fontSize: "22px" }}>
                  Your AI tools
                </h2>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.4)" }}>
                  Add every AI tool your team pays for.
                </p>
              </div>

              {form.tools.map((tool) => (
                <div
                  key={tool.id}
                  style={{
                    background: "rgba(255,255,255,0.035)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "16px",
                    padding: "18px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "14px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span
                        style={{
                          width: "9px",
                          height: "9px",
                          borderRadius: "999px",
                          background: TOOL_COLORS[tool.name],
                        }}
                      />
                      <strong>{tool.name}</strong>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeTool(tool.id)}
                      style={{
                        background: "rgba(239,68,68,0.1)",
                        border: "1px solid rgba(239,68,68,0.25)",
                        color: "#F87171",
                        borderRadius: "8px",
                        padding: "5px 10px",
                        cursor: "pointer",
                      }}
                    >
                      remove
                    </button>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <label style={labelStyle}>Plan</label>
                      <select
                        value={tool.plan}
                        onChange={(event) =>
                          updateTool(tool.id, "plan", event.target.value)
                        }
                        style={inputStyle}
                      >
                        {TOOL_PLANS[tool.name].map((plan) => (
                          <option key={plan} value={plan} style={{ background: "#111" }}>
                            {formatPlan(plan)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={labelStyle}>Monthly spend</label>
                      <input
                        type="number"
                        min="0"
                        value={tool.monthlySpend}
                        placeholder="0"
                        onChange={(event) =>
                          updateTool(tool.id, "monthlySpend", event.target.value)
                        }
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Seats</label>
                      <input
                        type="number"
                        min="1"
                        value={tool.seats}
                        placeholder="1"
                        onChange={(event) =>
                          updateTool(tool.id, "seats", event.target.value)
                        }
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  {errors[`spend_${tool.id}`] && (
                    <p style={errorStyle}>{errors[`spend_${tool.id}`]}</p>
                  )}
                  {errors[`seats_${tool.id}`] && (
                    <p style={errorStyle}>{errors[`seats_${tool.id}`]}</p>
                  )}
                </div>
              ))}

              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setShowToolPicker((value) => !value)}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.035)",
                    border: "1px dashed rgba(255,255,255,0.18)",
                    borderRadius: "14px",
                    color: "rgba(255,255,255,0.65)",
                    padding: "14px",
                    cursor: "pointer",
                  }}
                >
                  + Add AI tool
                </button>

                {showToolPicker && (
                  <div
                    style={{
                      marginTop: "10px",
                      background: "#111",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "14px",
                      padding: "10px",
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                      gap: "8px",
                    }}
                  >
                    {ALL_TOOLS.map((name) => {
                      const added = addedToolNames.has(name);

                      return (
                        <button
                          key={name}
                          type="button"
                          disabled={added}
                          onClick={() => addTool(name)}
                          style={{
                            padding: "10px",
                            borderRadius: "10px",
                            border: "1px solid rgba(255,255,255,0.08)",
                            background: added
                              ? "rgba(255,255,255,0.02)"
                              : "rgba(255,255,255,0.05)",
                            color: added ? "rgba(255,255,255,0.25)" : "#fff",
                            cursor: added ? "not-allowed" : "pointer",
                          }}
                        >
                          {added ? "✓ " : ""}
                          {name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {errors.tools && <p style={errorStyle}>{errors.tools}</p>}

              {form.tools.length > 0 && (
                <div
                  style={{
                    background: "rgba(110,231,183,0.06)",
                    border: "1px solid rgba(110,231,183,0.15)",
                    borderRadius: "14px",
                    padding: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ color: "rgba(255,255,255,0.55)" }}>
                    Total monthly spend
                  </span>
                  <strong style={{ color: "#6EE7B7", fontSize: "22px" }}>
                    ${totalMonthly.toFixed(2)}
                  </strong>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
              <div>
                <h2 style={{ margin: "0 0 6px", fontSize: "22px" }}>
                  Review & run audit
                </h2>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.4)" }}>
                  Confirm your details before running the audit.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "14px",
                    padding: "16px",
                  }}
                >
                  <p style={{ color: "rgba(255,255,255,0.4)", margin: "0 0 6px" }}>
                    Team size
                  </p>
                  <strong style={{ fontSize: "24px" }}>{form.teamSize}</strong>
                </div>

                <div
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "14px",
                    padding: "16px",
                  }}
                >
                  <p style={{ color: "rgba(255,255,255,0.4)", margin: "0 0 6px" }}>
                    Use case
                  </p>
                  <strong style={{ textTransform: "capitalize" }}>
                    {form.primaryUseCase}
                  </strong>
                </div>
              </div>

              <div>
                {form.tools.map((tool) => (
                  <div
                    key={tool.id}
                    style={{
                      background: "rgba(255,255,255,0.035)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "12px",
                      padding: "14px 16px",
                      marginBottom: "8px",
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <strong>{tool.name}</strong>
                      <div style={{ color: "rgba(255,255,255,0.38)", fontSize: "13px" }}>
                        {formatPlan(tool.plan)} · {tool.seats} seat
                        {Number(tool.seats) !== 1 ? "s" : ""}
                      </div>
                    </div>

                    <strong style={{ color: "#6EE7B7" }}>
                      ${Number(tool.monthlySpend || 0).toFixed(0)}/mo
                    </strong>
                  </div>
                ))}
              </div>

              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(110,231,183,0.08), rgba(59,130,246,0.08))",
                  border: "1px solid rgba(110,231,183,0.18)",
                  borderRadius: "16px",
                  padding: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p style={{ color: "rgba(255,255,255,0.45)", margin: "0 0 4px" }}>
                    Total monthly spend
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.28)", margin: 0 }}>
                    ${(totalMonthly * 12).toFixed(0)}/yr annualized
                  </p>
                </div>

                <strong style={{ color: "#6EE7B7", fontSize: "28px" }}>
                  ${totalMonthly.toFixed(2)}
                </strong>
              </div>

              {errors.submit && <p style={errorStyle}>{errors.submit}</p>}
            </div>
          )}

          <div
            style={{
              marginTop: "32px",
              paddingTop: "22px",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            {step > 0 ? (
              <button
                type="button"
                onClick={handleBack}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.75)",
                  borderRadius: "10px",
                  padding: "12px 20px",
                  cursor: "pointer",
                }}
              >
                ← Back
              </button>
            ) : (
              <div />
            )}

            {step < 2 ? (
              <button
                type="button"
                onClick={handleNext}
                style={{
                  background: "linear-gradient(135deg, #6EE7B7, #3B82F6)",
                  color: "#000",
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px 26px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                style={{
                  background: isSubmitting
                    ? "rgba(110,231,183,0.45)"
                    : "linear-gradient(135deg, #6EE7B7, #3B82F6)",
                  color: "#000",
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px 26px",
                  fontWeight: 800,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {isSubmitting && (
                  <span
                    style={{
                      width: "14px",
                      height: "14px",
                      border: "2px solid rgba(0,0,0,0.3)",
                      borderTopColor: "#000",
                      borderRadius: "999px",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                )}
                {isSubmitting ? "Analyzing..." : "Run audit →"}
              </button>
            )}
          </div>
        </section>

        <p
          style={{
            marginTop: "24px",
            color: "rgba(255,255,255,0.22)",
            fontSize: "12px",
            textAlign: "center",
          }}
        >
          Data stays in your browser. Nothing is sent to a server.
        </p>
      </main>
    </>
  );
}