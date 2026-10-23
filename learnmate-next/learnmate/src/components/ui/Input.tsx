import * as React from "react";
import { cn } from "@/lib/utils";

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
