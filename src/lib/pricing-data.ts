import type { ToolPricing } from "@/types/audit";

export const TOOL_PRICING: Record<string, ToolPricing> = {
  cursor: {
    tool: "cursor",
    displayName: "Cursor",
    category: "coding",
    plans: {
      free: {
        name: "Free",
        monthlyPerSeat: 0,
        features: ["2000 completions/month", "50 slow requests", "Community support"],
        bestFor: "Individuals evaluating",
      },
      pro: {
        name: "Pro",
        monthlyPerSeat: 20,
        annualPerSeat: 16,
        features: ["Unlimited completions", "500 fast requests", "Priority support", "Advanced models"],
        bestFor: "Solo developers",
      },
      business: {
        name: "Business",
        monthlyPerSeat: 40,
        annualPerSeat: 32,
        features: ["Everything in Pro", "SSO", "Admin controls", "Usage analytics", "Invoice billing"],
        bestFor: "Teams of 10+",
      },
    },
  },
  github_copilot: {
    tool: "github_copilot",
    displayName: "GitHub Copilot",
    category: "coding",
    plans: {
      free: {
        name: "Free",
        monthlyPerSeat: 0,
        features: ["2000 completions/month", "50 chat messages"],
        bestFor: "Casual use",
      },
      individual: {
        name: "Individual",
        monthlyPerSeat: 10,
        annualPerSeat: 100,
        features: ["Unlimited completions", "Unlimited chat", "IDE extensions"],
        bestFor: "Solo developers",
      },
      business: {
        name: "Business",
        monthlyPerSeat: 19,
        features: ["Everything in Individual", "Organization-wide policy", "Audit logs"],
        bestFor: "Teams",
      },
      enterprise: {
        name: "Enterprise",
        monthlyPerSeat: 39,
        features: ["Everything in Business", "Fine-tuning", "Custom models", "Priority support"],
        bestFor: "Large orgs",
      },
    },
  },
  claude: {
    tool: "claude",
    displayName: "Claude (claude.ai)",
    category: "writing",
    plans: {
      free: {
        name: "Free",
        monthlyPerSeat: 0,
        features: ["Limited messages", "Claude 3.5 Sonnet access"],
        bestFor: "Occasional use",
      },
      pro: {
        name: "Pro",
        monthlyPerSeat: 20,
        features: ["5x more usage", "Priority bandwidth", "Early access features", "Claude 3 Opus"],
        bestFor: "Power users",
      },
      team: {
        name: "Team",
        monthlyPerSeat: 30,
        features: ["Everything in Pro", "Admin console", "Usage analytics", "SSO", "Expanded context"],
        bestFor: "Teams of 5+",
      },
    },
  },
  chatgpt: {
    tool: "chatgpt",
    displayName: "ChatGPT",
    category: "general",
    plans: {
      free: {
        name: "Free",
        monthlyPerSeat: 0,
        features: ["GPT-3.5", "Limited GPT-4o", "Basic features"],
        bestFor: "Casual exploration",
      },
      plus: {
        name: "Plus",
        monthlyPerSeat: 20,
        features: ["GPT-4o", "Advanced data analysis", "DALL·E 3", "Browse", "Custom GPTs"],
        bestFor: "Individual power users",
      },
      team: {
        name: "Team",
        monthlyPerSeat: 30,
        features: ["Everything in Plus", "Admin console", "No data training", "Higher limits"],
        bestFor: "Small teams",
      },
      enterprise: {
        name: "Enterprise",
        monthlyPerSeat: 60, // estimated
        features: ["Everything in Team", "Custom contracts", "SSO", "Advanced security"],
        bestFor: "Large enterprises",
      },
    },
  },
  anthropic_api: {
    tool: "anthropic_api",
    displayName: "Anthropic API",
    category: "api",
    plans: {
      pay_as_you_go: {
        name: "Pay As You Go",
        monthlyPerSeat: 0, // usage-based
        features: ["Claude 3.5 Sonnet: $3/MTok in, $15/MTok out", "Claude 3 Haiku: $0.25/MTok in, $1.25/MTok out", "Claude 3 Opus: $15/MTok in, $75/MTok out"],
        bestFor: "Variable workloads",
      },
      committed: {
        name: "Committed Use",
        monthlyPerSeat: 0,
        features: ["Up to 25% discount", "Reserved capacity", "Dedicated support"],
        bestFor: "High-volume production",
      },
    },
  },
  openai_api: {
    tool: "openai_api",
    displayName: "OpenAI API",
    category: "api",
    plans: {
      pay_as_you_go: {
        name: "Pay As You Go",
        monthlyPerSeat: 0,
        features: ["GPT-4o: $5/MTok in, $15/MTok out", "GPT-4o mini: $0.15/MTok in, $0.60/MTok out", "GPT-3.5 Turbo: $0.50/MTok in, $1.50/MTok out"],
        bestFor: "Variable workloads",
      },
      prepay: {
        name: "Prepaid Credits",
        monthlyPerSeat: 0,
        features: ["No discount but immediate access", "Spend controls"],
        bestFor: "Budget management",
      },
    },
  },
  gemini: {
    tool: "gemini",
    displayName: "Google Gemini",
    category: "general",
    plans: {
      free: {
        name: "Free",
        monthlyPerSeat: 0,
        features: ["Gemini 1.5 Flash", "Basic features", "15 RPM limit"],
        bestFor: "Evaluation",
      },
      advanced: {
        name: "Gemini Advanced",
        monthlyPerSeat: 20,
        features: ["Gemini Ultra 1.0", "1M context window", "Google One 2TB storage included"],
        bestFor: "Power users needing large context",
      },
    },
  },
  windsurf: {
    tool: "windsurf",
    displayName: "Windsurf",
    category: "coding",
    plans: {
      free: {
        name: "Free",
        monthlyPerSeat: 0,
        features: ["5 user prompt credits/day", "Basic completions"],
        bestFor: "Trying it out",
      },
      pro: {
        name: "Pro",
        monthlyPerSeat: 15,
        features: ["Unlimited Flow", "Advanced models", "Priority access"],
        bestFor: "Individual developers",
      },
      teams: {
        name: "Teams",
        monthlyPerSeat: 35,
        features: ["Everything in Pro", "Team management", "Usage analytics"],
        bestFor: "Development teams",
      },
    },
  },
  v0: {
    tool: "v0",
    displayName: "v0 by Vercel",
    category: "coding",
    plans: {
      free: {
        name: "Free",
        monthlyPerSeat: 0,
        features: ["200 credits/month", "Basic generations"],
        bestFor: "Occasional UI prototyping",
      },
      premium: {
        name: "Premium",
        monthlyPerSeat: 20,
        features: ["5000 credits/month", "Priority generation", "Advanced models"],
        bestFor: "Regular UI work",
      },
    },
  },
};

export const TOOL_DISPLAY_NAMES: Record<string, string> = Object.fromEntries(
  Object.entries(TOOL_PRICING).map(([key, val]) => [key, val.displayName])
);

// Thresholds for recommendations (seats × price triggers)
export const EFFICIENCY_THRESHOLDS = {
  cursor: {
    businessJustified: 8, // Business plan only worth it at 8+ seats
    proVsFreeBreakeven: 3, // Pro justified at 3+ hours saved/week
  },
  github_copilot: {
    businessVsIndividual: 5, // Business only worth it at 5+ seats for admin features
  },
  claude: {
    teamVsPro: 5,
    proJustified: 2, // Pro over free at 2+ heavy usage days/week
  },
  chatgpt: {
    teamVsPlus: 4,
    enterpriseVsTeam: 25,
  },
};