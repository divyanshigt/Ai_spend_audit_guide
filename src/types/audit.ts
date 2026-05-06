export type AITool =
  | "cursor"
  | "github_copilot"
  | "claude"
  | "chatgpt"
  | "anthropic_api"
  | "openai_api"
  | "gemini"
  | "windsurf"
  | "v0"
  | "other";

export type UseCase = "coding" | "writing" | "research" | "data" | "mixed";

export type SeverityLevel = "critical" | "warning" | "info" | "ok";

export interface ToolSpend {
  tool: AITool;
  plan: string;
  monthlySpend: number;
  seats: number;
}

export interface AuditInput {
  tools: ToolSpend[];
  teamSize: number;
  useCase: UseCase;
  companyStage?: "solo" | "seed" | "series_a" | "growth";
}

export interface Recommendation {
  id: string;
  tool: AITool;
  severity: SeverityLevel;
  title: string;
  description: string;
  currentCost: number;
  recommendedCost: number;
  monthlySavings: number;
  annualSavings: number;
  action: string;
  alternativePlan?: string;
  alternativeTool?: string;
  reasoning: string[];
  confidence: number; // 0-100
}

export interface AuditResult {
  id: string;
  input: AuditInput;
  totalMonthlySpend: number;
  optimizedMonthlySpend: number;
  monthlySavings: number;
  annualSavings: number;
  savingsPercentage: number;
  recommendations: Recommendation[];
  summary: string;
  aiSummary?: string;
  scoreBreakdown: {
    efficiency: number; // 0-100
    coverage: number;
    overlap: number;
    planFit: number;
  };
  createdAt: string;
}

export interface LeadCapture {
  email: string;
  company?: string;
  role?: string;
  teamSize?: string;
  auditId: string;
}

export type PricingPlan = {
  name: string;
  monthlyPerSeat: number;
  annualPerSeat?: number;
  features: string[];
  bestFor: string;
};

export type ToolPricing = {
  tool: AITool;
  displayName: string;
  plans: Record<string, PricingPlan>;
  category: "coding" | "writing" | "api" | "general";
};