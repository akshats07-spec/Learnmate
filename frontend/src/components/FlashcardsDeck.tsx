import React, { useState } from "react";
import {
  Layers,
  RotateCw,
  CheckCircle2,
  XCircle,
  BookmarkCheck,
  Sparkles,
  Shuffle,
  RotateCcw
} from "lucide-react";
import type { Flashcard } from "../types";
import { SAMPLE_FLASHCARDS } from "../services/sampleData";

export const FlashcardsDeck: React.FC = () => {
  const [cards, setCards] = useState<Flashcard[]>(SAMPLE_FLASHCARDS);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = cards[currentIdx];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIdx((i) => (i + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIdx((i) => (i - 1 + cards.length) % cards.length);
  };

  const handleMarkMastered = (mastered: boolean) => {
    const updated = [...cards];
    updated[currentIdx].mastered = mastered;
    setCards(updated);
    handleNext();
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    setCards([...cards].sort(() => Math.random() - 0.5));
    setCurrentIdx(0);
  };

  const handleReset = () => {
    setIsFlipped(false);
    setCards(SAMPLE_FLASHCARDS);
    setCurrentIdx(0);
  };

  const masteredCount = cards.filter((c) => c.mastered).length;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              Active Recall Engine
            </span>
            <span className="text-xs text-slate-400">
              Card {currentIdx + 1} of {cards.length}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Leitner Spaced Repetition Flashcards
          </h2>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleShuffle}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Shuffle</span>
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Reset deck"
          >
            <RotateCcw className="w-4 h-4 text-indigo-400" />
          </button>
        </div>
      </div>

      {/* Mastery Progress Bar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400 font-semibold">
          Deck Mastery: <strong className="text-white">{masteredCount} / {cards.length} Cards</strong>
        </span>
        <div className="w-48 bg-slate-800 rounded-full h-2">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(masteredCount / cards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 3D Flashcard Container */}
      <div className="flex justify-center py-4">
        <div
          onClick={handleFlip}
          className="w-full max-w-xl h-80 cursor-pointer perspective-1000 select-none"
        >
          <div
            className={`relative w-full h-full rounded-3xl transition-transform duration-500 transform-style-3d shadow-2xl border ${
              isFlipped
                ? "rotate-y-180 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border-indigo-500/40"
                : "bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border-slate-800"
            }`}
          >
            {/* Front Side */}
            <div
              className={`absolute inset-0 p-8 flex flex-col justify-between backface-hidden ${
                isFlipped ? "pointer-events-none" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 font-mono text-[11px] font-bold border border-indigo-500/30">
                  {currentCard.topic}
                </span>
                <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                  <BookmarkCheck className="w-3.5 h-3.5 text-indigo-400" />
                  {currentCard.page_reference}
                </span>
              </div>

              <div className="my-auto text-center space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Question / Concept
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                  {currentCard.front}
                </h3>
              </div>

              <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
                <span>Click to reveal answer & explanation</span>
              </div>
            </div>

            {/* Back Side */}
            <div
              className={`absolute inset-0 p-8 flex flex-col justify-between rotate-y-180 backface-hidden ${
                !isFlipped ? "pointer-events-none" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold border border-emerald-500/30">
                  Answer & Key Takeaway
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {currentCard.page_reference}
                </span>
              </div>

              <div className="my-auto text-center space-y-2">
                <p className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                  {currentCard.back}
                </p>
              </div>

              <div className="text-center text-xs text-slate-400">
                Click again to flip back
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flashcard Action Buttons */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={() => handleMarkMastered(false)}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-rose-500 text-rose-300 text-xs font-semibold transition-all hover:bg-rose-950/20"
        >
          <XCircle className="w-4 h-4 text-rose-400" />
          <span>Still Learning</span>
        </button>

        <button
          onClick={handlePrev}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
        >
          Prev
        </button>

        <button
          onClick={handleNext}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
        >
          Next
        </button>

        <button
          onClick={() => handleMarkMastered(true)}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all hover:scale-102"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Mastered It!</span>
        </button>
      </div>
    </div>
  );
};
