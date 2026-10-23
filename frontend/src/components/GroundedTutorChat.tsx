import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  AlertTriangle,
  BookmarkCheck,
  Quote,
  Sparkles,
  HelpCircle,
  RefreshCw,
  MessageSquare
} from "lucide-react";
import type { StudyMaterial, ChatMessage } from "../types";
import { apiService } from "../services/apiService";

interface GroundedTutorChatProps {
  material: StudyMaterial;
  language: string;
}

export const GroundedTutorChat: React.FC<GroundedTutorChatProps> = ({
  material,
  language
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "ai",
      text: `Hello! I am your LearnMate Grounded AI Tutor. I answer questions strictly based on "${material.title}". If you ask about something not present in your document, I will clearly flag it as out of scope.`,
      is_out_of_scope: false,
      page_reference: "Covered in Document",
      suggested_questions: [
        "What is the net ATP yield of Glycolysis?",
        "What is the role of Oxygen at Complex IV?",
        "Explain photosynthesis (Demonstrates Out-Of-Scope Guard)"
      ],
      timestamp: "Just now"
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const question = textToSend || inputQuestion;
    if (!question.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: "u-" + Date.now(),
      sender: "user",
      text: question,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion("");
    setIsLoading(true);

    try {
      const aiReply = await apiService.groundedChat(material, question, language);
      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          sender: "ai",
          text: "An error occurred while grounding the answer. Please try again.",
          is_out_of_scope: false,
          timestamp: "Just now"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Grounded AI Tutor & Hallucination Guard
            </span>
            <span className="text-xs text-slate-400">
              Strictly references {material.pages.length} Pages
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Ask Any Question with Verified Citations
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Hallucination Guard Active
          </span>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl flex flex-col h-[560px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isAi = msg.sender === "ai";

            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${isAi ? "justify-start" : "justify-end"}`}
              >
                {isAi && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm shadow-md transition-all ${
                    isAi
                      ? msg.is_out_of_scope
                        ? "bg-rose-950/30 border border-rose-500/40 text-rose-200"
                        : "bg-slate-950/80 border border-slate-800 text-slate-200"
                      : "bg-indigo-600 text-white"
                  }`}
                >
                  {/* Out of Scope Warning Badge */}
                  {isAi && msg.is_out_of_scope && (
                    <div className="mb-2 p-2 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-[11px] flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>UNAVAILABLE IN UPLOADED MATERIAL</span>
                    </div>
                  )}

                  {/* Message Body */}
                  <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>

                  {/* Page Citation & Quoted Evidence for In-Scope Answers */}
                  {isAi && !msg.is_out_of_scope && msg.page_reference && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5">
                      <div className="flex items-center space-x-1.5 text-[11px] font-mono font-bold text-indigo-400">
                        <BookmarkCheck className="w-3.5 h-3.5" />
                        <span>Source Citation: {msg.page_reference}</span>
                      </div>
                      {msg.quoted_evidence && (
                        <blockquote className="text-[11px] text-slate-400 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800 flex items-start space-x-1.5">
                          <Quote className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                          <span>"{msg.quoted_evidence}"</span>
                        </blockquote>
                      )}
                    </div>
                  )}

                  {/* Quick Suggested Follow-Up Questions */}
                  {isAi && msg.suggested_questions && msg.suggested_questions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/60">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5">
                        Suggested Follow-Up Queries:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggested_questions.map((sq, sqIdx) => (
                          <button
                            key={sqIdx}
                            onClick={() => handleSendMessage(sq)}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-300 transition-colors"
                          >
                            {sq}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-1 text-[10px] text-right opacity-60">
                    {msg.timestamp}
                  </div>
                </div>

                {!isAi && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 flex items-center space-x-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                <span>Searching uploaded pages and verifying evidence...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder="Ask a question about your uploaded document (or test an out-of-scope question)..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!inputQuestion.trim() || isLoading}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white shadow-md shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
