import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-bold tracking-tight transition-all duration-300 rounded-institutional focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-br from-brick to-brick-deep text-white hover:brightness-110 focus:ring-brick shadow-sm hover:shadow-md",
        secondary:
          "bg-surface text-institutional-primary border border-brick/10 hover:bg-page focus:ring-brick/20",
        danger:
          "bg-status-error text-white hover:brightness-90 focus:ring-status-error/50",
        ghost: "hover:bg-brick/5 text-institutional-primary",
        link: "text-brick underline-offset-4 hover:underline",
        brand:
          "bg-gradient-to-br from-gold to-gold-deep text-brick-deep shadow-lg hover:shadow-xl hover:-translate-y-0.5 border border-gold-deep/20",
        outline:
          "border-2 border-brick text-brick hover:bg-brick/5 focus:ring-brick",
      },
      size: {
        sm: "px-4 py-1.5 text-xs uppercase tracking-widest",
        md: "px-6 py-2.5 text-sm",
        lg: "px-8 py-3.5 text-base",
        icon: "h-10 w-10 p-0 items-center justify-center",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
