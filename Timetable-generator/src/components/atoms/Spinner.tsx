import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const spinnerVariants = cva("animate-spin rounded-full border-2", {
  variants: {
    variant: {
      primary: "border-brick border-t-transparent",
      white: "border-white/30 border-t-white",
      gold: "border-gold border-t-transparent",
    },
    size: {
      sm: "h-4 w-4 border-2",
      md: "h-6 w-6 border-2",
      lg: "h-8 w-8 border-3",
      xl: "h-12 w-12 border-4",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

export interface SpinnerProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {}

export const Spinner: React.FC<SpinnerProps> = ({
  className,
  variant,
  size,
  ...props
}) => {
  return (
    <div
      className={spinnerVariants({ variant, size, className })}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
