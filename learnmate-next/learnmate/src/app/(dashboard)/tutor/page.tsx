"use client";
import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Brain,
  Send,
  User,
  Bot,
  AlertTriangle,
  BookmarkCheck,
  Quote,
  Sparkles,
  RefreshCw,
  HelpCircle,
  BookOpen,
  Mic,
  MicOff
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { sampleText } from "@/lib/demo";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  found?: boolean;
  page?: number | null;
  evidence?: string;
  nextStep?: string;
  timestamp: string;
}

function TutorContent() {
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get("topic");

  const [activeDocTitle, setActiveDocTitle] = useState("Introduction to Cell Biology (5 Pages)");
  const [activeDocText, setActiveDocText] = useState(sampleText);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m0",
      sender: "ai",
      text: initialTopic
        ? `Hello! I am your LearnMate Grounded AI Tutor. I see you want to explore "${initialTopic}". Ask me anything and I will answer with verified evidence and page citations!`
        : "Hello! I am your LearnMate Grounded AI Tutor. I answer questions strictly based on your uploaded material. If you ask something outside the document, I will clearly flag it as unavailable.",
      found: true,
      page: null,
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState(initialTopic ? `Explain ${initialTopic} in simple terms` : "");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice typing is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setInput(transcript);
      };

      recognition.onerror = (e: any) => {
        console.warn("Speech recognition error:", e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("Could not start speech recognition:", err);
      setIsListening(false);
    }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem("learnmate_materials");
      if (saved) {
        const list = JSON.parse(saved);
        if (Array.isArray(list) && list.length > 0) {
          let matched = list[0];
          if (initialTopic) {
            const found = list.find((m: any) =>
              m.topics?.some((t: any) => t.name.toLowerCase().includes(initialTopic.toLowerCase()))
            );
            if (found) matched = found;
          }

          if (matched && matched.text) {
            setActiveDocTitle(`${matched.name} (${matched.pages || 1} ${matched.pages === 1 ? "Page" : "Pages"})`);
            setActiveDocText(matched.text);
          }
        }
      }
    } catch (e) {
      console.warn("Could not load active doc for tutor:", e);
    }
  }, [initialTopic]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (questionText?: string) => {
    const q = questionText || input;
    if (!q.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "explain",
          text: activeDocText || sampleText,
          question: q,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const aiReply: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: data.result?.answer || "Explanation complete.",
        found: data.result?.found ?? true,
        page: data.result?.page ?? null,
        evidence: data.result?.evidence || "",
        nextStep: data.result?.nextStep || "Ask another question about this chapter.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "ai",
          text: "I experienced a momentary connection pause. Please try asking again!",
          found: true,
          timestamp: "Just now",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xs font-semibold uppercase tracking-wider text-violet-bright">Grounded AI Tutor</span>
            <span className="w-1.5 h-1.5 rounded-full bg-mint" />
            <span className="text-2xs text-muted">Hallucination Guard Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Ask Your Study Material</h1>
          <p className="text-xs text-muted mt-1">
            Questions are verified strictly against the uploaded text.
          </p>
        </div>

        <Badge variant="mint" className="py-1 px-3">
          <BookOpen size={12} /> Active: {activeDocTitle}
        </Badge>
      </div>

      {/* ── Chat Container ────────────────────────────────────── */}
      <Card className="p-0 overflow-hidden flex flex-col h-[600px] border border-line">
        {/* Messages List */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((m) => {
            const isAi = m.sender === "ai";

            return (
              <div key={m.id} className={`flex items-start gap-3 ${isAi ? "justify-start" : "justify-end"}`}>
                {isAi && (
                  <div className="w-8 h-8 rounded-xl bg-violet-dim/30 border border-violet/40 text-violet-bright flex items-center justify-center shrink-0">
                    <Bot size={16} />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2.5 ${
                    isAi
                      ? m.found === false
                        ? "bg-rose-950/20 border border-rose-500/40 text-rose-200"
                        : "bg-surface border border-line text-slate-200"
                      : "bg-violet text-white"
                  }`}
                >
                  {/* Out of scope warning */}
                  {isAi && m.found === false && (
                    <div className="p-2 rounded-lg bg-rose-500/20 text-rose-300 font-bold text-2xs flex items-center gap-1.5">
                      <AlertTriangle size={14} className="shrink-0" />
                      <span>FACT UNAVAILABLE IN UPLOADED MATERIAL</span>
                    </div>
                  )}

                  <p className="whitespace-pre-line">{m.text}</p>

                  {/* Grounded Citation */}
                  {isAi && m.found && m.page && (
                    <div className="pt-2 border-t border-line/60 flex items-center gap-1.5 text-2xs text-violet-bright font-mono">
                      <BookmarkCheck size={13} />
                      <span>Verified Citation: Page {m.page}</span>
                    </div>
                  )}

                  {/* Direct Quoted Evidence */}
                  {isAi && m.evidence && (
                    <blockquote className="text-2xs text-slate-400 italic bg-ink/60 p-2 rounded-lg border border-line flex items-start gap-1.5">
                      <Quote size={12} className="text-muted shrink-0 mt-0.5" />
                      <span>"{m.evidence}"</span>
                    </blockquote>
                  )}

                  {/* Next Step / Suggested Query */}
                  {isAi && m.nextStep && (
                    <div className="pt-1 text-2xs text-slate-400 flex items-center gap-1">
                      <Sparkles size={11} className="text-amber-400" />
                      <span>Next step: {m.nextStep}</span>
                    </div>
                  )}

                  <div className="text-2xs text-right opacity-50">{m.timestamp}</div>
                </div>

                {!isAi && (
                  <div className="w-8 h-8 rounded-xl bg-surface border border-line text-slate-400 flex items-center justify-center shrink-0">
                    <User size={16} />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-violet-dim/30 border border-violet/40 text-violet-bright flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
              <div className="p-3.5 rounded-2xl bg-surface border border-line text-xs text-muted flex items-center gap-2">
                <RefreshCw size={14} className="animate-spin text-violet" />
                <span>Searching uploaded pages and verifying evidence...</span>
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-surface/80 border-t border-line">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening to your voice... speak now..." : "Ask a question about this material (or click mic to speak)..."}
              className={`input-base text-xs sm:text-sm py-2.5 transition-all ${
                isListening ? "border-rose-500 ring-2 ring-rose-500/20 bg-rose-500/5 placeholder:text-rose-300" : ""
              }`}
            />
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl border transition-all flex items-center justify-center shrink-0 ${
                isListening
                  ? "bg-rose-500 text-white border-rose-600 animate-pulse shadow-glow-sm"
                  : "bg-surface border-line text-slate-400 hover:text-white hover:border-violet/40"
              }`}
              title={isListening ? "Stop listening" : "Click to speak (Voice typing)"}
            >
              {isListening ? <MicOff size={16} className="text-white" /> : <Mic size={16} />}
            </button>
            <Button type="submit" disabled={!input.trim() || loading} size="sm" className="px-4">
              <Send size={15} />
            </Button>
          </form>

          {/* Suggested question chips */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            <span className="text-2xs text-muted">Try asking:</span>
            {[
              "Explain mitochondria in simple language",
              "What is the difference between plant and animal cells?",
              "Explain quantum computing (Test out-of-scope guard)"
            ].map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(s)}
                className="text-2xs px-2.5 py-1 rounded-lg bg-panel border border-line text-slate-300 hover:text-white hover:border-violet/40 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function TutorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-muted text-sm">Loading tutor...</div>}>
      <TutorContent />
    </Suspense>
  );
}
