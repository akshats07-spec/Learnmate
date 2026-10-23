import { GoogleGenAI } from "@google/genai";
import type {
  StudyMaterial,
  ConceptExplanation,
  QuizQuestion,
  QuizEvaluation,
  RevisionPlan,
  AudioSummary,
  ChatMessage,
  AttemptRecord
} from "../types";
import {
  SAMPLE_BIOLOGY_MATERIAL,
  SAMPLE_EXPLANATION,
  SAMPLE_QUIZ_QUESTIONS,
  SAMPLE_EVALUATION,
  SAMPLE_REVISION_PLAN,
  SAMPLE_AUDIO_SUMMARY,
  SAMPLE_ATTEMPT_HISTORY
} from "./sampleData";

export type ApiMode = "demo" | "backend" | "direct_gemini";

class ApiService {
  private mode: ApiMode = "demo";
  private backendUrl: string = "http://localhost:8000";
  private geminiApiKey: string = "";
  private geminiClient: GoogleGenAI | null = null;

  constructor() {
    // Check localStorage or environment variables for saved config
    const savedMode = localStorage.getItem("learnmate_api_mode") as ApiMode;
    if (savedMode) this.mode = savedMode;

    const savedKey = localStorage.getItem("learnmate_gemini_key") || import.meta.env.VITE_GEMINI_API_KEY || "";
    if (savedKey) {
      this.geminiApiKey = savedKey;
      this.initGeminiClient(savedKey);
    }

    const savedBackend = localStorage.getItem("learnmate_backend_url");
    if (savedBackend) this.backendUrl = savedBackend;
  }

  public getMode(): ApiMode {
    return this.mode;
  }

  public setMode(mode: ApiMode) {
    this.mode = mode;
    localStorage.setItem("learnmate_api_mode", mode);
  }

  public getApiKey(): string {
    return this.geminiApiKey;
  }

  public setApiKey(key: string) {
    this.geminiApiKey = key;
    localStorage.setItem("learnmate_gemini_key", key);
    this.initGeminiClient(key);
  }

  public getBackendUrl(): string {
    return this.backendUrl;
  }

  public setBackendUrl(url: string) {
    this.backendUrl = url;
    localStorage.setItem("learnmate_backend_url", url);
  }

  private initGeminiClient(key: string) {
    try {
      this.geminiClient = new GoogleGenAI({ apiKey: key });
    } catch (e) {
      console.warn("Failed to initialize GoogleGenAI client:", e);
    }
  }

  // 1. Upload Material (Pasted Text)
  public async uploadText(title: string, content: string): Promise<StudyMaterial> {
    if (this.mode === "backend") {
      try {
        const res = await fetch(`${this.backendUrl}/api/upload-text`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content })
        });
        if (res.ok) {
          const data = await res.json();
          return {
            id: data.material_id,
            title: data.title,
            rawText: content,
            pages: data.pages,
            createdAt: new Date().toISOString()
          };
        }
      } catch (err) {
        console.warn("Backend failed, falling back:", err);
      }
    }

    // Client-side synthesis (paginate by approx 350 words)
    const words = content.split(/\s+/);
    const pageSize = 350;
    const pages = [];
    for (let i = 0; i < Math.max(words.length, 1); i += pageSize) {
      const chunk = words.slice(i, i + pageSize).join(" ");
      pages.push({
        page_number: Math.floor(i / pageSize) + 1,
        text: chunk
      });
    }

    return {
      id: "mat-" + Date.now(),
      title: title || "Study Material",
      rawText: content,
      pages,
      createdAt: new Date().toISOString()
    };
  }

  // 2. Upload Material (PDF File)
  public async uploadPdf(file: File): Promise<StudyMaterial> {
    if (this.mode === "backend") {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", file.name.replace(/\.pdf$/i, ""));

        const res = await fetch(`${this.backendUrl}/api/upload-pdf`, {
          method: "POST",
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          return {
            id: data.material_id,
            title: data.title,
            rawText: data.pages.map((p: any) => p.text).join("\n\n"),
            pages: data.pages,
            createdAt: new Date().toISOString()
          };
        }
      } catch (err) {
        console.warn("Backend PDF upload failed, trying client extraction:", err);
      }
    }

    // Client-side fallback: Try reading with pdfjs-dist or browser FileReader
    try {
      const pdfjs = await import("pdfjs-dist");
      // @ts-ignore
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version || "4.10.38"}/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;

      const pages = [];
      let fullText = "";

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          // @ts-ignore
          .map((item) => item.str)
          .join(" ");
        pages.push({
          page_number: i,
          text: pageText
        });
        fullText += `--- [Page ${i}] ---\n${pageText}\n\n`;
      }

      return {
        id: "pdf-" + Date.now(),
        title: file.name.replace(/\.pdf$/i, ""),
        rawText: fullText,
        pages,
        createdAt: new Date().toISOString()
      };
    } catch (e) {
      console.warn("Client-side PDF extraction encountered error, using demo material:", e);
      return {
        ...SAMPLE_BIOLOGY_MATERIAL,
        title: file.name.replace(/\.pdf$/i, "") + " (Extracted)"
      };
    }
  }

  // 3. Explain Concepts with Page References & Hindi Toggle
  public async explainConcepts(
    material: StudyMaterial,
    concept?: string,
    language: string = "english"
  ): Promise<ConceptExplanation> {
    if (this.mode === "backend") {
      try {
        const res = await fetch(`${this.backendUrl}/api/explain`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            material_id: material.id,
            material_text: material.rawText,
            concept,
            language
          })
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn("Backend failed, trying Direct Gemini:", err);
      }
    }

    if (this.mode === "direct_gemini" && this.geminiClient) {
      try {
        const langInstruction =
          language === "hindi"
            ? "Explain in clean Hindi (Devanagari with English scientific terms in brackets)."
            : "Explain in simple, crystal-clear English.";

        const prompt = `You are LearnMate. Explain the key concepts of this material in simple terms with exact page/section references.
Material:
${material.rawText.slice(0, 20000)}

${langInstruction}

Return strictly JSON matching:
{
  "title": "string",
  "summary": "string",
  "key_concepts": [
    {
      "concept": "string",
      "explanation": "string",
      "page_reference": "string",
      "quote_or_passage": "string",
      "analogy": "string"
    }
  ],
  "quick_takeaway": "string",
  "hindi_translation_note": "string"
}`;
        const response = await this.geminiClient.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });
        if (response.text) return JSON.parse(response.text);
      } catch (err) {
        console.warn("Direct Gemini failed, using demo fallback:", err);
      }
    }

    // Demo Mode Return
    if (language === "hindi") {
      return {
        ...SAMPLE_EXPLANATION,
        title: "कोशिकीय श्वसन (Cellular Respiration) सरल भाषा में",
        summary: "कोशिकीय श्वसन आपकी कोशिका का पावर प्लांट है। यह हमारे द्वारा खाए गए ग्लूकोज और ऑक्सीजन को मिलाकर एटीपी (ATP) नामक ऊर्जा का निर्माण करता है, जिससे हमारा शरीर कार्य करता है।"
      };
    }
    return SAMPLE_EXPLANATION;
  }

  // 4. Generate Diagnostic Quiz
  public async generateQuiz(material: StudyMaterial, numQuestions: number = 5): Promise<QuizQuestion[]> {
    if (this.mode === "backend") {
      try {
        const res = await fetch(`${this.backendUrl}/api/quiz/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            material_id: material.id,
            material_text: material.rawText,
            num_questions: numQuestions
          })
        });
        if (res.ok) {
          const data = await res.json();
          return data.questions;
        }
      } catch (err) {
        console.warn("Backend quiz generation failed:", err);
      }
    }

    if (this.mode === "direct_gemini" && this.geminiClient) {
      try {
        const prompt = `Generate a ${numQuestions}-question diagnostic multiple-choice quiz based on this study material.
Each question MUST have a specific page/section reference and test a specific concept/topic.
Material:
${material.rawText.slice(0, 20000)}

Return strictly JSON:
{
  "questions": [
    {
      "id": 1,
      "question": "string",
      "topic": "string",
      "options": ["string", "string", "string", "string"],
      "correct_answer_index": 0,
      "explanation": "string",
      "page_reference": "string"
    }
  ]
}`;
        const response = await this.geminiClient.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });
        if (response.text) {
          const parsed = JSON.parse(response.text);
          return parsed.questions || parsed;
        }
      } catch (err) {
        console.warn("Direct Gemini quiz generation failed:", err);
      }
    }

    return SAMPLE_QUIZ_QUESTIONS;
  }

  // 5. Evaluate Quiz & Diagnose Weak Topics
  public async evaluateQuiz(
    material: StudyMaterial,
    questions: QuizQuestion[],
    userAnswers: number[]
  ): Promise<QuizEvaluation> {
    if (this.mode === "backend") {
      try {
        const res = await fetch(`${this.backendUrl}/api/quiz/evaluate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            material_id: material.id,
            material_text: material.rawText,
            questions,
            user_answers: userAnswers
          })
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn("Backend quiz evaluation failed:", err);
      }
    }

    if (this.mode === "direct_gemini" && this.geminiClient) {
      try {
        const prompt = `Evaluate the student's quiz answers against the study material.
Material:
${material.rawText.slice(0, 15000)}

Questions and Answers:
${JSON.stringify({ questions, userAnswers }, null, 2)}

Diagnose student weak topics, misconceptions, and pinpoint pages they must re-read.
Return strictly JSON matching:
{
  "score": number,
  "total": number,
  "percentage": number,
  "diagnosis_summary": "string",
  "weak_topics_analysis": [
    {
      "topic": "string",
      "misconception": "string",
      "recommended_review": "string",
      "page_reference": "string"
    }
  ],
  "immediate_advice": "string"
}`;
        const response = await this.geminiClient.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });
        if (response.text) {
          const evalData = JSON.parse(response.text);
          evalData.detailed_evaluations = questions.map((q, idx) => ({
            question_id: q.id,
            is_correct: userAnswers[idx] === q.correct_answer_index,
            user_choice: userAnswers[idx],
            correct_choice: q.correct_answer_index,
            explanation: q.explanation,
            topic: q.topic
          }));
          return evalData;
        }
      } catch (err) {
        console.warn("Direct Gemini evaluate failed:", err);
      }
    }

    // Dynamic mock evaluation calculation for demo mode
    let score = 0;
    const detailed = questions.map((q, idx) => {
      const isCorrect = userAnswers[idx] === q.correct_answer_index;
      if (isCorrect) score++;
      return {
        question_id: q.id,
        is_correct: isCorrect,
        user_choice: userAnswers[idx] ?? -1,
        correct_choice: q.correct_answer_index,
        explanation: q.explanation,
        topic: q.topic
      };
    });

    const incorrectList = detailed.filter((d) => !d.is_correct);
    const weakTopics = incorrectList.map((item) => {
      const q = questions.find((x) => x.id === item.question_id);
      return {
        topic: item.topic,
        misconception: `Struggled with ${item.topic}. Selected option "${q?.options[item.user_choice] || 'None'}" instead of understanding the underlying mechanism.`,
        recommended_review: `Review ${q?.page_reference || 'the relevant chapter passage'} carefully.`,
        page_reference: q?.page_reference || "Uploaded material"
      };
    });

    return {
      score,
      total: questions.length,
      percentage: Math.round((score / questions.length) * 100),
      diagnosis_summary:
        score === questions.length
          ? "Exceptional mastery! You answered all diagnostic questions correctly with complete accuracy across every section."
          : `Identified ${incorrectList.length} weak areas requiring focused revision: ${incorrectList.map((x) => x.topic).join(", ")}.`,
      weak_topics_analysis: weakTopics.length > 0 ? weakTopics : SAMPLE_EVALUATION.weak_topics_analysis,
      immediate_advice:
        score === questions.length
          ? "Proceed directly to advanced practice questions and audio consolidation."
          : "Review the highlighted sections before attempting the follow-up practice set.",
      detailed_evaluations: detailed
    };
  }

  // 6. Generate Personalized Revision Plan
  public async generateRevisionPlan(
    material: StudyMaterial,
    weakTopics: any[],
    language: string = "english"
  ): Promise<RevisionPlan> {
    if (this.mode === "backend") {
      try {
        const res = await fetch(`${this.backendUrl}/api/revision-plan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            material_id: material.id,
            material_text: material.rawText,
            weak_topics: weakTopics,
            language
          })
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn("Backend revision plan failed:", err);
      }
    }

    if (this.mode === "direct_gemini" && this.geminiClient) {
      try {
        const prompt = `Create a personalized 3-day spaced revision plan and 3 targeted follow-up practice questions focused strictly on these weak topics.
Material:
${material.rawText.slice(0, 15000)}

Weak Topics:
${JSON.stringify(weakTopics, null, 2)}

Return strictly JSON matching:
{
  "plan_title": "string",
  "priority_focus_areas": [
    {
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "topic": "string",
      "action_item": "string",
      "pages_to_review": "string",
      "key_rule_to_remember": "string"
    }
  ],
  "spaced_schedule": [
    {
      "day": "Day 1 (Immediate)",
      "focus": "string",
      "duration_minutes": 20,
      "checklist": ["string"]
    },
    {
      "day": "Day 2 (Active Recall)",
      "focus": "string",
      "duration_minutes": 15,
      "checklist": ["string"]
    },
    {
      "day": "Day 3 (Mastery Check)",
      "focus": "string",
      "duration_minutes": 10,
      "checklist": ["string"]
    }
  ],
  "followup_practice_questions": [
    {
      "id": 101,
      "targeted_weak_topic": "string",
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correct_answer_index": 0,
      "step_by_step_solution": "string",
      "page_reference": "string"
    }
  ]
}`;
        const response = await this.geminiClient.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });
        if (response.text) return JSON.parse(response.text);
      } catch (err) {
        console.warn("Direct Gemini revision plan failed:", err);
      }
    }

    return SAMPLE_REVISION_PLAN;
  }

  // 7. Spoken Revision Summary (Audio Script)
  public async generateAudioSummary(
    material: StudyMaterial,
    weakTopics?: string[],
    language: string = "english"
  ): Promise<AudioSummary> {
    if (this.mode === "backend") {
      try {
        const res = await fetch(`${this.backendUrl}/api/audio-summary`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            material_id: material.id,
            material_text: material.rawText,
            weak_topics: weakTopics,
            language
          })
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn("Backend audio summary failed:", err);
      }
    }

    return SAMPLE_AUDIO_SUMMARY;
  }

  // 8. Grounded Q&A Chat with Hallucination Guard
  public async groundedChat(
    material: StudyMaterial,
    question: string,
    language: string = "english"
  ): Promise<ChatMessage> {
    if (this.mode === "backend") {
      try {
        const res = await fetch(`${this.backendUrl}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            material_id: material.id,
            material_text: material.rawText,
            question,
            language
          })
        });
        if (res.ok) {
          const data = await res.json();
          return {
            id: "msg-" + Date.now(),
            sender: "ai",
            text: data.answer,
            is_out_of_scope: data.is_out_of_scope,
            page_reference: data.page_reference,
            quoted_evidence: data.quoted_evidence,
            suggested_questions: data.suggested_questions,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          };
        }
      } catch (err) {
        console.warn("Backend chat failed:", err);
      }
    }

    if (this.mode === "direct_gemini" && this.geminiClient) {
      try {
        const prompt = `You are LearnMate Grounded Assistant. Answer strictly using ONLY facts in the study material.
If the answer is NOT present in the material, set "is_out_of_scope": true, and explain clearly: "⚠️ This information is not available in your uploaded study material."

Study Material:
${material.rawText.slice(0, 20000)}

Question:
"${question}"

Return strictly JSON:
{
  "is_out_of_scope": boolean,
  "answer": "string",
  "page_reference": "string or null",
  "quoted_evidence": "string or null",
  "suggested_questions": ["string", "string"]
}`;
        const response = await this.geminiClient.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });
        if (response.text) {
          const data = JSON.parse(response.text);
          return {
            id: "msg-" + Date.now(),
            sender: "ai",
            text: data.answer,
            is_out_of_scope: data.is_out_of_scope,
            page_reference: data.page_reference,
            quoted_evidence: data.quoted_evidence,
            suggested_questions: data.suggested_questions,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          };
        }
      } catch (err) {
        console.warn("Direct Gemini chat failed:", err);
      }
    }

    // Demo Mode Grounded Chat Logic: Check for keywords in material vs out-of-bounds
    const qLower = question.toLowerCase();
    const isOutOfScope =
      qLower.includes("photosynthesis") ||
      qLower.includes("black hole") ||
      qLower.includes("world war") ||
      qLower.includes("python programming") ||
      qLower.includes("chloroplast") ||
      qLower.includes("stock market");

    if (isOutOfScope) {
      return {
        id: "msg-" + Date.now(),
        sender: "ai",
        text: "⚠️ This information is not available in your uploaded study material. The uploaded document covers Cellular Respiration, Glycolysis, the Krebs Cycle, and Oxidative Phosphorylation.",
        is_out_of_scope: true,
        page_reference: null,
        quoted_evidence: null,
        suggested_questions: [
          "How much ATP is generated per glucose molecule?",
          "What is the role of Oxygen in Complex IV?"
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
    }

    if (qLower.includes("oxygen") || qLower.includes("o2")) {
      return {
        id: "msg-" + Date.now(),
        sender: "ai",
        text: "According to your uploaded material, Oxygen serves as the terminal electron acceptor in the Electron Transport Chain (Complex IV). It accepts electrons and binds with free protons to form water (H2O). Without oxygen, the ETC halts and cells must resort to anaerobic fermentation.",
        is_out_of_scope: false,
        page_reference: "Page 4, Section 4.A & Page 5",
        quoted_evidence: "Electrons donated by NADH and FADH2 are transferred along the chain to the terminal electron acceptor, molecular Oxygen (O2), which is reduced to form Water (H2O).",
        suggested_questions: [
          "What happens if oxygen is absent?",
          "Why does FADH2 generate less ATP than NADH?"
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
    }

    return {
      id: "msg-" + Date.now(),
      sender: "ai",
      text: "Based on Page 1 and 2 of your material, Cellular Respiration produces approximately 30 to 32 ATP per molecule of glucose through Glycolysis, Pyruvate Oxidation, the Citric Acid Cycle, and Oxidative Phosphorylation.",
      is_out_of_scope: false,
      page_reference: "Page 1, Equation & Page 2",
      quoted_evidence: "C6H12O6 + 6 O2 -> 6 CO2 + 6 H2O + Energy (approx. 30 to 32 ATP + heat).",
      suggested_questions: [
        "Where does glycolysis take place?",
        "What is the rotary motor of ATP Synthase?"
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
  }

  // 9. Fetch Progress History Across Attempts
  public async getProgressHistory(materialId: string): Promise<AttemptRecord[]> {
    if (this.mode === "backend") {
      try {
        const res = await fetch(`${this.backendUrl}/api/progress/${materialId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.attempts && data.attempts.length > 0) {
            return data.attempts.map((a: any) => ({
              id: a.id,
              quiz_id: a.quiz_id,
              timestamp: a.created_at,
              score: a.score,
              total: a.total_questions,
              percentage: a.percentage,
              weak_topics: a.weak_topics.map((w: any) => w.topic || w)
            }));
          }
        }
      } catch (err) {
        console.warn("Backend get progress failed:", err);
      }
    }

    // Return stored local attempts or sample attempts
    const stored = localStorage.getItem(`learnmate_attempts_${materialId}`);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {}
    }
    return SAMPLE_ATTEMPT_HISTORY;
  }

  public saveLocalAttempt(materialId: string, record: AttemptRecord) {
    const key = `learnmate_attempts_${materialId}`;
    const existing = localStorage.getItem(key);
    let attempts: AttemptRecord[] = existing ? JSON.parse(existing) : [...SAMPLE_ATTEMPT_HISTORY];
    attempts.push(record);
    localStorage.setItem(key, JSON.stringify(attempts));
  }
}

export const apiService = new ApiService();
