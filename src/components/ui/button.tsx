import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#616266]/60 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-[#616266] text-white shadow-lg shadow-[#131316]/50 hover:bg-[#6a6b70] hover:shadow-xl hover:shadow-[#131316]/70 border border-[#616266]/50",
        destructive:
          "bg-red-500 text-white shadow-lg shadow-[#131316]/50 hover:bg-red-600",
        outline:
          "border border-[#616266]/50 bg-[#616266]/10 text-white/90 shadow-inner shadow-[#131316]/20 hover:bg-[#616266]/20 hover:border-[#616266]/70 backdrop-blur-sm",
        secondary:
          "bg-[#616266]/20 text-white/80 shadow-inner shadow-[#131316]/20 hover:bg-[#616266]/30 backdrop-blur-sm",
        ghost: "text-white/70 hover:bg-[#616266]/20 hover:text-white",
        link: "text-white/70 underline-offset-4 hover:underline hover:text-white",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <>
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
          <div className="absolute inset-0 bg-[#131316]/30 mix-blend-soft-light pointer-events-none rounded-lg"></div>
        </Comp>
      </>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
