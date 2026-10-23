// ──────────────────────────────────────────────────────────────
// Utility helpers — cn() for class merging, plan config, misc
// ──────────────────────────────────────────────────────────────
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function formatRelative(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days}d ago`;
  return formatDate(dateStr);
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function masteryColor(mastery: number) {
  if (mastery >= 80) return "bg-mint";
  if (mastery >= 50) return "bg-violet";
  if (mastery >= 30) return "bg-amber-500";
  return "bg-rose-500";
}

export function masteryLabel(mastery: number) {
  if (mastery >= 80) return "Mastered";
  if (mastery >= 50) return "Familiar";
  if (mastery >= 30) return "Learning";
  return "Needs review";
}
