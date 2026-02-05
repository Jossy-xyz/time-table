import React from "react";

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: "elevated" | "flat" | "glass";
  style?: React.CSSProperties;
}

/**
 * Institutional Premium Card
 * Features: Disciplined geometry, soft institutional shadows, academic contrast.
 */
const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  className = "",
  onClick,
  variant = "elevated",
  style,
}) => {
  const variantStyles = {
    elevated:
      "bg-surface shadow-[0_4px_20px_rgba(166,118,96,0.08)] border border-brick/5",
    flat: "bg-surface border border-brick/10",
    glass: "bg-white/70 backdrop-blur-md border border-white/20 shadow-lg",
  };

  return (
    <div
      className={`rounded-institutional p-6 transition-all duration-300 ${variantStyles[variant]} ${
        onClick
          ? "cursor-pointer hover:translate-y-[-4px] hover:shadow-lg active:scale-[0.98]"
          : ""
      } ${className}`}
      onClick={onClick}
      style={style}
    >
      {title && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-institutional-primary tracking-tight leading-none mb-2">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-institutional-muted uppercase tracking-widest font-bold">
              {subtitle}
            </p>
          )}
          <div className="mt-4 h-[1px] w-full bg-gradient-to-r from-brick/20 to-transparent" />
        </div>
      )}
      <div className="text-institutional-secondary leading-relaxed">
        {children}
      </div>
    </div>
  );
};

export default Card;
