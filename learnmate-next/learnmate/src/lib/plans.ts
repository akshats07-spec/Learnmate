// ──────────────────────────────────────────────────────────────
// Subscription plan configuration
// All limits are enforced server-side. These values are also
// used by the pricing UI. Change here to update both.
// ──────────────────────────────────────────────────────────────

export type PlanId = "free" | "starter" | "pro" | "ultra";

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  priceMonthly: number;       // INR, 0 = free
  priceAnnual: number;        // INR per month when billed annually (0 = same as monthly)
  badge?: string;
  color: string;              // Tailwind gradient class key
  limits: {
    uploadsPerMonth: number;  // -1 = unlimited
    pagesPerUpload: number;
    aiQuestionsPerMonth: number;
    visualsPerMonth: number;
    quizzesPerMonth: number;
  };
  features: string[];
  notIncluded?: string[];
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Demo",
    tagline: "Try before you buy",
    priceMonthly: 0,
    priceAnnual: 0,
    color: "slate",
    limits: {
      uploadsPerMonth: 2,
      pagesPerUpload: 5,
      aiQuestionsPerMonth: 10,
      visualsPerMonth: 0,
      quizzesPerMonth: 3,
    },
    features: [
      "2 document uploads / month",
      "Up to 5 pages per upload",
      "10 AI tutor questions / month",
      "3 diagnostic quizzes / month",
      "Basic topic extraction",
      "Demo revision planner",
    ],
    notIncluded: [
      "AI-generated visuals",
      "Progress analytics",
      "Priority processing",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    tagline: "Perfect for individual learners",
    priceMonthly: 500,
    priceAnnual: 400,
    color: "violet",
    limits: {
      uploadsPerMonth: 10,
      pagesPerUpload: 20,
      aiQuestionsPerMonth: 100,
      visualsPerMonth: 10,
      quizzesPerMonth: 30,
    },
    features: [
      "10 document / image uploads / month",
      "Up to 20 pages per upload",
      "100 AI tutor questions / month",
      "10 AI-generated educational visuals / month",
      "30 quizzes / month",
      "Full topic extraction & summaries",
      "Personalized revision planner",
      "Standard processing priority",
    ],
    notIncluded: [
      "Detailed analytics",
      "Priority processing",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For serious students",
    priceMonthly: 1000,
    priceAnnual: 800,
    badge: "Most Popular",
    color: "violet",
    limits: {
      uploadsPerMonth: 50,
      pagesPerUpload: 20,
      aiQuestionsPerMonth: 500,
      visualsPerMonth: 50,
      quizzesPerMonth: -1,
    },
    features: [
      "50 document / image uploads / month",
      "Up to 20 pages per upload",
      "500 AI tutor questions / month",
      "50 AI-generated educational visuals / month",
      "Unlimited quizzes",
      "Advanced topic extraction with diagrams",
      "Targeted practice questions",
      "Personalized adaptive revision plan",
      "Progress analytics & charts",
      "Faster processing priority",
    ],
  },
  {
    id: "ultra",
    name: "Ultra",
    tagline: "Maximum learning power",
    priceMonthly: 1500,
    priceAnnual: 1200,
    color: "mint",
    limits: {
      uploadsPerMonth: -1,
      pagesPerUpload: 20,
      aiQuestionsPerMonth: -1,
      visualsPerMonth: -1,
      quizzesPerMonth: -1,
    },
    features: [
      "Unlimited document / image uploads",
      "Up to 20 pages per upload",
      "Unlimited AI tutor questions",
      "Unlimited AI educational visuals",
      "Unlimited quizzes and practice",
      "Advanced analytics & insights",
      "Downloadable progress reports",
      "Priority processing queue",
      "Early access to new features",
    ],
  },
];

export function getPlan(id: PlanId): Plan {
  return PLANS.find(p => p.id === id) ?? PLANS[0];
}

export function formatPrice(inr: number): string {
  if (inr === 0) return "Free";
  return `₹${inr.toLocaleString("en-IN")}`;
}
