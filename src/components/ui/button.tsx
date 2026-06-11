import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "depth-btn-accent text-accent-foreground",
        destructive:
          "bg-gradient-to-b from-red-500 to-red-600 text-destructive-foreground shadow-md shadow-red-500/25 hover:from-red-500/95 hover:to-red-600/95 active:translate-y-px",
        outline:
          "depth-btn-surface border border-border/80 text-foreground hover:text-foreground",
        secondary:
          "depth-btn-surface bg-secondary text-secondary-foreground hover:bg-secondary/90",
        ghost:
          "hover:bg-muted/80 hover:text-foreground hover:shadow-sm active:translate-y-px",
        link: "text-accent underline-offset-4 hover:underline",
        glass:
          "depth-btn-surface border border-border/80 bg-card text-foreground hover:border-accent/40",
      },
      size: {
        default: "h-9 px-3.5 py-2",
        sm: "h-8 rounded-md px-2.5 text-xs",
        lg: "h-10 rounded-lg px-6",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
