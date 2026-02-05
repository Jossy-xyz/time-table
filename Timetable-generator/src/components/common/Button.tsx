import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outlined" | "brand";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

/**
 * Institutional Button
 * Features: Shiny Gold (Brand), Brick Brown (Primary), and Disciplined interactions.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      disabled = false,
      className = "",
      children,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-bold tracking-tight transition-all duration-300 rounded-institutional focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.97]";

    const variantStyles = {
      // Brick Brown (Primary)
      primary:
        "brand-gradient-panel text-white hover:brightness-110 focus:ring-brick shadow-sm hover:shadow-md",
      // Institutional Gray
      secondary:
        "bg-surface text-institutional-primary border border-brick/10 hover:bg-page focus:ring-brick/20",
      // Academic Red
      danger:
        "bg-status-error text-white hover:brightness-90 focus:ring-status-error/50",
      // Transparent Institutional
      outlined:
        "border-2 border-brick text-brick hover:bg-brick/5 focus:ring-brick dark:border-white dark:text-white dark:hover:bg-white/5",
      // Shiny Gold (Bells Striker Style)
      brand:
        "bg-gradient-to-br from-gold to-gold-deep text-brick-deep shadow-[0_4px_12px_rgba(255,184,0,0.3)] hover:shadow-[0_6px_20px_rgba(255,184,0,0.4)] hover:-translate-y-0.5",
    };

    const sizeStyles = {
      sm: "px-4 py-1.5 text-xs uppercase tracking-widest",
      md: "px-6 py-2.5 text-sm",
      lg: "px-8 py-3.5 text-base",
    };

    const buttonClass = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${
      disabled
        ? "opacity-50 cursor-not-allowed grayscale pointer-events-none"
        : ""
    } ${className}`;

    return (
      <button ref={ref} disabled={disabled} className={buttonClass} {...props}>
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
