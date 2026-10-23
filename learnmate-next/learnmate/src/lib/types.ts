// ──────────────────────────────────────────────────────────────
// Extended TypeScript types for LearnMate
// Preserves all existing types and adds new ones.
// ──────────────────────────────────────────────────────────────

// ── Existing types (preserved) ────────────────────────────────
export type SourceChunk = { page: number; text: string };

export type Question = {
  id: string;
  topic: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  page: number;
};

export type RevisionTask = {
  id: string;
  title: string;
  topic: string;
  detail: string;
  minutes: number;
  done: boolean;
};

export type LearningState = {
  materialName: string;
  materialText: string;
  pageCount: number;
  topics: { name: string; mastery: number }[];
  questions: Question[];
  attempts: { date: string; score: number; total: number; weakTopics: string[] }[];
  tasks: RevisionTask[];
  lastAnswers: number[] | null;
  explanation?: { text: string; page: number | null; found: boolean };
};

// ── Auth / Profile ─────────────────────────────────────────────
export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  plan_id: string;
  created_at: string;
};

export type OnboardingData = {
  subject: string;
  goal: string;
  study_style: "visual" | "reading" | "practice" | "mixed";
};

// ── Materials ─────────────────────────────────────────────────
export type MaterialStatus = "processing" | "ready" | "failed";

export type StudyMaterial = {
  id: string;
  user_id: string;
  title: string;
  page_count: number;
  extracted_text: string;
  file_type: "pdf" | "image" | "text";
  status: MaterialStatus;
  topic_count: number;
  created_at: string;
  last_studied_at: string | null;
};

// ── Topics ────────────────────────────────────────────────────
export type Topic = {
  id: string;
  material_id: string;
  name: string;
  mastery: number;
  updated_at: string;
};

// ── Quiz ─────────────────────────────────────────────────────
export type QuizAttempt = {
  id: string;
  user_id: string;
  material_id: string;
  score: number;
  total: number;
  answers: number[];
  weak_topics: string[];
  created_at: string;
};

// ── Visuals ──────────────────────────────────────────────────
export type VisualStatus = "pending" | "generating" | "ready" | "failed";

export type EducationalVisual = {
  id: string;
  material_id: string;
  topic_id: string | null;
  topic_name: string;
  prompt: string;
  image_url: string | null;
  explanation: string | null;
  status: VisualStatus;
  created_at: string;
};

// ── Subscription ─────────────────────────────────────────────
export type SubscriptionStatus = "active" | "past_due" | "cancelled" | "trialing";

export type Subscription = {
  id: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  razorpay_subscription_id: string | null;
  created_at: string;
};

// ── AI Tutor response ────────────────────────────────────────
export type TutorResponse = {
  answer: string;
  found: boolean;
  page: number | null;
  evidence: string;
  nextStep: string;
};

// ── API helpers ──────────────────────────────────────────────
export type ApiError = { error: string; code?: string };
export type UploadResult = {
  id: string;
  name: string;
  text: string;
  pageCount: number;
  topicsGenerated: boolean;
};
