import type { AuditInput, AuditResult, Recommendation, ToolSpend } from "@/types/audit";
import { TOOL_PRICING } from "./pricing-data";
import { nanoid } from "@/lib/utils";

// ─── Individual tool auditors ─────────────────────────────────────────────────

function auditCursor(tool: ToolSpend, teamSize: number, useCase: string): Recommendation | null {
  const { plan, monthlySpend, seats } = tool;

  // Business plan for tiny teams
  if (plan === "business" && seats < 8) {
    const proMonthlyCost = seats * 20;
    const savings = monthlySpend - proMonthlyCost;
    if (savings > 0) {
      return {
        id: nanoid(),
        tool: "cursor",
        severity: "critical",
        title: "Cursor Business is overkill for your team size",
        description: `You're paying $${monthlySpend}/mo for Cursor Business with ${seats} seat${seats > 1 ? "s" : ""}. Business adds SSO, audit logs, and admin controls — features that matter at 15+ engineers, not ${seats}.`,
        currentCost: monthlySpend,
        recommendedCost: proMonthlyCost,
        monthlySavings: savings,
        annualSavings: savings * 12,
        action: "Downgrade to Cursor Pro",
        alternativePlan: "pro",
        reasoning: [
          `Business plan costs $40/seat vs Pro at $20/seat`,
          `Admin controls and SSO add value at 15+ seats — you have ${seats}`,
          `Pro supports unlimited completions and fast requests — identical for your workflows`,
          `You can upgrade back to Business in under 5 minutes when the team scales`,
        ],
        confidence: 92,
      };
    }
  }

  // Overpaying on seats vs team size
  if (seats > teamSize * 1.2 && seats > 3) {
    const excess = seats - teamSize;
    const savings = excess * (plan === "business" ? 40 : plan === "pro" ? 20 : 0);
    if (savings > 20) {
      return {
        id: nanoid(),
        tool: "cursor",
        severity: "warning",
        title: `${excess} unused Cursor seat${excess > 1 ? "s" : ""} detected`,
        description: `You have ${seats} Cursor seats but only ${teamSize} people on the team. That's $${savings}/mo in unused licenses.`,
        currentCost: monthlySpend,
        recommendedCost: monthlySpend - savings,
        monthlySavings: savings,
        annualSavings: savings * 12,
        action: `Remove ${excess} unused seat${excess > 1 ? "s" : ""}`,
        reasoning: [
          `${seats} seats licensed, ${teamSize} active users`,
          `Unused seats accumulate cost without delivering value`,
          `License cleanup takes ~10 minutes in admin settings`,
        ],
        confidence: 85,
      };
    }
  }

  // Non-coding teams paying for Cursor
  if (useCase === "writing" || useCase === "research") {
    const savings = monthlySpend;
    return {
      id: nanoid(),
      tool: "cursor",
      severity: "critical",
      title: "Cursor isn't aligned with your primary workflow",
      description: `Cursor is purpose-built for coding. Your team's primary use case is ${useCase}. You're paying $${monthlySpend}/mo for a specialized tool that likely goes underused.`,
      currentCost: monthlySpend,
      recommendedCost: 0,
      monthlySavings: savings,
      annualSavings: savings * 12,
      action: "Evaluate usage and consider canceling",
      alternativeTool: useCase === "writing" ? "claude" : "chatgpt",
      reasoning: [
        `Cursor's core value is code completion and AI-assisted editing`,
        `Writing/research teams get more ROI from Claude or ChatGPT`,
        `Verify actual usage with the team before canceling`,
      ],
      confidence: 70,
    };
  }

  return null;
}

function auditGitHubCopilot(tool: ToolSpend, teamSize: number): Recommendation | null {
  const { plan, monthlySpend, seats } = tool;

  // Enterprise when Business would suffice
  if (plan === "enterprise" && seats < 25) {
    const businessCost = seats * 19;
    const savings = monthlySpend - businessCost;
    if (savings > 0) {
      return {
        id: nanoid(),
        tool: "github_copilot",
        severity: "critical",
        title: "Copilot Enterprise features unused at your scale",
        description: `Enterprise adds fine-tuned models and custom training — capabilities that take months to configure and need dedicated ML engineers to extract value from.`,
        currentCost: monthlySpend,
        recommendedCost: businessCost,
        monthlySavings: savings,
        annualSavings: savings * 12,
        action: "Downgrade to GitHub Copilot Business",
        alternativePlan: "business",
        reasoning: [
          `Enterprise is $39/seat vs Business at $19/seat`,
          `Custom model training requires ML infra most early-stage teams don't have`,
          `Business plan covers org policies, audit logs, and unlimited chat`,
          `Save the Enterprise features for when you have 50+ engineers`,
        ],
        confidence: 88,
      };
    }
  }

  // Copilot + Cursor overlap (if both are present)
  return null; // overlap detected at audit level
}

function auditClaude(tool: ToolSpend, teamSize: number, useCase: string): Recommendation | null {
  const { plan, monthlySpend, seats } = tool;

  if (plan === "team" && seats < 5) {
    const proCost = seats * 20;
    const savings = monthlySpend - proCost;
    if (savings > 0) {
      return {
        id: nanoid(),
        tool: "claude",
        severity: "warning",
        title: "Claude Team plan charges a premium your team size doesn't justify",
        description: `Team plan requires minimum spend and SSO features that don't matter until you're 10+ people. With ${seats} seat${seats > 1 ? "s" : ""}, you'd save $${savings}/mo on Pro.`,
        currentCost: monthlySpend,
        recommendedCost: proCost,
        monthlySavings: savings,
        annualSavings: savings * 12,
        action: "Switch to Claude Pro (individual subscriptions)",
        alternativePlan: "pro",
        reasoning: [
          `Team adds admin console, SSO, and usage analytics`,
          `These features become valuable at 8+ team members`,
          `Pro provides identical AI capabilities at $20/seat vs $30`,
          `Individual Pro plans also let team members manage their own billing`,
        ],
        confidence: 80,
      };
    }
  }

  // Claude Pro for data-heavy teams where API would be cheaper
  if (plan === "pro" && seats >= 5 && useCase === "data") {
    const apiEstimate = seats * 15; // estimated API cost at moderate usage
    const savings = monthlySpend - apiEstimate;
    if (savings > 50) {
      return {
        id: nanoid(),
        tool: "claude",
        severity: "info",
        title: "Anthropic API may be more cost-effective for data workflows",
        description: `Data teams with programmatic workflows typically spend less on the API than on flat per-seat pricing. At ${seats} seats, your API costs at moderate usage would be ~$${apiEstimate}/mo.`,
        currentCost: monthlySpend,
        recommendedCost: apiEstimate,
        monthlySavings: savings,
        annualSavings: savings * 12,
        action: "Benchmark API usage with Anthropic's free tier",
        alternativeTool: "anthropic_api",
        reasoning: [
          `Claude 3.5 Haiku handles most data tasks at $0.25/MTok — extremely cheap`,
          `API lets you control exactly which workflows use AI and cap spend`,
          `Flat per-seat pricing pays for headroom you may not need`,
        ],
        confidence: 65,
      };
    }
  }

  return null;
}

function auditChatGPT(tool: ToolSpend, teamSize: number): Recommendation | null {
  const { plan, monthlySpend, seats } = tool;

  if (plan === "enterprise" && seats < 25) {
    const teamCost = seats * 30;
    const savings = monthlySpend - teamCost;
    if (savings > 0) {
      return {
        id: nanoid(),
        tool: "chatgpt",
        severity: "critical",
        title: "ChatGPT Enterprise pricing rarely makes sense under 25 seats",
        description: `Enterprise contracts with OpenAI carry significant overhead — dedicated support, compliance reviews, and custom MSAs that take weeks to negotiate. For ${seats} people, Team plan delivers the same day-to-day product.`,
        currentCost: monthlySpend,
        recommendedCost: teamCost,
        monthlySavings: savings,
        annualSavings: savings * 12,
        action: "Downgrade to ChatGPT Team",
        alternativePlan: "team",
        reasoning: [
          `Team plan: no training on your data, admin console, higher limits`,
          `Enterprise adds dedicated account management and custom contracts`,
          `Those features have real value at 50+ seats — not ${seats}`,
        ],
        confidence: 85,
      };
    }
  }

  return null;
}

function auditOpenAIAPI(tool: ToolSpend, teamSize: number, useCase: string): Recommendation | null {
  const { monthlySpend } = tool;

  // High spend on OpenAI API — check model selection
  if (monthlySpend > 200) {
    return {
      id: nanoid(),
      tool: "openai_api",
      severity: "warning",
      title: "Optimize model selection to cut OpenAI API costs significantly",
      description: `At $${monthlySpend}/mo, your OpenAI API bill likely includes GPT-4o calls that could be handled by GPT-4o mini at 97% lower cost per token.`,
      currentCost: monthlySpend,
      recommendedCost: Math.round(monthlySpend * 0.55),
      monthlySavings: Math.round(monthlySpend * 0.45),
      annualSavings: Math.round(monthlySpend * 0.45 * 12),
      action: "Audit model usage and route simpler tasks to GPT-4o mini",
      reasoning: [
        `GPT-4o mini: $0.15/MTok input vs GPT-4o: $5/MTok — 33x cheaper`,
        `Most classification, summarization, and extraction tasks work fine on mini`,
        `Routing 60-70% of calls to mini typically cuts API bills by 40-50%`,
        `Use structured outputs to maintain quality with cheaper models`,
      ],
      confidence: 72,
    };
  }

  return null;
}

function auditAnthropicAPI(tool: ToolSpend): Recommendation | null {
  const { monthlySpend } = tool;

  if (monthlySpend > 300) {
    return {
      id: nanoid(),
      tool: "anthropic_api",
      severity: "info",
      title: "Committed Use discounts could save 15-25% on Anthropic API",
      description: `At $${monthlySpend}/mo, you may qualify for Anthropic's committed use pricing. Committing to a monthly minimum typically unlocks 15-25% off list pricing.`,
      currentCost: monthlySpend,
      recommendedCost: Math.round(monthlySpend * 0.8),
      monthlySavings: Math.round(monthlySpend * 0.2),
      annualSavings: Math.round(monthlySpend * 0.2 * 12),
      action: "Contact Anthropic sales for committed use pricing",
      reasoning: [
        `Committed use tiers typically start at $2,000-$5,000/month`,
        `Discounts range from 15-25% depending on commitment level`,
        `Also enables prompt caching which can reduce costs by an additional 10-20%`,
      ],
      confidence: 68,
    };
  }

  return null;
}

function auditWindsurf(tool: ToolSpend, teamSize: number): Recommendation | null {
  const { plan, monthlySpend, seats } = tool;

  if (plan === "teams" && seats < 6) {
    const proCost = seats * 15;
    const savings = monthlySpend - proCost;
    if (savings > 0) {
      return {
        id: nanoid(),
        tool: "windsurf",
        severity: "warning",
        title: "Windsurf Teams plan charges 2x for features you don't need yet",
        description: `With ${seats} seat${seats > 1 ? "s" : ""}, the Teams plan's management features go unused. Pro gives you identical AI capabilities.`,
        currentCost: monthlySpend,
        recommendedCost: proCost,
        monthlySavings: savings,
        annualSavings: savings * 12,
        action: "Switch to Windsurf Pro",
        alternativePlan: "pro",
        reasoning: [
          `Teams adds usage analytics and team management — valuable at 10+ engineers`,
          `Pro plan: unlimited Flow actions, all model access, priority queuing`,
          `Switching takes 2 minutes and saves $${savings}/month`,
        ],
        confidence: 83,
      };
    }
  }

  return null;
}

// ─── Cross-tool overlap detection ─────────────────────────────────────────────

function detectToolOverlap(tools: ToolSpend[]): Recommendation[] {
  const recs: Recommendation[] = [];
  const toolNames = tools.map((t) => t.tool);

  // Cursor + Copilot overlap
  const hasCursor = toolNames.includes("cursor");
  const hasCopilot = toolNames.includes("github_copilot");

  if (hasCursor && hasCopilot) {
    const cursorTool = tools.find((t) => t.tool === "cursor")!;
    const copilotTool = tools.find((t) => t.tool === "github_copilot")!;
    const combined = cursorTool.monthlySpend + copilotTool.monthlySpend;

    recs.push({
      id: nanoid(),
      tool: "cursor",
      severity: "critical",
      title: "Cursor and GitHub Copilot are doing the same job",
      description: `You're paying for both Cursor ($${cursorTool.monthlySpend}/mo) and GitHub Copilot ($${copilotTool.monthlySpend}/mo). These are direct competitors — pick the one your team actually prefers.`,
      currentCost: combined,
      recommendedCost: Math.max(cursorTool.monthlySpend, copilotTool.monthlySpend),
      monthlySavings: Math.min(cursorTool.monthlySpend, copilotTool.monthlySpend),
      annualSavings: Math.min(cursorTool.monthlySpend, copilotTool.monthlySpend) * 12,
      action: "Consolidate to one coding assistant",
      reasoning: [
        `Both tools offer inline completions, chat, and AI code generation`,
        `Splitting usage reduces effectiveness — engineers commit to one or the other`,
        `Most teams prefer Cursor for its agentic capabilities; Copilot for GitHub-native integration`,
        `Run a 2-week team poll to decide which to keep`,
      ],
      confidence: 95,
    });
  }

  // ChatGPT + Claude overlap (both subscription)
  const hasChatGPT = toolNames.includes("chatgpt");
  const hasClaude = toolNames.includes("claude");

  if (hasChatGPT && hasClaude) {
    const gptTool = tools.find((t) => t.tool === "chatgpt")!;
    const claudeTool = tools.find((t) => t.tool === "claude")!;

    recs.push({
      id: nanoid(),
      tool: "chatgpt",
      severity: "warning",
      title: "Paying for both ChatGPT and Claude subscriptions",
      description: `Your team holds $${gptTool.monthlySpend + claudeTool.monthlySpend}/mo in AI assistant subscriptions. Unless different teams have clear distinct workflows, consolidating saves real money.`,
      currentCost: gptTool.monthlySpend + claudeTool.monthlySpend,
      recommendedCost: Math.max(gptTool.monthlySpend, claudeTool.monthlySpend),
      monthlySavings: Math.min(gptTool.monthlySpend, claudeTool.monthlySpend),
      annualSavings: Math.min(gptTool.monthlySpend, claudeTool.monthlySpend) * 12,
      action: "Consolidate to one general AI assistant",
      reasoning: [
        `Claude excels at: writing, coding, document analysis, longer contexts`,
        `ChatGPT excels at: multimodal tasks, web browsing, plugin ecosystem`,
        `Pick based on your primary workflow and eliminate the other`,
        `Most teams don't need both unless they have genuinely separate use cases`,
      ],
      confidence: 75,
    });
  }

  // Both OpenAI API + ChatGPT (redundant)
  const hasOpenAIAPI = toolNames.includes("openai_api");
  if (hasOpenAIAPI && hasChatGPT) {
    const gptTool = tools.find((t) => t.tool === "chatgpt")!;
    const apiTool = tools.find((t) => t.tool === "openai_api")!;

    if (gptTool.monthlySpend > 0 && apiTool.monthlySpend > 50) {
      recs.push({
        id: nanoid(),
        tool: "chatgpt",
        severity: "info",
        title: "Your OpenAI API usage may make ChatGPT Plus redundant",
        description: `If your team is already integrated with the OpenAI API for production workflows, the ChatGPT subscription may only add the web UI — check if that's worth $${gptTool.monthlySpend}/mo.`,
        currentCost: gptTool.monthlySpend,
        recommendedCost: 0,
        monthlySavings: gptTool.monthlySpend,
        annualSavings: gptTool.monthlySpend * 12,
        action: "Audit ChatGPT Plus usage across the team",
        reasoning: [
          `If engineers are using the API directly, ChatGPT Plus may be for non-technical stakeholders`,
          `Consider whether those users need AI at all, or if a simpler tool suffices`,
          `ChatGPT's Advanced Data Analysis is genuinely useful — verify it's being used`,
        ],
        confidence: 55,
      });
    }
  }

  return recs;
}

// ─── Score calculator ──────────────────────────────────────────────────────────

function calculateEfficiencyScore(
  tools: ToolSpend[],
  teamSize: number,
  recommendations: Recommendation[]
): { efficiency: number; coverage: number; overlap: number; planFit: number } {
  // Overlap: penalize for redundant tools
  const overlapRecs = recommendations.filter((r) => r.title.includes("same job") || r.title.includes("both"));
  const overlapScore = Math.max(0, 100 - overlapRecs.length * 30);

  // Plan fit: penalize for wrong-sized plans
  const criticalRecs = recommendations.filter((r) => r.severity === "critical");
  const planFitScore = Math.max(0, 100 - criticalRecs.length * 25);

  // Coverage: how well tools cover common needs
  const toolNames = new Set<string>(tools.map((t) => t.tool));
  const hasCodingTool = ["cursor", "github_copilot", "windsurf"].some((t) => toolNames.has(t));
  const hasWritingTool = ["claude", "chatgpt", "gemini"].some((t) => toolNames.has(t));
  const coverageScore = (hasCodingTool ? 50 : 0) + (hasWritingTool ? 50 : 0);

  // Efficiency: ratio of savings to current spend
  const totalSpend = tools.reduce((sum, t) => sum + t.monthlySpend, 0);
  const totalSavings = recommendations.reduce((sum, r) => sum + r.monthlySavings, 0);
  const wasteRatio = totalSpend > 0 ? totalSavings / totalSpend : 0;
  const efficiencyScore = Math.round(Math.max(0, 100 - wasteRatio * 100));

  return {
    efficiency: efficiencyScore,
    coverage: coverageScore,
    overlap: overlapScore,
    planFit: planFitScore,
  };
}

// ─── Main audit function ───────────────────────────────────────────────────────

export function runAudit(input: AuditInput): AuditResult {
  const { tools, teamSize, useCase } = input;
  const recommendations: Recommendation[] = [];

  // Per-tool analysis
  for (const tool of tools) {
    if (tool.monthlySpend <= 0) continue;

    let rec: Recommendation | null = null;

    switch (tool.tool) {
      case "cursor":
        rec = auditCursor(tool, teamSize, useCase);
        break;
      case "github_copilot":
        rec = auditGitHubCopilot(tool, teamSize);
        break;
      case "claude":
        rec = auditClaude(tool, teamSize, useCase);
        break;
      case "chatgpt":
        rec = auditChatGPT(tool, teamSize);
        break;
      case "openai_api":
        rec = auditOpenAIAPI(tool, teamSize, useCase);
        break;
      case "anthropic_api":
        rec = auditAnthropicAPI(tool);
        break;
      case "windsurf":
        rec = auditWindsurf(tool, teamSize);
        break;
    }

    if (rec) recommendations.push(rec);
  }

  // Cross-tool overlap analysis
  const overlapRecs = detectToolOverlap(tools);
  recommendations.push(...overlapRecs);

  // Sort by savings (descending)
  recommendations.sort((a, b) => b.annualSavings - a.annualSavings);

  // Calculate totals
  const totalMonthlySpend = tools.reduce((sum, t) => sum + t.monthlySpend, 0);

  // Deduplicate savings (overlapping recs may double-count the same spend)
  const monthlySavings = Math.min(
    recommendations.reduce((sum, r) => sum + r.monthlySavings, 0),
    totalMonthlySpend * 0.9 // cap at 90% savings to stay credible
  );

  const annualSavings = monthlySavings * 12;
  const optimizedMonthlySpend = totalMonthlySpend - monthlySavings;
  const savingsPercentage = totalMonthlySpend > 0
    ? Math.round((monthlySavings / totalMonthlySpend) * 100)
    : 0;

  const scoreBreakdown = calculateEfficiencyScore(tools, teamSize, recommendations);

  // Generate fallback summary
  const summary = generateFallbackSummary(input, monthlySavings, annualSavings, recommendations);

  return {
    id: nanoid(),
    input,
    totalMonthlySpend,
    optimizedMonthlySpend,
    monthlySavings,
    annualSavings,
    savingsPercentage,
    recommendations,
    summary,
    scoreBreakdown,
    createdAt: new Date().toISOString(),
  };
}

function generateFallbackSummary(
  input: AuditInput,
  monthlySavings: number,
  annualSavings: number,
  recommendations: Recommendation[]
): string {
  const { tools, teamSize, useCase } = input;
  const totalSpend = tools.reduce((sum, t) => sum + t.monthlySpend, 0);
  const criticalCount = recommendations.filter((r) => r.severity === "critical").length;

  if (monthlySavings === 0) {
    return `Your AI stack looks reasonably optimized for a ${teamSize}-person team. You're spending $${totalSpend}/month across ${tools.length} tool${tools.length > 1 ? "s" : ""}, which aligns with your ${useCase} workflow. No immediate restructuring needed, but revisit this as your team scales.`;
  }

  if (criticalCount >= 2) {
    return `You have ${criticalCount} critical mismatches in your AI stack. A ${teamSize}-person team at your stage should be spending around $${totalSpend - monthlySavings}/month — you're spending $${totalSpend}/month. The biggest savings come from right-sizing plans that were built for much larger organizations.`;
  }

  return `Your team is overspending by roughly $${monthlySavings}/month — that's $${annualSavings.toLocaleString()} annually. Most of it comes from plan-to-team-size mismatches that are quick to fix. Your ${useCase} workflows are well-covered; the spend just needs tuning.`;
}