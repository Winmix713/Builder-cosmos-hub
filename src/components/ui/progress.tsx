import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <div className="relative">
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-[#616266]/20 backdrop-blur-sm shadow-inner shadow-[#131316]/50",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-[#616266] transition-all duration-500 ease-out shadow-sm shadow-[#131316]/30 relative"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      >
        <div className="absolute inset-0 bg-[#131316]/40 mix-blend-soft-light"></div>
      </ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
    <div className="absolute inset-0 bg-[#131316]/20 rounded-full mix-blend-soft-light pointer-events-none"></div>
  </div>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
