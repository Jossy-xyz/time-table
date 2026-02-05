import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors",
  {
    variants: {
      intent: {
        neutral: "bg-brick/5 text-institutional-muted border border-brick/10",
        primary: "bg-brick/10 text-brick border border-brick/20",
        success:
          "bg-status-success/10 text-status-success border border-status-success/20",
        warning:
          "bg-status-warning/10 text-status-warning border border-status-warning/20",
        error:
          "bg-status-error/10 text-status-error border border-status-error/20",
        info: "bg-status-info/10 text-status-info border border-status-info/20",
        gold: "bg-gold/10 text-brick-deep border border-gold/30",
      },
      size: {
        sm: "px-2 py-0.5 text-[9px]",
        md: "px-2.5 py-1 text-[10px]",
        lg: "px-3 py-1.5 text-xs",
      },
      interactive: {
        true: "cursor-pointer hover:bg-opacity-20 hover:scale-105 active:scale-95",
        false: "",
      },
    },
    defaultVariants: {
      intent: "neutral",
      size: "md",
      interactive: false,
    },
  },
);

interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  intent,
  size,
  interactive,
  icon,
  children,
  ...props
}) => {
  return (
    <span
      className={cn(badgeVariants({ intent, size, interactive, className }))}
      {...props}
    >
      {icon && <span className="opacity-70">{icon}</span>}
      {children}
    </span>
  );
};
