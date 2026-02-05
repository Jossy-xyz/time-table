import React from "react";

interface AlertProps {
  type?: "success" | "error" | "warning" | "info";
  message: string;
  onClose?: () => void;
  className?: string;
}

/**
 * Institutional Status Alert
 * Features: Token-driven status colors and high-contrast indicators.
 */
const Alert: React.FC<AlertProps> = ({
  type = "info",
  message,
  onClose,
  className = "",
}) => {
  const typeStyles = {
    success: "bg-status-success/5 border-status-success/20 text-status-success",
    error: "bg-status-error/5 border-status-error/20 text-status-error",
    warning: "bg-status-warning/5 border-status-warning/20 text-status-warning",
    info: "bg-status-info/5 border-status-info/20 text-status-info",
  };

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  return (
    <div
      className={`flex items-center px-6 py-4 rounded-institutional border shadow-sm animate-fadeIn ${typeStyles[type]} ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-current opacity-10 mr-4" />
      <span className="absolute ml-1 mr-4 font-black text-xs">
        {icons[type]}
      </span>
      <p className="flex-1 text-sm font-bold tracking-tight">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-6 w-8 h-8 rounded-institutional hover:bg-current hover:bg-opacity-5 transition-all flex items-center justify-center text-lg"
          aria-label="Acknowledge and clear"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Alert;
