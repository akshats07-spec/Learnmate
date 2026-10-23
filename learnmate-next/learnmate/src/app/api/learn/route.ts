import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { demoQuestions, buildTasks } from "@/lib/demo";
import type { Question } from "@/lib/types";

export const runtime = "nodejs";

const Body = z.object({
  action: z.enum(["explain", "quiz", "practice", "revise"]),
  text: z.string().min(1).max(120000),
  question: z.string().optional(),
  weakTopics: z.array(z.string()).optional(),
  answers: z.array(z.number()).optional(),
});

function isGreetingOrSmallTalk(q: string): boolean {
  if (!q) return false;
  const clean = q.trim().toLowerCase().replace(/[^a-z0-9\s]/g, "");
  const greetings = [
    "hello",
    "hi",
    "hey",
    "how are you",
    "how r u",
    "who are you",
    "who r u",
    "what are you",
    "what can you do",
    "help",
    "good morning",
    "good afternoon",
    "good evening",
    "whats up",
    "what's up",
    "sup",
    "hiya",
    "how do you do",
    "tell me about yourself",
    "are you an ai",
    "are you ai",
    "thank you",
    "thanks",
  ];
  if (greetings.includes(clean)) return true;
  return greetings.some((g) => clean.startsWith(g + " ") || clean.endsWith(" " + g));
}

async function askGemini(prompt: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const genAI = new GoogleGenerativeAI(apiKey);
  const configuredModel = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

  // Ordered candidate models with deduplication
  const candidates = Array.from(
    new Set([configuredModel, "gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.5-flash"])
  );

  for (const modelName of candidates) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (text && text.trim().length > 0) {
        return text;
      }
    } catch (err: any) {
      console.warn(`Gemini model ${modelName} call failed:`, err?.status || err?.message);
      // Continue to next candidate
    }
  }

  return null;
}

function parseJson<T>(value: string): T {
  const cleaned = value
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/, "")
    .replace(/\s*```$/, "")
    .trim();
  return JSON.parse(cleaned) as T;
}

export async function POST(req: NextRequest) {
  try {
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request. Please check your material and try again." },
        { status: 400 }
      );
    }

    const { action, text, question = "", weakTopics = [] } = parsed.data;

    // Handle Greetings & Conversational Questions
    if (action === "explain" && isGreetingOrSmallTalk(question)) {
      return NextResponse.json({
        result: {
          answer:
            "Hello! I am your LearnMate AI Tutor. I'm doing great and ready to help you study! You can ask me to explain any topic from your uploaded materials, quiz your understanding, or break down difficult concepts with clear examples. What would you like to explore today?",
          found: true,
          page: null,
          evidence: "",
          nextStep: "Ask a question about your uploaded document or pick a topic from the sidebar.",
        },
        mode: "conversational",
      });
    }

    const context = `Treat the following uploaded study material as the primary source of factual claims. Cite page numbers if labeled.\n\nMATERIAL:\n${text.slice(0, 35000)}`;

    if (action === "explain") {
      const prompt =
        `You are a friendly, encouraging, and highly knowledgeable AI Study Tutor.\n` +
        `The student has provided the following study material:\n` +
        `=== MATERIAL START ===\n${text.slice(0, 35000)}\n=== MATERIAL END ===\n\n` +
        `Student question: "${question || "Summarise the main concepts simply."}"\n\n` +
        `Guidelines:\n` +
        `1. If the student asks a greeting ("hello", "how are you", "who are you") or conversational question, answer warmly as a supportive AI tutor. Set "found": true.\n` +
        `2. If the question relates to the material, provide a crystal-clear, structured explanation using an intuitive analogy. Set "found": true.\n` +
        `3. Only set "found": false if the question asks for a specific fact that is completely contradicted or not present anywhere in the context.\n\n` +
        `Return JSON ONLY:\n` +
        `{\n` +
        `  "answer": "Clear, friendly, and comprehensive explanation",\n` +
        `  "found": true,\n` +
        `  "page": 1,\n` +
        `  "evidence": "Short relevant quote or phrase from material",\n` +
        `  "nextStep": "A helpful follow-up question to test their understanding"\n` +
        `}`;

      const response = await askGemini(prompt);
      if (response) {
        try {
          const parsedRes = parseJson<any>(response);
          return NextResponse.json({ result: parsedRes, mode: "gemini" });
        } catch (e) {
          console.warn("Could not parse Gemini JSON response, extracting text:", e);
          return NextResponse.json({
            result: {
              answer: response.replace(/```json|```/g, "").trim(),
              found: true,
              page: 1,
              evidence: "",
              nextStep: "Would you like me to elaborate further on this concept?",
            },
            mode: "gemini",
          });
        }
      }

      // Smart fallback if AI response unavailable
      const words = question.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
      const foundInDoc = words.some((w) => text.toLowerCase().includes(w));

      return NextResponse.json({
        result: {
          answer: foundInDoc
            ? `Based on your material, here is a summary of the core concepts related to "${question}": The document outlines key structural interactions and operational steps. Focus on the core relationships and primary mechanisms highlighted in this section.`
            : `I reviewed your document for "${question}". This specific term was not explicitly found in the uploaded text, but you can explore the main section topics listed in your study library.`,
          found: foundInDoc,
          page: foundInDoc ? 1 : null,
          evidence: "",
          nextStep: "Try asking about one of the specific subheadings or key terms from your notes.",
        },
        mode: "local-fallback",
      });
    }

    if (action === "quiz") {
      const prompt =
        `${context}\nCreate exactly 5 multiple-choice diagnostic questions across distinct important topics from the material. ` +
        `Each question must have 4 options and one correct answer. Return JSON only as:\n` +
        `{"questions":[{"id":"q1","topic":"short topic","prompt":"question","options":["A","B","C","D"],"correctIndex":0,"explanation":"brief evidence-based explanation","page":1}]}`;

      const response = await askGemini(prompt);
      if (response) {
        try {
          return NextResponse.json({
            questions: parseJson<{ questions: Question[] }>(response).questions,
            mode: "gemini",
          });
        } catch {}
      }
      return NextResponse.json({ questions: demoQuestions, mode: "demo" });
    }

    if (action === "practice") {
      const prompt =
        `${context}\nThe student's weak topics are: ${weakTopics.join(", ") || "general review"}. ` +
        `Create 3 new multiple-choice questions targeting these weak topics. Return JSON only as:\n` +
        `{"questions":[{"id":"p1","topic":"topic","prompt":"question","options":["A","B","C","D"],"correctIndex":0,"explanation":"short explanation","page":1}]}`;

      const response = await askGemini(prompt);
      if (response) {
        try {
          return NextResponse.json({
            questions: parseJson<{ questions: Question[] }>(response).questions,
            mode: "gemini",
          });
        } catch {}
      }
      const questions = demoQuestions.filter((q) => weakTopics.includes(q.topic));
      return NextResponse.json({
        questions: (questions.length ? questions : demoQuestions).slice(0, 3),
        mode: "demo",
      });
    }

    // Revision Plan
    const prompt =
      `${context}\nBuild a practical 3-day revision plan for weak topics: ${weakTopics.join(", ") || "general review"}. ` +
      `Return JSON only as: {"summary":"one sentence","days":[{"day":1,"title":"...","tasks":[{"topic":"...","title":"...","detail":"...","minutes":5}]}]}`;

    const response = await askGemini(prompt);
    if (response) {
      try {
        return NextResponse.json({ plan: parseJson(response), mode: "gemini" });
      } catch {}
    }

    return NextResponse.json({
      plan: {
        summary: "Start with your least secure topics, then check retention with targeted practice.",
        days: buildTasks(weakTopics).map((t, i) => ({
          day: Math.floor(i / 2) + 1,
          title: `Day ${Math.floor(i / 2) + 1}`,
          tasks: [{ topic: t.topic, title: t.title, detail: t.detail, minutes: t.minutes }],
        })),
      },
      mode: "demo",
    });
  } catch (error) {
    console.error("LearnMate API error:", error);
    return NextResponse.json(
      {
        result: {
          answer:
            "I'm here to help! Could you please rephrase or ask another question about your study material?",
          found: true,
          page: null,
          evidence: "",
          nextStep: "Ask a question about key concepts or definitions in your document.",
        },
      },
      { status: 200 }
    );
  }
}
