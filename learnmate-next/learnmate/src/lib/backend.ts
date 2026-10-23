// LearnMate Python FastAPI Backend Client
// Connects the Next.js SaaS frontend to the FastAPI + SQLite backend running on http://localhost:8000

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export interface BackendMaterial {
  id: string;
  title: string;
  num_pages: number;
  created_at: string;
}

export interface BackendExplanation {
  title: string;
  summary: string;
  key_concepts: Array<{
    concept: string;
    explanation: string;
    page_reference: string;
    quote_or_passage: string;
  }>;
  analogies: string[];
}

export async function checkBackendHealth(): Promise<{ online: boolean; model?: string }> {
  try {
    const res = await fetch("/api/py-health", { method: "GET" });
    if (!res.ok) return { online: false };
    const data = await res.json();
    return { online: true, model: data.model };
  } catch {
    return { online: false };
  }
}

export async function uploadPdfToBackend(file: File): Promise<{ material_id: string; title: string; num_pages: number }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/py/upload-pdf", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to upload PDF to backend");
  }

  return res.json();
}

export async function explainWithBackend(materialId: string, concept?: string, language: string = "english"): Promise<BackendExplanation> {
  const res = await fetch("/api/py/explain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ material_id: materialId, concept, language }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to generate explanation");
  }

  return res.json();
}

export async function generateQuizWithBackend(materialId: string, numQuestions: number = 5) {
  const res = await fetch("/api/py/quiz/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ material_id: materialId, num_questions: numQuestions }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to generate quiz");
  }

  return res.json();
}

export async function generateAudioSummaryWithBackend(materialId: string, language: string = "english") {
  const res = await fetch("/api/py/audio-summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ material_id: materialId, language }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to generate audio summary");
  }

  return res.json();
}
