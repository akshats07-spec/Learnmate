import React, { useState, useEffect, useRef } from "react";
import {
  Radio,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Sparkles,
  Headphones,
  Lightbulb,
  Globe,
  RefreshCw,
  Users
} from "lucide-react";
import type { StudyMaterial, AudioSummary, AudioSegment } from "../types";
import { apiService } from "../services/apiService";

interface AudioRevisionPlayerProps {
  material: StudyMaterial;
  language: string;
}

export const AudioRevisionPlayer: React.FC<AudioRevisionPlayerProps> = ({
  material,
  language
}) => {
  const [audioSummary, setAudioSummary] = useState<AudioSummary | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSegmentIdx, setActiveSegmentIdx] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const loadAudioSummary = async () => {
    setIsLoading(true);
    stopAudio();
    try {
      const summary = await apiService.generateAudioSummary(material, undefined, language);
      setAudioSummary(summary);
    } catch (err) {
      console.error("Failed to load audio summary:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    loadAudioSummary();
    return () => {
      stopAudio();
    };
  }, [material.id, language]);

  const stopAudio = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
  };

  const playSegment = (index: number) => {
    if (!audioSummary || !synthRef.current) return;
    if (index >= audioSummary.audio_segments.length) {
      setIsPlaying(false);
      setActiveSegmentIdx(0);
      return;
    }

    synthRef.current.cancel();
    setActiveSegmentIdx(index);
    const seg = audioSummary.audio_segments[index];

    const utterance = new SpeechSynthesisUtterance(seg.text);
    utterance.rate = playbackSpeed;
    if (language === "hindi") {
      utterance.lang = "hi-IN";
    }

    // Attempt to select distinct voices for Host Alex vs Host Sam
    const voices = synthRef.current.getVoices();
    if (voices.length > 1) {
      if (seg.speaker.includes("Sam")) {
        utterance.pitch = 1.15;
      } else {
        utterance.pitch = 0.95;
      }
    }

    utterance.onend = () => {
      if (index + 1 < audioSummary.audio_segments.length) {
        playSegment(index + 1);
      } else {
        setIsPlaying(false);
        setActiveSegmentIdx(0);
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    setIsPlaying(true);
    synthRef.current.speak(utterance);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      playSegment(activeSegmentIdx);
    }
  };

  const handleRestart = () => {
    stopAudio();
    setActiveSegmentIdx(0);
    playSegment(0);
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-white">
          Gemini is synthesizing your conversational Audio Overview...
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Generating a dynamic NotebookLM-style 2-minute dialogue tailored to this material
        </p>
      </div>
    );
  }

  if (!audioSummary) return null;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30 flex items-center gap-1">
              <Headphones className="w-3.5 h-3.5" />
              NotebookLM-Style Spoken Revision
            </span>
            <span className="text-xs text-slate-400">
              {audioSummary.duration_seconds} Seconds (~2 Mins)
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {audioSummary.title}
          </h2>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={loadAudioSummary}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Regenerate Script"
          >
            <RefreshCw className="w-4 h-4 text-indigo-400" />
          </button>
        </div>
      </div>

      {/* Modern Audio Player Console */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-purple-950/50 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Player Controls & Info */}
          <div className="flex items-center space-x-5 w-full md:w-auto">
            <button
              onClick={togglePlay}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-xl hover:scale-105 active:scale-95 ${
                isPlaying
                  ? "bg-amber-500 text-slate-950 shadow-amber-500/30"
                  : "bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-indigo-500/30"
              }`}
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 fill-current" />
              ) : (
                <Play className="w-7 h-7 fill-current ml-1" />
              )}
            </button>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Radio className={`w-3.5 h-3.5 ${isPlaying ? "text-rose-400 animate-pulse" : ""}`} />
                  {isPlaying ? "Broadcasting Dialogue" : "Ready to Play"}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Segment {activeSegmentIdx + 1} of {audioSummary.audio_segments.length}
                </span>
              </div>
              <h4 className="text-base font-bold text-white mt-0.5">
                {audioSummary.audio_segments[activeSegmentIdx]?.key_point || "Audio Overview"}
              </h4>
              <p className="text-xs text-slate-400">
                Speaker: <strong className="text-indigo-300">{audioSummary.audio_segments[activeSegmentIdx]?.speaker}</strong>
              </p>
            </div>
          </div>

          {/* Speed & Control Actions */}
          <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
            <button
              onClick={handleRestart}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1.5"
              title="Restart from beginning"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Restart</span>
            </button>

            {/* Playback speed selector */}
            <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1">
              {[1.0, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => {
                    setPlaybackSpeed(speed);
                    if (isPlaying) {
                      stopAudio();
                      playSegment(activeSegmentIdx);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                    playbackSpeed === speed
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Bar of Segments */}
        <div className="grid grid-cols-4 gap-2 mt-6">
          {audioSummary.audio_segments.map((seg, idx) => (
            <button
              key={idx}
              onClick={() => {
                stopAudio();
                playSegment(idx);
              }}
              className={`h-2 rounded-full transition-all ${
                activeSegmentIdx === idx
                  ? "bg-indigo-500 shadow-md shadow-indigo-500/50"
                  : activeSegmentIdx > idx
                  ? "bg-emerald-500/70"
                  : "bg-slate-800"
              }`}
              title={`${seg.speaker}: ${seg.key_point}`}
            />
          ))}
        </div>
      </div>

      {/* Conversational Script Timeline */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-indigo-400" />
          Interactive Dialogue Script (Click Any Turn to Listen)
        </h4>

        <div className="space-y-3">
          {audioSummary.audio_segments.map((seg, idx) => {
            const isActive = activeSegmentIdx === idx;
            const isAlex = seg.speaker.includes("Alex");

            return (
              <div
                key={idx}
                onClick={() => {
                  stopAudio();
                  playSegment(idx);
                }}
                className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                  isActive
                    ? "bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500"
                    : "bg-slate-950/50 border-slate-800/80 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isAlex
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      }`}
                    >
                      {seg.speaker}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {seg.time_range}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {seg.key_point}
                  </span>
                </div>

                <p className="text-slate-200 text-xs sm:text-sm leading-relaxed mt-1">
                  "{seg.text}"
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Memory Mnemonic Card */}
      {audioSummary.memory_mnemonic && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-center space-x-3 shadow-md">
          <Lightbulb className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <strong className="block text-amber-300 font-bold mb-0.5">
              Audio Memory Hook:
            </strong>
            <span>{audioSummary.memory_mnemonic}</span>
          </div>
        </div>
      )}
    </div>
  );
};
