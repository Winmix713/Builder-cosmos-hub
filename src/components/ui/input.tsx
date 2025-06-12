import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-lg border border-[#616266]/40 bg-[#616266]/10 px-3 py-2 text-sm text-white/90 placeholder:text-[#616266] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#616266]/60 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-sm transition-all duration-300 hover:border-[#616266]/60 hover:bg-[#616266]/15 shadow-inner shadow-[#131316]/20",
            className,
          )}
          ref={ref}
          {...props}
        />
        <div className="absolute inset-0 bg-[#131316]/30 rounded-lg mix-blend-soft-light pointer-events-none"></div>
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
