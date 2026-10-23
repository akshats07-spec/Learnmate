"use client";
import Link from "next/link";
import { useState } from "react";
import {
  BookOpen, Brain, Menu, X, Sparkles,
  ChevronRight, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "#faq" },
];

export function MarketingNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-line/60 bg-ink/80 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-gradient text-white shadow-glow-sm">
            <BookOpen size={15} strokeWidth={2.5} />
          </span>
          <span className="text-lg font-semibold tracking-tight text-heading group-hover:gradient-text transition-all">
            LearnMate
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(l => (
            <Link key={l.label} href={l.href}
              className="text-sm text-muted hover:text-heading transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="btn-ghost focus-ring rounded-lg px-4 py-2 text-sm font-medium">
            Log in
          </Link>
          <Link href="/signup"
            className="btn-primary focus-ring flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium">
            Get started <ChevronRight size={14} />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)}
          className="md:hidden focus-ring rounded-lg p-2 text-muted hover:text-heading"
          aria-label="Toggle navigation">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-line bg-panel/95 backdrop-blur-md animate-slide-up">
          <div className="container-page py-4 space-y-1">
            {NAV_LINKS.map(l => (
              <Link key={l.label} href={l.href} onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm text-muted hover:text-heading hover:bg-white/[.04] transition-colors">
                {l.label}
              </Link>
            ))}
            <div className="pt-3 mt-2 border-t border-line flex flex-col gap-2">
              <Link href="/login" onClick={() => setOpen(false)}
                className="btn-ghost focus-ring rounded-lg px-3 py-2.5 text-sm font-medium text-center">
                Log in
              </Link>
              <Link href="/signup" onClick={() => setOpen(false)}
                className="btn-primary focus-ring rounded-lg px-3 py-2.5 text-sm font-medium text-center">
                Get started free
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
