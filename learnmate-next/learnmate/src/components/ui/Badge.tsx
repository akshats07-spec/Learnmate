import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "violet" | "mint" | "amber" | "rose" | "sky" | "slate";
}

export function Badge({ className, variant = "violet", children, ...props }: BadgeProps) {
  const variants = {
    violet: "badge-violet",
    mint: "badge-mint",
    amber: "badge-amber",
    rose: "badge-rose",
    sky: "badge-sky",
    slate: "bg-white/[.06] text-slate-400 border border-line",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-tight",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && <label className="block text-xs font-medium text-slate-300">{label}</label>}
        <input
          ref={ref}
          className={cn(
            "input-base",
            error && "border-rose-500/50 focus:border-rose-500",
            className
          )}
          {...props}
        />
        {error && <p className="text-2xs text-rose-400">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
